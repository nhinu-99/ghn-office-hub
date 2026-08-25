require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cấu hình kết nối PostgreSQL (Neon DB)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Lỗi kết nối PostgreSQL Pool:', err);
});

// Khởi tạo bảng cơ sở dữ liệu nếu chưa tồn tại
async function initDatabase() {
  try {
    const client = await pool.connect();
    try {
      console.log('🔄 Đang kiểm tra và khởi tạo cấu trúc bảng PostgreSQL...');
      
      // Bảng lưu trữ trạng thái dữ liệu chính (dạng key-value JSONB)
      await client.query(`
        CREATE TABLE IF NOT EXISTS ghn_app_state (
          key VARCHAR(100) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Bảng lưu trữ lịch sử các bản sao lưu (backups)
      await client.query(`
        CREATE TABLE IF NOT EXISTS ghn_backups (
          id SERIAL PRIMARY KEY,
          snapshot_at BIGINT NOT NULL,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ Cơ sở dữ liệu PostgreSQL đã sẵn sàng!');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Lỗi khởi tạo cơ sở dữ liệu:', err.message);
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as now, version() as version');
    res.json({
      status: 'ok',
      service: 'GHN Office Hub API',
      database: 'connected',
      engine: 'PostgreSQL (Neon DB)',
      serverTime: dbRes.rows[0].now,
      version: dbRes.rows[0].version
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// 2. Lấy toàn bộ dữ liệu ứng dụng
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM ghn_app_state');
    const data = {};
    let latestUpdate = 0;

    result.rows.forEach(row => {
      data[row.key] = row.value;
      const t = new Date(row.updated_at).getTime();
      if (t > latestUpdate) latestUpdate = t;
    });

    data.__updatedAt = latestUpdate;
    res.json(data);
  } catch (err) {
    console.error('Lỗi khi đọc dữ liệu từ DB:', err);
    res.status(500).json({ error: 'Không thể đọc dữ liệu từ máy chủ', details: err.message });
  }
});

// 3. Cập nhật một key cụ thể (ví dụ: orders, inspections, departments, staff, ...)
app.put('/api/data/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Thiếu trường value trong body' });
  }

  try {
    const query = `
      INSERT INTO ghn_app_state (key, value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      RETURNING key, updated_at;
    `;
    const result = await pool.query(query, [key, JSON.stringify(value)]);
    res.json({ success: true, key, updated_at: result.rows[0].updated_at });
  } catch (err) {
    console.error(`Lỗi cập nhật key "${key}":`, err);
    res.status(500).json({ error: `Không thể lưu key "${key}"`, details: err.message });
  }
});

// 4. Cập nhật hàng loạt (Bulk upsert)
app.post('/api/data/bulk', async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(payload)) {
      if (key.startsWith('__')) continue;
      await client.query(`
        INSERT INTO ghn_app_state (key, value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      `, [key, JSON.stringify(value)]);
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Đã cập nhật toàn bộ dữ liệu thành công' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Lỗi cập nhật hàng loạt:', err);
    res.status(500).json({ error: 'Lỗi cập nhật hàng loạt', details: err.message });
  } finally {
    client.release();
  }
});

// 5. Tạo bản sao lưu (Backup)
app.post('/api/backup', async (req, res) => {
  const { payload, snapshotAt } = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Thiếu dữ liệu payload' });
  }

  const stamp = snapshotAt || Date.now();
  try {
    const result = await pool.query(`
      INSERT INTO ghn_backups (snapshot_at, payload, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, snapshot_at, created_at;
    `, [stamp, JSON.stringify(payload)]);

    res.json({ success: true, backup: result.rows[0] });
  } catch (err) {
    console.error('Lỗi khi tạo backup:', err);
    res.status(500).json({ error: 'Không thể tạo bản sao lưu', details: err.message });
  }
});

// 6. Lấy bản sao lưu gần nhất
app.get('/api/backup/latest', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, snapshot_at, payload, created_at
      FROM ghn_backups
      ORDER BY snapshot_at DESC
      LIMIT 1;
    `);

    if (result.rows.length === 0) {
      return res.json({ success: true, backup: null });
    }

    res.json({ success: true, backup: result.rows[0] });
  } catch (err) {
    console.error('Lỗi khi đọc backup gần nhất:', err);
    res.status(500).json({ error: 'Không thể lấy bản sao lưu', details: err.message });
  }
});

let isDbInitialized = false;
let dbInitPromise = null;
async function ensureDbInit() {
  if (isDbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().then(() => {
      isDbInitialized = true;
    }).catch(err => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

// Middleware đảm bảo Database đã được khởi tạo trước khi xử lý API
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await ensureDbInit();
    } catch (e) {
      console.error('DB Init Middleware Error:', e.message);
    }
  }
  next();
});

// -------------------------------------------------------------
// PHỤC VỤ STATIC FILES
// -------------------------------------------------------------
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi động server khi chạy trực tiếp (Localhost / Render / VPS)
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server GHN Office Hub đang chạy tại: http://localhost:${PORT}`);
    await ensureDbInit();
  });
}

// Export cho Vercel Serverless Function
module.exports = app;
