const { Pool } = require('pg');

const OLD_DB_URL = 'postgresql://neondb_owner:npg_n10SxZINCFEd@ep-billowing-block-aypvfvmu-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const NEW_DB_URL = 'postgresql://neondb_owner:npg_0p1zKbZolHhu@ep-bitter-salad-b39q0ymr-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function mergeDatabases() {
  console.log('🔄 Đang kết nối tới Database CŨ và MỚI...');

  const oldPool = new Pool({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
  const newPool = new Pool({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    // Lấy toàn bộ dữ liệu từ 2 DB
    console.log('📦 Đang đọc dữ liệu từ Database CŨ...');
    const oldRows = (await oldPool.query("SELECT key, value FROM ghn_app_state")).rows;
    const oldData = {};
    oldRows.forEach(r => oldData[r.key] = r.value);

    console.log('📦 Đang đọc dữ liệu từ Database MỚI...');
    const newRows = (await newPool.query("SELECT key, value FROM ghn_app_state")).rows;
    const newData = {};
    newRows.forEach(r => newData[r.key] = r.value);

    // 1. Gộp đơn hàng (ORDERS)
    const oldOrders = Array.isArray(oldData.orders) ? oldData.orders : [];
    const newOrders = Array.isArray(newData.orders) ? newData.orders : [];
    const orderMap = new Map();
    oldOrders.forEach(o => { if (o && o.id) orderMap.set(o.id, o); });
    newOrders.forEach(o => { if (o && o.id) orderMap.set(o.id, o); });
    const mergedOrders = Array.from(orderMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // 2. Gộp chỉnh sửa sản phẩm (PRODUCT_EDITS: giá mới, tên mới)
    const mergedProductEdits = Object.assign({}, oldData.productEdits || {}, newData.productEdits || {});

    // 3. Gộp sản phẩm thêm mới (PRODUCT_ADDED)
    const oldProdAdded = Array.isArray(oldData.productAdded) ? oldData.productAdded : [];
    const newProdAdded = Array.isArray(newData.productAdded) ? newData.productAdded : [];
    const prodAddedMap = new Map();
    oldProdAdded.forEach(p => { if (p && p.ma) prodAddedMap.set(p.ma, p); });
    newProdAdded.forEach(p => { if (p && p.ma) prodAddedMap.set(p.ma, p); });
    const mergedProductAdded = Array.from(prodAddedMap.values());

    // 4. Gộp sản phẩm đã xoá (PRODUCT_DELETED)
    const mergedProductDeleted = Array.from(new Set([
      ...(Array.isArray(oldData.productDeleted) ? oldData.productDeleted : []),
      ...(Array.isArray(newData.productDeleted) ? newData.productDeleted : [])
    ]));

    // 5. Gộp danh mục (CATEGORY_EDITS, CATEGORY_ADDED)
    const mergedCatEdits = Object.assign({}, oldData.catEdits || {}, newData.catEdits || {});
    const mergedZoneEdits = Object.assign({}, oldData.zoneEdits || {}, newData.zoneEdits || {});

    console.log(`✅ Kết quả gộp:`);
    console.log(`- Đơn hàng: ${mergedOrders.length}`);
    console.log(`- Sản phẩm đổi giá (productEdits): ${Object.keys(mergedProductEdits).length}`);
    console.log(`- Sản phẩm mới tạo (productAdded): ${mergedProductAdded.length}`);

    // Ghi vào Database Mới
    const updates = {
      orders: mergedOrders,
      productEdits: mergedProductEdits,
      productAdded: mergedProductAdded,
      productDeleted: mergedProductDeleted,
      catEdits: mergedCatEdits,
      zoneEdits: mergedZoneEdits
    };

    for (const [key, val] of Object.entries(updates)) {
      await newPool.query(`
        INSERT INTO ghn_app_state (key, value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      `, [key, JSON.stringify(val)]);
    }

    console.log('🚀 ĐÃ HOÀN TẤT GỘP TOÀN BỘ DỮ LIỆU VÀO DATABASE MỚI!');
  } catch (err) {
    console.error('❌ Lỗi trong quá trình gộp:', err.message);
  } finally {
    await oldPool.end();
    await newPool.end();
  }
}

mergeDatabases();
