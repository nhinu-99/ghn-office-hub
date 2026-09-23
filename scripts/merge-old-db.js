const { Pool } = require('pg');

const OLD_DB_URL = 'postgresql://neondb_owner:npg_n10SxZINCFEd@ep-billowing-block-aypvfvmu-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const NEW_DB_URL = 'postgresql://neondb_owner:npg_0p1zKbZolHhu@ep-bitter-salad-b39q0ymr-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function mergeDatabases() {
  console.log('🔄 Đang kết nối tới Database CŨ và MỚI...');

  const oldPool = new Pool({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
  const newPool = new Pool({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Đọc orders từ Database Cũ
    console.log('📦 Đang đọc đơn hàng từ Database CŨ...');
    const oldRes = await oldPool.query("SELECT value FROM ghn_app_state WHERE key = 'orders'");
    const oldOrders = (oldRes.rows[0] && Array.isArray(oldRes.rows[0].value)) ? oldRes.rows[0].value : [];
    console.log(`✅ Tìm thấy ${oldOrders.length} đơn hàng trong Database CŨ.`);

    // 2. Đọc orders từ Database Mới
    console.log('📦 Đang đọc đơn hàng từ Database MỚI...');
    const newRes = await newPool.query("SELECT value FROM ghn_app_state WHERE key = 'orders'");
    const newOrders = (newRes.rows[0] && Array.isArray(newRes.rows[0].value)) ? newRes.rows[0].value : [];
    console.log(`✅ Tìm thấy ${newOrders.length} đơn hàng trong Database MỚI.`);

    // 3. Gộp các đơn hàng theo ID (không trùng lặp, giữ lại toàn bộ đơn)
    const orderMap = new Map();
    // Nạp đơn từ DB cũ trước
    oldOrders.forEach(o => { if (o && o.id) orderMap.set(o.id, o); });
    // Nạp đơn từ DB mới (nếu trùng ID thì ưu tiên bản mới nhất)
    newOrders.forEach(o => { if (o && o.id) orderMap.set(o.id, o); });

    const mergedOrders = Array.from(orderMap.values());
    // Sắp xếp theo ngày giảm dần (đơn mới nhất lên đầu)
    mergedOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    console.log(`🎉 Tổng số đơn hàng sau khi gộp: ${mergedOrders.length} đơn hàng.`);

    // 4. Lưu danh sách đã gộp vào Database Mới
    await newPool.query(`
      INSERT INTO ghn_app_state (key, value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `, ['orders', JSON.stringify(mergedOrders)]);

    console.log('🚀 ĐÃ LƯU THÀNH CÔNG VÀO DATABASE MỚI!');
  } catch (err) {
    console.error('❌ Lỗi trong quá trình gộp:', err.message);
  } finally {
    await oldPool.end();
    await newPool.end();
  }
}

mergeDatabases();
