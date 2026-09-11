/* ============================================================
   PHÂN HỆ QUẢN LÝ CHI PHÍ VĂN PHÒNG (OFFICE EXPENSES MODULE)
   Hệ thống Quản lý Hành chính & Chi phí GHN Office Hub
   ============================================================ */

// ─── Danh mục & Nhà cung cấp mặc định (Trống, không dùng dữ liệu mẫu) ───
const DEFAULT_OFFICE_SUPPLIERS = [];
const DEFAULT_OFFICE_EXPENSES = [];

// Biến trạng thái toàn cục phân hệ
let OFFICE_SUPPLIERS = [];
let OFFICE_EXPENSES = [];

let expTrendChartInstance = null;
let expCategoryChartInstance = null;
let expSupplierChartInstance = null;

let expCurrentDetailId = null;
let expensesEventsBound = false;

// ─── Khởi tạo từ Cloud / LocalStorage & Dọn sạch dữ liệu mẫu cũ ───
window.initOfficeExpensesFromCloud = function(raw, persistDefaults){
  raw = raw || {};

  // Danh mục mã/ID dữ liệu mẫu tĩnh cũ cần dọn
  const MOCK_SUPPLIER_IDS = new Set(['sup-evn', 'sup-sawaco', 'sup-viettel', 'sup-building', 'sup-daikin', 'sup-green', 'sup-lavie']);
  const MOCK_EXPENSE_CODES = new Set(['EXP-2609-001','EXP-2609-002','EXP-2609-003','EXP-2609-004','EXP-2609-005','EXP-2609-006','EXP-2609-007','EXP-2608-001','EXP-2608-002','EXP-2608-003','EXP-2608-004','EXP-2608-005','EXP-2607-001','EXP-2607-002','EXP-2606-001','EXP-2605-001','EXP-2604-001','EXP-2603-001','EXP-2602-001','EXP-2601-001','EXP-2501','EXP-2502','EXP-2503','EXP-2504','EXP-2505','EXP-2506','EXP-2507','EXP-2508','EXP-2509','EXP-2510','EXP-2511','EXP-2512']);

  if(Array.isArray(raw.officeExpenses)){
    OFFICE_EXPENSES = raw.officeExpenses.filter(e => !MOCK_EXPENSE_CODES.has(e.code) && !MOCK_EXPENSE_CODES.has(e.id));
  } else {
    try {
      const local = JSON.parse(localStorage.getItem('officeExpenses_v2') || '[]');
      OFFICE_EXPENSES = Array.isArray(local) ? local : [];
    } catch(e){
      OFFICE_EXPENSES = [];
    }
  }

  // Chuẩn hóa dữ liệu cũ: chuyển Cây xanh & Cảnh quan về Thuê Cây Xanh, chuyển step 5 về 4
  if(Array.isArray(OFFICE_EXPENSES)){
    OFFICE_EXPENSES.forEach(e => {
      if(e.category && (e.category.toLowerCase().includes('cảnh quan') || e.category.toLowerCase().includes('canh quan'))){
        e.category = 'Thuê Cây Xanh';
      }
      if(e.step === 5 || e.step === '5'){
        e.step = 4;
      }
    });
  }

  if(Array.isArray(raw.officeSuppliers)){
    OFFICE_SUPPLIERS = raw.officeSuppliers.filter(s => !MOCK_SUPPLIER_IDS.has(s.id));
  } else {
    try {
      const local = JSON.parse(localStorage.getItem('officeSuppliers_v2') || '[]');
      OFFICE_SUPPLIERS = Array.isArray(local) ? local : [];
    } catch(e){
      OFFICE_SUPPLIERS = [];
    }
  }
};

// Tự động kiểm tra và đồng bộ nếu remoteData đã tải xong từ server
if(typeof window !== 'undefined' && window.__GHN_LATEST_REMOTE_DATA__){
  window.initOfficeExpensesFromCloud(window.__GHN_LATEST_REMOTE_DATA__, false);
}

function ensureOfficeExpensesData(){
  if(!Array.isArray(OFFICE_EXPENSES)) OFFICE_EXPENSES = [];
  if(!Array.isArray(OFFICE_SUPPLIERS)) OFFICE_SUPPLIERS = [];
}

function saveOfficeExpenses(){
  if(typeof cloudSet === 'function') cloudSet('officeExpenses', OFFICE_EXPENSES);
  try {
    localStorage.setItem('officeExpenses_v2', JSON.stringify(OFFICE_EXPENSES));
  } catch(e){}
}

function saveOfficeSuppliers(){
  if(typeof cloudSet === 'function') cloudSet('officeSuppliers', OFFICE_SUPPLIERS);
  try {
    localStorage.setItem('officeSuppliers_v2', JSON.stringify(OFFICE_SUPPLIERS));
  } catch(e){}
}

// ─── Helper Functions ───
function getStepInfo(step){
  step = String(step);
  switch(step){
    case '1':
      return { num: 1, label: 'B1: Tiếp nhận đề xuất', cls: 'exp-status-1', desc: 'Đã tiếp nhận đề xuất & hóa đơn' };
    case '2':
      return { num: 2, label: 'B2: HC đối soát', cls: 'exp-status-2', desc: 'Hành chính đối soát chỉ số & hợp đồng' };
    case '3':
      return { num: 3, label: 'B3: Kế toán kiểm tra', cls: 'exp-status-3', desc: 'Kế toán rà soát thuế & lập đề nghị chi' };
    case '4':
    case '5':
      return { num: 4, label: 'B4: Đã thanh toán', cls: 'exp-status-5', desc: 'Đã hoàn tất thanh toán ủy nhiệm chi' };
    case 'pending':
      return { num: 0, label: '⏸ Pending', cls: 'exp-status-pending', desc: 'Khoản chi đang được tạm hoãn / chờ xử lý' };
    case 'rejected':
      return { num: 0, label: '✕ Đã từ chối', cls: 'exp-status-rej', desc: 'Đề xuất chi phí bị từ chối / hủy bỏ' };
    default:
      return { num: 1, label: 'B1: Tiếp nhận', cls: 'exp-status-1', desc: '' };
  }
}

window.closeModal = function(modalId){
  const el = document.getElementById(modalId);
  if(el){
    el.classList.remove('show');
    el.style.display = 'none';
  }
};

window.openModal = function(modalId){
  const el = document.getElementById(modalId);
  if(el){
    el.classList.add('show');
    el.style.display = 'flex';
  }
};

// ─── Khởi động trang & Sự kiện ───
window.renderExpensesPage = function(){
  if((!OFFICE_EXPENSES || !OFFICE_EXPENSES.length) && typeof window !== 'undefined' && window.__GHN_LATEST_REMOTE_DATA__){
    window.initOfficeExpensesFromCloud(window.__GHN_LATEST_REMOTE_DATA__, false);
  }
  ensureOfficeExpensesData();
  setupExpensesEventsOnce();
  populateExpenseDropdowns();

  const activeSubBtn = document.querySelector('#expensesSubNav button.active');
  const sub = activeSubBtn ? activeSubBtn.dataset.sub : 'list';

  if(sub === 'list') renderExpenseList();
  else if(sub === 'analytics') renderExpenseAnalytics();
  else if(sub === 'suppliers') renderSuppliersList();
};

function setupExpensesEventsOnce(){
  if(expensesEventsBound) return;
  expensesEventsBound = true;

  // Setup Sub Navigation
  if(typeof setupSubNav === 'function'){
    setupSubNav('expensesSubNav', 'exp', (sub)=>{
      if(sub === 'list') renderExpenseList();
      else if(sub === 'analytics') renderExpenseAnalytics();
      else if(sub === 'suppliers') renderSuppliersList();
    });
  }

  // Analytics Filter events
  const anYear = document.getElementById('expAnalyticsYearSelect');
  const anMonth = document.getElementById('expAnalyticsMonthSelect');
  if(anYear) anYear.addEventListener('change', renderExpenseAnalytics);
  if(anMonth) anMonth.addEventListener('change', renderExpenseAnalytics);

  // List Filter events
  const filterInputs = ['expFilterYear', 'expFilterMonth', 'expFilterCategory', 'expFilterStep', 'expSearchInput'];
  filterInputs.forEach(id=>{
    const el = document.getElementById(id);
    if(el){
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', renderExpenseList);
    }
  });

  // Reset Filter Button
  const resetBtn = document.getElementById('expResetFilterBtn');
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      const sInp = document.getElementById('expSearchInput'); if(sInp) sInp.value = '';
      const fYear = document.getElementById('expFilterYear'); if(fYear) fYear.value = 'all';
      const fMonth = document.getElementById('expFilterMonth'); if(fMonth) fMonth.value = 'all';
      const fCat = document.getElementById('expFilterCategory'); if(fCat) fCat.value = 'all';
      const fStep = document.getElementById('expFilterStep'); if(fStep) fStep.value = 'all';
      renderExpenseList();
    });
  }

  // Supplier Search
  const supSearch = document.getElementById('expSupplierSearchInput');
  if(supSearch) supSearch.addEventListener('input', renderSuppliersList);

  // Detail Modal Advance / Reject
  const btnAdvance = document.getElementById('expDetailAdvanceBtn');
  if(btnAdvance) btnAdvance.addEventListener('click', handleAdvanceDetailStep);

  const btnReject = document.getElementById('expDetailRejectBtn');
  if(btnReject) btnReject.addEventListener('click', handleRejectDetailStep);

  const btnEditDetail = document.getElementById('expDetailEditBtn');
  if(btnEditDetail) btnEditDetail.addEventListener('click', ()=>{
    if(expCurrentDetailId){
      window.closeModal('expModalExpenseDetail');
      window.openEditExpenseModal(expCurrentDetailId);
    }
  });

  const btnDeleteDetail = document.getElementById('expDetailDeleteBtn');
  if(btnDeleteDetail) btnDeleteDetail.addEventListener('click', ()=>{
    if(expCurrentDetailId){
      if(confirm('Bạn có chắc muốn xóa khoản chi này không?')){
        deleteExpense(expCurrentDetailId);
        window.closeModal('expModalExpenseDetail');
      }
    }
  });

  // Receipt File upload
  const receiptFile = document.getElementById('expInpReceiptFile');
  if(receiptFile){
    receiptFile.addEventListener('change', function(e){
      const file = e.target.files[0];
      if(!file) return;
      if(file.size > 3 * 1024 * 1024){
        if(typeof toast === 'function') toast('Ảnh dung lượng quá lớn, vui lòng chọn file dưới 3MB', '⚠️');
        receiptFile.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt){
        const b64 = evt.target.result;
        document.getElementById('expInpReceiptBase64').value = b64;
        const thumbWrap = document.getElementById('expReceiptPreviewThumbWrap');
        const thumbImg = document.getElementById('expReceiptPreviewThumb');
        const clearBtn = document.getElementById('expBtnClearReceipt');
        if(thumbWrap && thumbImg){
          thumbImg.src = b64;
          thumbWrap.style.display = 'flex';
        }
        if(clearBtn) clearBtn.style.display = 'inline-block';
      };
      reader.readAsDataURL(file);
    });
  }

  const clearReceiptBtn = document.getElementById('expBtnClearReceipt');
  if(clearReceiptBtn){
    clearReceiptBtn.addEventListener('click', function(){
      document.getElementById('expInpReceiptBase64').value = '';
      if(receiptFile) receiptFile.value = '';
      const thumbWrap = document.getElementById('expReceiptPreviewThumbWrap');
      if(thumbWrap) thumbWrap.style.display = 'none';
      clearReceiptBtn.style.display = 'none';
    });
  }

  // Detail Receipt Zoom Button & Click
  const detailImg = document.getElementById('expDetailReceiptImg');
  const zoomBtn = document.getElementById('expDetailReceiptZoomBtn');
  const triggerZoom = function(){
    if(detailImg && detailImg.src){
      window.openReceiptLightbox(detailImg.src, document.getElementById('expDetailTitle').textContent);
    }
  };
  if(detailImg) detailImg.addEventListener('click', triggerZoom);
  if(zoomBtn) zoomBtn.addEventListener('click', triggerZoom);
}

function populateExpenseDropdowns(){
  const selSupplier = document.getElementById('expInpSupplierSelect');
  if(selSupplier){
    const curVal = selSupplier.value;
    let html = '<option value="">-- Chọn Nhà cung cấp --</option>';
    OFFICE_SUPPLIERS.forEach(s => {
      html += `<option value="${s.id}">${s.code ? s.code + ' - ' : ''}${escapeHtml(s.name)}</option>`;
    });
    selSupplier.innerHTML = html;
    if(curVal) selSupplier.value = curVal;
  }

  const filterCat = document.getElementById('expFilterCategory');
  if(filterCat){
    const curVal = filterCat.value;
    const defaultCats = [
      'Thuê Cây Xanh',
      'Giặt thảm',
      'Mực in',
      'Văn Phòng Phẩm',
      'DV Vệ Sinh',
      'Nước uống'
    ];
    // Lọc bỏ các danh mục không còn dùng / lỗi nhập liệu cũ
    const existingCats = Array.from(new Set(OFFICE_EXPENSES.map(e => {
      let c = (e.category || '').trim();
      if(c.toLowerCase().includes('cảnh quan') || c.toLowerCase().includes('canh quan')) return 'Thuê Cây Xanh';
      return c;
    }).filter(Boolean)))
      .filter(c => !c.toLowerCase().includes('cảnh quan') && !c.toLowerCase().includes('canh quan'));
    const allCats = Array.from(new Set([...defaultCats, ...existingCats]));

    let html = '<option value="all">Tất cả danh mục</option>';
    allCats.forEach(c => {
      html += `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`;
    });
    filterCat.innerHTML = html;
    if(curVal) filterCat.value = curVal;
  }
}

// ─── TAB 1: DANH SÁCH & TIẾN TRÌNH DUYỆT (LIST) ───
function renderExpenseList(){
  ensureOfficeExpensesData();
  const yearEl = document.getElementById('expFilterYear');
  const monthEl = document.getElementById('expFilterMonth');
  const catEl = document.getElementById('expFilterCategory');
  const stepEl = document.getElementById('expFilterStep');
  const searchEl = document.getElementById('expSearchInput');

  const yearVal = yearEl ? yearEl.value : 'all';
  const monthVal = monthEl ? monthEl.value : 'all';
  const catVal = catEl ? catEl.value : 'all';
  const stepVal = stepEl ? stepEl.value : 'all';
  const query = (searchEl ? searchEl.value : '').trim().toLowerCase();

  const filtered = OFFICE_EXPENSES.filter(item => {
    if(yearVal !== 'all' && String(item.year) !== yearVal) return false;
    if(monthVal !== 'all' && String(item.month) !== monthVal) return false;
    if(catVal !== 'all' && item.category !== catVal) return false;
    if(stepVal !== 'all'){
      const itemStep = String(item.step);
      if(stepVal === '4'){
        if(itemStep !== '4' && itemStep !== '5') return false;
      } else if(itemStep !== stepVal){
        return false;
      }
    }
    if(query){
      const haystack = [item.code, item.title, item.supplierName, item.invoiceNo, item.createdBy, item.note].filter(Boolean).join(' ').toLowerCase();
      if(!haystack.includes(query)) return false;
    }
    return true;
  });

  filtered.sort((a,b) => new Date(b.date || '2026-01-01').getTime() - new Date(a.date || '2026-01-01').getTime());

  const tbody = document.getElementById('expListTableBody');
  const emptyNotice = document.getElementById('expEmptyNotice');
  if(!tbody) return;

  if(!filtered.length){
    tbody.innerHTML = '';
    if(emptyNotice) emptyNotice.style.display = 'block';
    return;
  }
  if(emptyNotice) emptyNotice.style.display = 'none';

  let html = '';
  filtered.forEach(item => {
    const stepInfo = getStepInfo(item.step);
    const receiptBtn = item.receiptUrl ? `
      <button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:11.5px;color:#0284c7;border-color:#bae6fd;" onclick="window.openReceiptLightbox('${item.receiptUrl}', '${escapeHtml(item.title)}')">
        🧾 Xem HĐ
      </button>
    ` : `<span style="color:#94a3b8;font-size:12px;">--</span>`;

    let dotsHtml = '<div class="exp-mini-stepper">';
    for(let s = 1; s <= 4; s++){
      const active = (stepInfo.num >= s);
      dotsHtml += `<div class="exp-mini-dot ${active ? 'active' : ''}" title="Bước ${s}"></div>`;
    }
    dotsHtml += '</div>';

    html += `<tr>
      <td><span class="pill cam" style="font-size:12px;font-weight:700;">${item.code || 'EXP'}</span></td>
      <td>
        <b>T${item.month}/${item.year}</b>
        <div style="font-size:11px;color:#64748b;">${item.date ? item.date.split('-').reverse().join('/') : '--'}</div>
      </td>
      <td>
        <b style="color:#0f172a;cursor:pointer;" onclick="window.openExpenseDetailModal('${item.id}')">${escapeHtml(item.title)}</b>
        ${item.invoiceNo ? `<div style="font-size:11px;color:#64748b;">Số HĐ: ${escapeHtml(item.invoiceNo)}</div>` : ''}
      </td>
      <td><span class="pill" style="background:#f1f5f9;color:#334155;font-size:12px;">${escapeHtml(item.category || 'Khác')}</span></td>
      <td style="font-size:12.5px;color:#334155;max-width:180px;">${escapeHtml(item.supplierName || '--')}</td>
      <td style="text-align:right;"><b style="color:var(--cam);font-size:14px;">${(Number(item.amount)||0).toLocaleString('vi-VN')} ₫</b></td>
      <td style="text-align:center;">${receiptBtn}</td>
      <td style="text-align:center;">
        <div style="margin-bottom:4px;"><span class="exp-status-pill ${stepInfo.cls}">${stepInfo.label}</span></div>
        ${dotsHtml}
      </td>
      <td style="text-align:center;">
        <div style="display:inline-flex;gap:4px;">
          <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="window.openExpenseDetailModal('${item.id}')" title="Xem chi tiết & duyệt">👁️</button>
          <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="window.openEditExpenseModal('${item.id}')" title="Chỉnh sửa">✏️</button>
          <button class="btn btn-ghost btn-sm" style="padding:4px 8px;color:#ef4444;" onclick="window.handleDeleteExpenseRow('${item.id}')" title="Xóa khoản chi">🗑️</button>
        </div>
      </td>
    </tr>`;
  });

  tbody.innerHTML = html;
}

// ─── TAB 2: PHÂN TÍCH & BÁO CÁO (ANALYTICS) ───
function renderExpenseAnalytics(){
  ensureOfficeExpensesData();
  const yearEl = document.getElementById('expAnalyticsYearSelect');
  const monthEl = document.getElementById('expAnalyticsMonthSelect');
  const selectedYear = parseInt(yearEl ? yearEl.value : '2026', 10) || 2026;
  const selectedMonthVal = monthEl ? monthEl.value : 'all';
  const priorYear = selectedYear - 1;

  const expensesCurYear = OFFICE_EXPENSES.filter(e => e.year === selectedYear && e.step !== 'rejected');
  const expensesPriorYear = OFFICE_EXPENSES.filter(e => e.year === priorYear && e.step !== 'rejected');

  let expensesForPeriod = expensesCurYear;
  if(selectedMonthVal !== 'all'){
    const m = parseInt(selectedMonthVal, 10);
    expensesForPeriod = expensesCurYear.filter(e => e.month === m);
  }

  // 1. Cập nhật KPIs
  const totalAnnual = expensesCurYear.reduce((sum, e) => sum + (Number(e.amount)||0), 0);
  const totalPeriod = expensesForPeriod.reduce((sum, e) => sum + (Number(e.amount)||0), 0);
  const paidList = expensesForPeriod.filter(e => String(e.step) === '4' || String(e.step) === '5');
  const pendingList = expensesForPeriod.filter(e => String(e.step) !== '4' && String(e.step) !== '5' && e.step !== 'rejected');

  const totalPaid = paidList.reduce((sum, e) => sum + (Number(e.amount)||0), 0);
  const totalPending = pendingList.reduce((sum, e) => sum + (Number(e.amount)||0), 0);

  const elTotalYear = document.getElementById('expKpiTotalYear');
  if(elTotalYear) elTotalYear.textContent = (totalAnnual||0).toLocaleString('vi-VN') + ' ₫';
  const elCountYear = document.getElementById('expKpiCountYear');
  if(elCountYear) elCountYear.textContent = `${expensesCurYear.length} khoản chi trong năm ${selectedYear}`;

  const elCurMonth = document.getElementById('expKpiCurrentMonth');
  if(elCurMonth) elCurMonth.textContent = (totalPeriod||0).toLocaleString('vi-VN') + ' ₫';

  const elPaidAmt = document.getElementById('expKpiPaidAmount');
  if(elPaidAmt) elPaidAmt.textContent = (totalPaid||0).toLocaleString('vi-VN') + ' ₫';
  const elPaidCnt = document.getElementById('expKpiPaidCount');
  if(elPaidCnt) elPaidCnt.textContent = `Đã thanh toán: ${paidList.length} khoản chi`;

  const elPendingAmt = document.getElementById('expKpiPendingAmount');
  if(elPendingAmt) elPendingAmt.textContent = (totalPending||0).toLocaleString('vi-VN') + ' ₫';
  const elPendingCnt = document.getElementById('expKpiPendingCount');
  if(elPendingCnt) elPendingCnt.textContent = `Chờ duyệt/xử lý: ${pendingList.length} khoản`;

  // MoM / YoY Trend badge
  const elMom = document.getElementById('expKpiMomChange');
  if(elMom){
    if(selectedMonthVal !== 'all'){
      const curM = parseInt(selectedMonthVal, 10);
      const prevM = curM === 1 ? 12 : curM - 1;
      const prevMYear = curM === 1 ? priorYear : selectedYear;
      const prevMTotal = OFFICE_EXPENSES
        .filter(e => e.year === prevMYear && e.month === prevM && e.step !== 'rejected')
        .reduce((sum, e) => sum + (Number(e.amount)||0), 0);

      if(prevMTotal > 0){
        const diff = totalPeriod - prevMTotal;
        const pct = ((diff / prevMTotal) * 100).toFixed(1);
        if(diff >= 0){
          elMom.innerHTML = `<span class="exp-diff-badge pos">+${pct}% ↗</span> so với T${prevM}`;
        } else {
          elMom.innerHTML = `<span class="exp-diff-badge neg">${pct}% ↘</span> so với T${prevM}`;
        }
      } else {
        elMom.textContent = 'Chưa có dữ liệu kỳ trước';
      }
    } else {
      const priorTotal = expensesPriorYear.reduce((sum, e) => sum + (Number(e.amount)||0), 0);
      if(priorTotal > 0){
        const diff = totalAnnual - priorTotal;
        const pct = ((diff / priorTotal) * 100).toFixed(1);
        if(diff >= 0){
          elMom.innerHTML = `<span class="exp-diff-badge pos">+${pct}% ↗</span> vs Năm ${priorYear}`;
        } else {
          elMom.innerHTML = `<span class="exp-diff-badge neg">${pct}% ↘</span> vs Năm ${priorYear}`;
        }
      } else {
        elMom.textContent = `Tổng chi năm ${selectedYear}`;
      }
    }
  }

  // 2. Mảng 12 tháng cho Biểu đồ đường
  const curMonthly = Array(12).fill(0);
  expensesCurYear.forEach(e => {
    const m = (Number(e.month)||1) - 1;
    if(m >= 0 && m < 12) curMonthly[m] += Number(e.amount)||0;
  });

  const priorMonthly = Array(12).fill(0);
  expensesPriorYear.forEach(e => {
    const m = (Number(e.month)||1) - 1;
    if(m >= 0 && m < 12) priorMonthly[m] += Number(e.amount)||0;
  });

  renderTrendChart(selectedYear, priorYear, curMonthly, priorMonthly);

  // 3. Cơ cấu chi phí Doughnut
  const catTotals = {};
  expensesForPeriod.forEach(e => {
    const cat = e.category || 'Khác';
    catTotals[cat] = (catTotals[cat] || 0) + (Number(e.amount)||0);
  });
  renderCategoryChart(catTotals);

  // 4. Populate dropdown nhà cung cấp theo biểu đồ tháng
  populateSupplierChartSelector(expensesForPeriod);
  // Reset chart về trạng thái empty khi đổi bộ lọc
  const chartWrap = document.getElementById('expSupplierChartWrap');
  const chartEmpty = document.getElementById('expSupplierChartEmpty');
  const sel = document.getElementById('expSupplierChartSelector');
  if(chartWrap) chartWrap.style.display = 'none';
  if(chartEmpty) chartEmpty.style.display = 'block';
  if(sel) sel.value = '';
  if(expSupplierChartInstance){ expSupplierChartInstance.destroy(); expSupplierChartInstance = null; }

  // 5. Bảng phân tích biến động 12 tháng
  renderMonthlyVarianceTable(selectedYear);
}

function renderTrendChart(yearCur, yearPrior, dataCur, dataPrior){
  const canvas = document.getElementById('expTrendChartCanvas');
  if(!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if(expTrendChartInstance) expTrendChartInstance.destroy();

  const grad = ctx.createLinearGradient(0, 0, 0, 240);
  grad.addColorStop(0, 'rgba(242, 101, 34, 0.2)');
  grad.addColorStop(1, 'rgba(242, 101, 34, 0.0)');

  expTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      datasets: [
        {
          label: `Năm ${yearCur} (VNĐ)`,
          data: dataCur,
          borderColor: '#f26522',
          backgroundColor: grad,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#f26522',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: `Năm trước ${yearPrior} (VNĐ)`,
          data: dataPrior,
          borderColor: '#0284c7',
          borderDash: [5, 5],
          borderWidth: 1.8,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#0284c7',
          pointBorderColor: '#ffffff',
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Mulish', size: 12, weight: '700' }, color: '#334155' }
        },
        tooltip: {
          callbacks: {
            label: function(ctx){
              return ` ${ctx.dataset.label}: ${(ctx.raw||0).toLocaleString('vi-VN')} ₫`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: {
            callback: function(val){
              if(val >= 1000000) return (val / 1000000).toFixed(0) + ' Tr';
              return val;
            }
          }
        }
      }
    }
  });
}

function renderCategoryChart(catTotals){
  const canvas = document.getElementById('expCategoryChartCanvas');
  if(!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if(expCategoryChartInstance) expCategoryChartInstance.destroy();

  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);

  if(!labels.length){
    expCategoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Chưa có dữ liệu'],
        datasets: [{ data: [1], backgroundColor: ['#e2e8f0'], borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Mulish', size: 11 } } },
          tooltip: { enabled: false }
        }
      }
    });
    return;
  }

  const colors = ['#f26522', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  expCategoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { family: 'Mulish', size: 11, weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: function(context){
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a,b)=>a+b, 0);
              const pct = total > 0 ? ((val/total)*100).toFixed(1) : 0;
              return ` ${context.label}: ${val.toLocaleString('vi-VN')} ₫ (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function populateSupplierChartSelector(expenses){
  const sel = document.getElementById('expSupplierChartSelector');
  if(!sel) return;
  // Lấy tất cả nhà cung cấp có trong dữ liệu
  const supplierMap = {};
  expenses.forEach(e => {
    if(e.supplierId && e.supplierName) supplierMap[e.supplierId] = e.supplierName;
  });
  const current = sel.value;
  sel.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
  Object.entries(supplierMap).sort((a,b)=>a[1].localeCompare(b[1],'vi')).forEach(([id, name])=> {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = name;
    if(id === current) opt.selected = true;
    sel.appendChild(opt);
  });
}

window.onSupplierChartSelect = function(supplierId){
  const chartWrap = document.getElementById('expSupplierChartWrap');
  const chartEmpty = document.getElementById('expSupplierChartEmpty');
  if(!supplierId){
    if(chartWrap) chartWrap.style.display = 'none';
    if(chartEmpty) chartEmpty.style.display = 'block';
    if(expSupplierChartInstance){ expSupplierChartInstance.destroy(); expSupplierChartInstance = null; }
    return;
  }
  if(chartWrap) chartWrap.style.display = 'block';
  if(chartEmpty) chartEmpty.style.display = 'none';

  ensureOfficeExpensesData();
  // Lấy năm đang chọn trên analytics
  const yearSel = document.getElementById('expAnalyticsYear');
  const selectedYear = parseInt(yearSel ? yearSel.value : new Date().getFullYear(), 10);

  // Tổng hợp theo từng tháng
  const monthly = Array(12).fill(0);
  OFFICE_EXPENSES
    .filter(e => e.supplierId === supplierId && Number(e.year) === selectedYear && e.step !== 'rejected')
    .forEach(e => {
      const m = (Number(e.month)||1) - 1;
      if(m >= 0 && m < 12) monthly[m] += Number(e.amount)||0;
    });

  // Tìm tên nhà cung cấp
  const sup = OFFICE_SUPPLIERS.find(s => s.id === supplierId);
  const supName = sup ? sup.name : 'Nhà cung cấp';

  renderSupplierMonthlyChart(supName, monthly, selectedYear);
};

function renderSupplierMonthlyChart(supName, monthly, year){
  const canvas = document.getElementById('expSupplierChartCanvas');
  if(!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if(expSupplierChartInstance) expSupplierChartInstance.destroy();

  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, 'rgba(2, 132, 199, 0.25)');
  grad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');

  expSupplierChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
      datasets: [{
        label: `Chi phí ${supName} năm ${year} (VNĐ)`,
        data: monthly,
        backgroundColor: monthly.map(v => v > 0 ? 'rgba(2,132,199,0.75)' : 'rgba(226,232,240,0.5)'),
        borderColor: monthly.map(v => v > 0 ? '#0284c7' : '#cbd5e1'),
        borderWidth: 1.5,
        borderRadius: 6,
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx){
              const val = ctx.raw || 0;
              return val > 0 ? ` ${val.toLocaleString('vi-VN')} ₫` : ' Chưa phát sinh';
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Mulish' } } },
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 11 },
            callback: function(val){
              if(val >= 1000000) return (val/1000000).toFixed(0) + ' Tr';
              return val;
            }
          }
        }
      }
    }
  });
}

window.expExpandedMonthlyRows = window.expExpandedMonthlyRows || new Set();

window.toggleMonthlyRow = function(m){
  if(!window.expExpandedMonthlyRows) window.expExpandedMonthlyRows = new Set();
  if(window.expExpandedMonthlyRows.has(m)){
    window.expExpandedMonthlyRows.delete(m);
  } else {
    window.expExpandedMonthlyRows.add(m);
  }
  const yearEl = document.getElementById('expAnalyticsYearSelect');
  const selectedYear = parseInt(yearEl ? yearEl.value : '2026', 10) || 2026;
  renderMonthlyVarianceTable(selectedYear);
};

function renderMonthlyVarianceTable(yearCur){
  const tbody = document.getElementById('expMonthlyTableBody');
  if(!tbody) return;

  const yearPrior = yearCur - 1;
  const expensesCurYear = OFFICE_EXPENSES.filter(e => Number(e.year) === yearCur && e.step !== 'rejected');
  const expensesPriorYear = OFFICE_EXPENSES.filter(e => Number(e.year) === yearPrior && e.step !== 'rejected');

  // Mảng chi phí 12 tháng năm hiện tại
  const curMonthly = Array(13).fill(0);
  expensesCurYear.forEach(e => {
    const m = Number(e.month) || 0;
    if(m >= 1 && m <= 12) curMonthly[m] += Number(e.amount) || 0;
  });

  // Chi phí tháng 12 năm trước (dùng đối soát cho Tháng 1)
  const priorDecAmt = expensesPriorYear
    .filter(e => Number(e.month) === 12)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  let rowsHtml = '';
  for(let m = 1; m <= 12; m++){
    const curVal = curMonthly[m] || 0;
    const prevVal = m === 1 ? priorDecAmt : (curMonthly[m - 1] || 0);
    const diff = curVal - prevVal;

    let diffFormatted = '0 ₫';
    let diffColor = '#64748b';
    let pctBadge = '<span class="exp-diff-badge">--</span>';

    if(curVal === 0 && prevVal === 0){
      diffFormatted = '0 ₫';
      diffColor = '#94a3b8';
      pctBadge = '<span class="exp-diff-badge">--</span>';
    } else if(prevVal === 0 && curVal > 0){
      diffFormatted = `+${curVal.toLocaleString('vi-VN')} ₫`;
      diffColor = '#ef4444';
      pctBadge = `<span class="exp-diff-badge pos">Mới ↗</span>`;
    } else if(prevVal > 0 && curVal === 0){
      diffFormatted = `-${prevVal.toLocaleString('vi-VN')} ₫`;
      diffColor = '#10b981';
      pctBadge = `<span class="exp-diff-badge neg">-100% ↘</span>`;
    } else {
      const pct = ((diff / prevVal) * 100).toFixed(1);
      if(diff > 0){
        diffFormatted = `+${diff.toLocaleString('vi-VN')} ₫`;
        diffColor = '#ef4444';
        pctBadge = `<span class="exp-diff-badge pos">+${pct}% ↗</span>`;
      } else if(diff < 0){
        diffFormatted = `${diff.toLocaleString('vi-VN')} ₫`;
        diffColor = '#10b981';
        pctBadge = `<span class="exp-diff-badge neg">${pct}% ↘</span>`;
      } else {
        diffFormatted = '0 ₫';
        diffColor = '#64748b';
        pctBadge = `<span class="exp-diff-badge">0.0%</span>`;
      }
    }

    // Lọc danh sách nhà cung cấp của Tháng m
    const monthExpenses = expensesCurYear.filter(e => Number(e.month) === m);
    const supMap = {};
    monthExpenses.forEach(e => {
      const key = e.supplierId || e.supplierName || 'Khác';
      if(!supMap[key]){
        let sName = e.supplierName;
        if(!sName && e.supplierId){
          const sObj = OFFICE_SUPPLIERS.find(s => s.id === e.supplierId);
          if(sObj) sName = sObj.name;
        }
        supMap[key] = {
          id: e.supplierId,
          name: sName || 'Nhà cung cấp khác',
          category: e.category || '',
          curAmt: 0,
          prevAmt: 0,
          count: 0
        };
      }
      supMap[key].curAmt += Number(e.amount) || 0;
      supMap[key].count++;
    });

    const prevExpenses = m === 1
      ? expensesPriorYear.filter(e => Number(e.month) === 12)
      : expensesCurYear.filter(e => Number(e.month) === m - 1);

    prevExpenses.forEach(e => {
      const key = e.supplierId || e.supplierName || 'Khác';
      if(supMap[key]){
        supMap[key].prevAmt += Number(e.amount) || 0;
      }
    });

    const supList = Object.values(supMap).sort((a, b) => b.curAmt - a.curAmt);
    const supCount = supList.length;
    const isExpanded = window.expExpandedMonthlyRows && window.expExpandedMonthlyRows.has(m);
    const toggleIcon = isExpanded ? '▼' : '▶';

    const countBadge = supCount > 0
      ? `<span class="pill" style="font-size:11px;font-weight:600;padding:2px 8px;margin-left:8px;background:#e2e8f0;color:#334155;">${supCount} NCC</span>`
      : `<span style="font-size:11px;color:#94a3b8;margin-left:8px;">(0 NCC)</span>`;

    rowsHtml += `
      <tr class="exp-month-row ${isExpanded ? 'expanded' : ''}" onclick="window.toggleMonthlyRow(${m})" title="Nhấp để xem chi tiết theo từng nhà cung cấp trong Tháng ${m}">
        <td>
          <div style="display:flex;align-items:center;">
            <span style="font-size:11px;color:#0284c7;width:18px;display:inline-block;">${toggleIcon}</span>
            <b style="color:#0f172a;font-size:13.5px;">Tháng ${m}</b>
            ${countBadge}
          </div>
        </td>
        <td style="text-align:right;">
          <b style="color:#0f172a;font-size:13.5px;">${curVal.toLocaleString('vi-VN')} ₫</b>
        </td>
        <td style="text-align:right;font-weight:700;color:${diffColor};">
          ${diffFormatted}
        </td>
        <td style="text-align:center;">
          ${pctBadge}
        </td>
      </tr>
    `;

    if(isExpanded){
      if(supList.length === 0){
        rowsHtml += `
          <tr class="exp-supplier-child-row">
            <td colspan="4" style="padding:12px 16px 12px 38px;color:#94a3b8;font-style:italic;font-size:12px;">
              Chưa phát sinh chi phí từ nhà cung cấp nào trong Tháng ${m}.
            </td>
          </tr>
        `;
      } else {
        supList.forEach(sup => {
          const sDiff = sup.curAmt - sup.prevAmt;
          let sDiffFmt = '0 ₫';
          let sDiffColor = '#64748b';
          let sPctBadge = '<span class="exp-diff-badge">--</span>';

          if(sup.curAmt === 0 && sup.prevAmt === 0){
            sDiffFmt = '0 ₫';
            sDiffColor = '#94a3b8';
          } else if(sup.prevAmt === 0 && sup.curAmt > 0){
            sDiffFmt = `+${sup.curAmt.toLocaleString('vi-VN')} ₫`;
            sDiffColor = '#ef4444';
            sPctBadge = `<span class="exp-diff-badge pos">Mới ↗</span>`;
          } else if(sup.prevAmt > 0 && sup.curAmt === 0){
            sDiffFmt = `-${sup.prevAmt.toLocaleString('vi-VN')} ₫`;
            sDiffColor = '#10b981';
            sPctBadge = `<span class="exp-diff-badge neg">-100% ↘</span>`;
          } else {
            const sPct = ((sDiff / sup.prevAmt) * 100).toFixed(1);
            if(sDiff > 0){
              sDiffFmt = `+${sDiff.toLocaleString('vi-VN')} ₫`;
              sDiffColor = '#ef4444';
              sPctBadge = `<span class="exp-diff-badge pos">+${sPct}% ↗</span>`;
            } else if(sDiff < 0){
              sDiffFmt = `${sDiff.toLocaleString('vi-VN')} ₫`;
              sDiffColor = '#10b981';
              sPctBadge = `<span class="exp-diff-badge neg">${sPct}% ↘</span>`;
            } else {
              sDiffFmt = '0 ₫';
              sDiffColor = '#64748b';
              sPctBadge = `<span class="exp-diff-badge">0.0%</span>`;
            }
          }

          rowsHtml += `
            <tr class="exp-supplier-child-row">
              <td style="padding-left:36px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="color:#cbd5e1;font-size:12px;">└──</span>
                  <span style="font-size:13px;">🏢</span>
                  <b style="color:#334155;font-size:12.5px;">${escapeHtml(sup.name)}</b>
                  ${sup.category ? `<span class="pill" style="font-size:10px;padding:1px 6px;background:#f1f5f9;color:#64748b;">${escapeHtml(sup.category)}</span>` : ''}
                  <span style="font-size:11px;color:#94a3b8;">(${sup.count} HĐ)</span>
                </div>
              </td>
              <td style="text-align:right;">
                <span style="font-weight:600;color:#334155;font-size:12.5px;">${sup.curAmt.toLocaleString('vi-VN')} ₫</span>
              </td>
              <td style="text-align:right;font-weight:600;font-size:12px;color:${sDiffColor};">
                ${sDiffFmt}
              </td>
              <td style="text-align:center;">
                ${sPctBadge}
              </td>
            </tr>
          `;
        });
      }
    }
  }

  tbody.innerHTML = rowsHtml;
}

// ─── TAB 3: QUẢN LÝ NHÀ CUNG CẤP (SUPPLIERS) ───
function renderSuppliersList(){
  ensureOfficeExpensesData();
  const searchEl = document.getElementById('expSupplierSearchInput');
  const q = (searchEl ? searchEl.value : '').trim().toLowerCase();

  const filtered = OFFICE_SUPPLIERS.filter(s => {
    if(!q) return true;
    const haystack = [s.name, s.code, s.taxCode, s.phone, s.email, s.bankName, s.bankAcc, s.category].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  });

  const countLabel = document.getElementById('expSupplierCountLabel');
  if(countLabel) countLabel.textContent = `${filtered.length} nhà cung cấp`;

  const grid = document.getElementById('expSupplierGrid');
  if(!grid) return;

  if(!filtered.length){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px 20px;color:#94a3b8;background:#fff;border-radius:18px;box-shadow:var(--shadow);">
      <span style="font-size:40px;display:block;margin-bottom:8px;">🏢</span>
      <div style="font-weight:700;font-size:15px;color:#1e293b;margin-bottom:4px;">Chưa có nhà cung cấp nào</div>
      <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Bắt đầu lưu thông tin nhà cung cấp dịch vụ để đối soát và thanh toán nhanh chóng.</p>
      <button class="btn btn-cam btn-sm" onclick="window.openAddSupplierModal()">🏢 + Thêm Nhà cung cấp</button>
    </div>`;
    return;
  }

  let html = '';
  filtered.forEach(s => {
    const totalPaid = OFFICE_EXPENSES
      .filter(e => e.supplierId === s.id && e.step !== 'rejected')
      .reduce((sum, e) => sum + (Number(e.amount)||0), 0);
    const invoiceCount = OFFICE_EXPENSES.filter(e => e.supplierId === s.id).length;

    html += `<div class="supplier-card">
      <div class="supplier-card-header">
        <div class="supplier-avatar">🏢</div>
        <div style="flex:1;">
          <h4 style="margin:0;font-size:14.5px;color:#0f172a;line-height:1.3;">${escapeHtml(s.name)}</h4>
          ${s.code ? `<span class="pill cam" style="font-size:11px;padding:2px 8px;margin-top:4px;display:inline-block;">${escapeHtml(s.code)}</span>` : ''}
        </div>
      </div>

      <div class="supplier-meta">
        <div class="supplier-meta-row">
          <span style="color:#64748b;">Mã số thuế:</span>
          <span><b>${escapeHtml(s.taxCode || '--')}</b></span>
        </div>
        <div class="supplier-meta-row">
          <span style="color:#64748b;">Hotline/SĐT:</span>
          <span>${escapeHtml(s.phone || '--')}</span>
        </div>
        <div class="supplier-meta-row">
          <span style="color:#64748b;">Email:</span>
          <span style="color:#0284c7;">${escapeHtml(s.email || '--')}</span>
        </div>
        <div class="supplier-meta-row">
          <span style="color:#64748b;">Lĩnh vực:</span>
          <span>${escapeHtml(s.category || '--')}</span>
        </div>
      </div>

      <div class="supplier-bank-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-weight:700;font-size:11.5px;color:#0284c7;cursor:pointer;" class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml([s.bankName, s.bankAcc, s.bankHolder].filter(Boolean).join(' - '))}', 'Toàn bộ thông tin ngân hàng')" title="Nhấp đúp để sao chép toàn bộ thông tin ngân hàng">💳 TÀI KHOẢN NGÂN HÀNG:</span>
          ${s.bankAcc ? `<button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px;" onclick="window.copyToClipboard('${escapeHtml(s.bankAcc)}', 'Số tài khoản')">📋 Copy STK</button>` : ''}
        </div>
        <div class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml(s.bankName || '')}', 'Tên ngân hàng')" title="Nhấp đúp để sao chép Tên ngân hàng"><b>${escapeHtml(s.bankName || '--')}</b></div>
        <div class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml(s.bankAcc || '')}', 'Số tài khoản')" title="Nhấp đúp để sao chép Số tài khoản" style="font-family:monospace;font-size:13.5px;color:#0f172a;font-weight:800;letter-spacing:0.5px;margin:2px 0;">
          ${escapeHtml(s.bankAcc || '--')}
        </div>
        <div class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml(s.bankHolder || '')}', 'Chủ tài khoản')" title="Nhấp đúp để sao chép Tên chủ tài khoản" style="font-size:11.5px;color:#64748b;">Chủ TK: <b>${escapeHtml(s.bankHolder || '--')}</b></div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:10px 12px;border-radius:10px;margin-bottom:4px;font-size:12.5px;">
        <span style="color:#64748b;">Tổng chi trả:</span>
        <span style="font-weight:800;color:var(--cam);">${totalPaid.toLocaleString('vi-VN')} ₫ (${invoiceCount} HĐ)</span>
      </div>

      <div style="display:flex;gap:8px;margin-top:6px;">
        <button class="btn btn-ghost btn-sm" style="flex:1;justify-content:center;" onclick="window.openEditSupplierModal('${s.id}')">✏️ Sửa</button>
        <button class="btn btn-ghost btn-sm" style="color:#ef4444;border-color:#fca5a5;padding:5px 10px;" onclick="window.deleteSupplier('${s.id}')">🗑️</button>
      </div>
    </div>`;
  });

  grid.innerHTML = html;
}

// ─── MODAL DETAIL: XEM CHI TIẾT & STEPPER 5 BƯỚC ───
window.openExpenseDetailModal = function(id){
  ensureOfficeExpensesData();
  const item = OFFICE_EXPENSES.find(e => e.id === id);
  if(!item) return;
  expCurrentDetailId = id;

  document.getElementById('expDetailCode').textContent = item.code || 'EXP';
  document.getElementById('expDetailCategoryPill').textContent = item.category || 'Chi phí khác';
  document.getElementById('expDetailTitle').textContent = item.title || 'Khoản chi';
  document.getElementById('expDetailAmount').textContent = (Number(item.amount)||0).toLocaleString('vi-VN') + ' ₫';

  const stepInfo = getStepInfo(item.step);
  const statusPill = document.getElementById('expDetailStatusPill');
  if(statusPill){
    statusPill.className = `exp-status-pill ${stepInfo.cls}`;
    statusPill.textContent = stepInfo.label;
  }

  const curNum = stepInfo.num;
  const pct = curNum <= 1 ? 0 : Math.max(0, Math.min(100, ((curNum - 1) / 3) * 100));
  const progressLine = document.getElementById('expDetailStepperProgress');
  if(progressLine) progressLine.style.width = pct + '%';

  for(let s = 1; s <= 4; s++){
    const el = document.getElementById('expStep' + s);
    if(el){
      el.classList.remove('active', 'completed');
      if(curNum === s) el.classList.add('active');
      else if(curNum > s) el.classList.add('completed');
    }
  }

  const advBtn = document.getElementById('expDetailAdvanceBtn');
  if(advBtn){
    if(curNum >= 4){
      advBtn.disabled = true;
      advBtn.textContent = '✓ Đã hoàn tất thanh toán';
      advBtn.style.opacity = '0.7';
    } else if(item.step === 'rejected'){
      advBtn.disabled = true;
      advBtn.textContent = '✕ Đã từ chối';
      advBtn.style.opacity = '0.7';
    } else {
      advBtn.disabled = false;
      advBtn.style.opacity = '1';
      advBtn.textContent = `Duyệt sang Bước ${curNum + 1} ➔`;
    }
  }

  document.getElementById('expDetailPeriod').textContent = `Tháng ${item.month} / Năm ${item.year}`;
  document.getElementById('expDetailDate').textContent = item.date ? item.date.split('-').reverse().join('/') : '--';
  document.getElementById('expDetailInvoiceNo').textContent = item.invoiceNo || 'Chưa cập nhật';
  document.getElementById('expDetailCreator').textContent = item.createdBy || '--';
  document.getElementById('expDetailNote').textContent = item.note || 'Không có ghi chú thêm.';

  const sup = OFFICE_SUPPLIERS.find(s => s.id === item.supplierId);
  const supBox = document.getElementById('expDetailSupplierBox');
  if(supBox){
    if(sup){
      supBox.innerHTML = `
        <div style="font-weight:700;color:#0f172a;margin-bottom:4px;">${escapeHtml(sup.name)}</div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:4px;">
          <span>MST: <b>${escapeHtml(sup.taxCode || '--')}</b></span>
          <span>Hotline: ${escapeHtml(sup.phone || '--')}</span>
        </div>
        <div style="border-top:1px dashed #cbd5e1;padding-top:6px;margin-top:6px;">
          <div style="font-size:11.5px;color:#0284c7;font-weight:700;cursor:pointer;margin-bottom:2px;" class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml([sup.bankName, sup.bankAcc, sup.bankHolder].filter(Boolean).join(' - '))}', 'Toàn bộ thông tin ngân hàng')" title="Nhấp đúp để sao chép toàn bộ thông tin ngân hàng">💳 NGÂN HÀNG THỤ HƯỞNG:</div>
          <div class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml(sup.bankName || '')}', 'Tên ngân hàng')" title="Nhấp đúp để sao chép Tên ngân hàng" style="font-weight:700;font-size:13px;color:#0f172a;">${escapeHtml(sup.bankName || '--')}</div>
          <div class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml(sup.bankAcc || '')}', 'Số tài khoản')" title="Nhấp đúp để sao chép Số tài khoản" style="font-family:monospace;font-weight:800;font-size:14px;color:var(--cam);margin:2px 0;">${escapeHtml(sup.bankAcc || '--')}</div>
          <div class="copyable-bank-info" ondblclick="window.copyToClipboard('${escapeHtml(sup.bankHolder || '')}', 'Chủ tài khoản')" title="Nhấp đúp để sao chép Tên chủ tài khoản" style="font-size:11.5px;color:#64748b;">Chủ TK: <b>${escapeHtml(sup.bankHolder || '--')}</b></div>
        </div>
      `;
    } else {
      supBox.innerHTML = `<div style="color:#64748b;">${escapeHtml(item.supplierName || 'Chưa gán nhà cung cấp')}</div>`;
    }
  }

  const receiptImg = document.getElementById('expDetailReceiptImg');
  const receiptEmpty = document.getElementById('expDetailReceiptEmpty');
  const receiptZoomBtn = document.getElementById('expDetailReceiptZoomBtn');

  if(item.receiptUrl){
    receiptImg.src = item.receiptUrl;
    receiptImg.style.display = 'block';
    receiptEmpty.style.display = 'none';
    receiptZoomBtn.style.display = 'inline-block';
  } else {
    receiptImg.src = '';
    receiptImg.style.display = 'none';
    receiptEmpty.style.display = 'block';
    receiptZoomBtn.style.display = 'none';
  }

  window.openModal('expModalExpenseDetail');
};

function handleAdvanceDetailStep(){
  if(!expCurrentDetailId) return;
  const item = OFFICE_EXPENSES.find(e => e.id === expCurrentDetailId);
  if(!item) return;

  const curStep = Number(item.step) || 1;
  if(curStep >= 4){
    if(typeof toast === 'function') toast('Khoản chi này đã hoàn tất thanh toán!', 'ℹ️');
    return;
  }
  const nextStep = curStep + 1;
  item.step = nextStep;

  if(!Array.isArray(item.history)) item.history = [];
  item.history.push({
    step: nextStep,
    at: new Date().toLocaleString('vi-VN'),
    by: (window.SESSION && SESSION.email) || 'admin@ghn.vn',
    note: `Phê duyệt chuyển sang Bước ${nextStep}`
  });

  saveOfficeExpenses();
  window.openExpenseDetailModal(expCurrentDetailId);
  renderExpenseList();
  renderExpenseAnalytics();
  if(typeof toast === 'function') toast(`✅ Đã phê duyệt chuyển sang Bước ${nextStep}!`, '✅');
}

function handleRejectDetailStep(){
  if(!expCurrentDetailId) return;
  if(!confirm('Bạn có chắc chắn muốn Từ chối / Hủy khoản chi này không?')) return;

  const item = OFFICE_EXPENSES.find(e => e.id === expCurrentDetailId);
  if(!item) return;

  item.step = 'rejected';
  if(!Array.isArray(item.history)) item.history = [];
  item.history.push({
    step: 0,
    at: new Date().toLocaleString('vi-VN'),
    by: (window.SESSION && SESSION.email) || 'admin@ghn.vn',
    note: 'Từ chối / Hủy bỏ đề xuất'
  });

  saveOfficeExpenses();
  window.openExpenseDetailModal(expCurrentDetailId);
  renderExpenseList();
  renderExpenseAnalytics();
  if(typeof toast === 'function') toast('Đã từ chối khoản chi!', '⚠️');
}

// ─── THÊM / SỬA KHOẢN CHI ───
window.openAddExpenseModal = function(){
  ensureOfficeExpensesData();
  populateExpenseDropdowns();

  document.getElementById('expExpenseModalTitle').textContent = '➕ Thêm khoản chi văn phòng';
  document.getElementById('expInpEditId').value = '';

  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const count = OFFICE_EXPENSES.length + 1;
  const autoCode = `EXP-${y}${m}-${String(count).padStart(3, '0')}`;
  document.getElementById('expInpCode').value = autoCode;

  document.getElementById('expInpTitle').value = '';
  document.getElementById('expInpCategory').value = 'Thuê Cây Xanh';
  document.getElementById('expInpMonth').value = String(now.getMonth() + 1);
  document.getElementById('expInpYear').value = String(now.getFullYear());
  document.getElementById('expInpSupplierSelect').value = '';
  document.getElementById('expInpDate').value = now.toISOString().split('T')[0];
  document.getElementById('expInpInvoiceNo').value = '';
  document.getElementById('expInpStep').value = '1';
  document.getElementById('expInpNote').value = '';

  const amountEl = document.getElementById('expInpAmount');
  if(amountEl){ amountEl.value = ''; amountEl.dataset.rawValue = ''; }
  const pendingWrap = document.getElementById('expPendingReasonWrap');
  if(pendingWrap) pendingWrap.style.display = 'none';
  const pendingReasonEl = document.getElementById('expInpPendingReason');
  if(pendingReasonEl) pendingReasonEl.value = '';

  document.getElementById('expInpReceiptBase64').value = '';
  const receiptFile = document.getElementById('expInpReceiptFile');
  if(receiptFile) receiptFile.value = '';
  const thumbWrap = document.getElementById('expReceiptPreviewThumbWrap');
  if(thumbWrap) thumbWrap.style.display = 'none';
  const clearBtn = document.getElementById('expBtnClearReceipt');
  if(clearBtn) clearBtn.style.display = 'none';

  window.openModal('expModalExpenseForm');
};

window.openEditExpenseModal = function(id){
  ensureOfficeExpensesData();
  populateExpenseDropdowns();

  const item = OFFICE_EXPENSES.find(e => e.id === id);
  if(!item) return;

  document.getElementById('expExpenseModalTitle').textContent = '✏️ Chỉnh sửa khoản chi phí';
  document.getElementById('expInpEditId').value = item.id;
  document.getElementById('expInpCode').value = item.code || '';
  document.getElementById('expInpTitle').value = item.title || '';
  document.getElementById('expInpCategory').value = item.category || 'Thuê Cây Xanh';
  document.getElementById('expInpMonth').value = String(item.month || 9);
  document.getElementById('expInpYear').value = String(item.year || 2026);
  document.getElementById('expInpSupplierSelect').value = item.supplierId || '';
  document.getElementById('expInpDate').value = item.date || '';
  document.getElementById('expInpInvoiceNo').value = item.invoiceNo || '';
  let stepVal = String(item.step || '1');
  if(stepVal === '5') stepVal = '4';
  document.getElementById('expInpStep').value = stepVal;
  document.getElementById('expInpNote').value = item.note || '';

  const amountEl2 = document.getElementById('expInpAmount');
  if(amountEl2){
    const rawVal = String(item.amount || '');
    amountEl2.dataset.rawValue = rawVal;
    amountEl2.value = rawVal ? Number(rawVal).toLocaleString('vi-VN') : '';
  }
  const pendingWrap2 = document.getElementById('expPendingReasonWrap');
  if(pendingWrap2) pendingWrap2.style.display = String(item.step) === 'pending' ? 'block' : 'none';
  const pendingReasonEl2 = document.getElementById('expInpPendingReason');
  if(pendingReasonEl2) pendingReasonEl2.value = item.pendingReason || '';

  document.getElementById('expInpReceiptBase64').value = item.receiptUrl || '';
  const receiptFile = document.getElementById('expInpReceiptFile');
  if(receiptFile) receiptFile.value = '';
  const thumbWrap = document.getElementById('expReceiptPreviewThumbWrap');
  const thumbImg = document.getElementById('expReceiptPreviewThumb');
  const clearBtn = document.getElementById('expBtnClearReceipt');

  if(item.receiptUrl){
    if(thumbImg) thumbImg.src = item.receiptUrl;
    if(thumbWrap) thumbWrap.style.display = 'flex';
    if(clearBtn) clearBtn.style.display = 'inline-block';
  } else {
    if(thumbWrap) thumbWrap.style.display = 'none';
    if(clearBtn) clearBtn.style.display = 'none';
  }

  window.openModal('expModalExpenseForm');
};

window.handleSaveExpense = function(){
  const editId = (document.getElementById('expInpEditId')?.value || '').trim();
  const code = (document.getElementById('expInpCode')?.value || '').trim();
  const title = (document.getElementById('expInpTitle')?.value || '').trim();
  const category = document.getElementById('expInpCategory')?.value || 'Văn phòng phẩm & In ấn';
  const amountRaw = (document.getElementById('expInpAmount')?.dataset.rawValue || document.getElementById('expInpAmount')?.value || '').replace(/[^0-9]/g, '');
  const amount = parseFloat(amountRaw) || 0;
  const month = parseInt(document.getElementById('expInpMonth')?.value, 10) || (new Date().getMonth() + 1);
  const year = parseInt(document.getElementById('expInpYear')?.value, 10) || new Date().getFullYear();
  const supplierId = document.getElementById('expInpSupplierSelect')?.value || '';
  const date = document.getElementById('expInpDate')?.value || new Date().toISOString().split('T')[0];
  const invoiceNo = (document.getElementById('expInpInvoiceNo')?.value || '').trim();
  const step = document.getElementById('expInpStep')?.value || '1';
  const note = (document.getElementById('expInpNote')?.value || '').trim();
  const pendingReason = step === 'pending' ? (document.getElementById('expInpPendingReason')?.value || '').trim() : '';
  const receiptUrl = document.getElementById('expInpReceiptBase64')?.value || '';

  if(!code){ if(typeof toast==='function') toast('Vui lòng nhập mã chi phí', '⚠️'); else alert('Vui lòng nhập mã chi phí'); return; }
  if(!title){ if(typeof toast==='function') toast('Vui lòng nhập nội dung chi phí', '⚠️'); else alert('Vui lòng nhập nội dung chi phí'); return; }
  if(amount <= 0){ if(typeof toast==='function') toast('Vui lòng nhập số tiền thanh toán hợp lệ', '⚠️'); else alert('Vui lòng nhập số tiền'); return; }
  if(step === 'pending' && !pendingReason){ if(typeof toast==='function') toast('Vui lòng nhập lý do Pending', '⚠️'); else alert('Vui lòng nhập lý do Pending'); return; }

  ensureOfficeExpensesData();
  const sup = OFFICE_SUPPLIERS.find(s => s.id === supplierId);
  const supplierName = sup ? sup.name : '';

  if(editId){
    const idx = OFFICE_EXPENSES.findIndex(e => e.id === editId);
    if(idx !== -1){
      OFFICE_EXPENSES[idx] = {
        ...OFFICE_EXPENSES[idx],
        code, title, category, amount, month, year, supplierId, supplierName, date, invoiceNo, step, note, pendingReason,
        receiptUrl: receiptUrl || OFFICE_EXPENSES[idx].receiptUrl
      };
      if(typeof toast==='function') toast('✅ Đã cập nhật khoản chi phí!', '✅');
    }
  } else {
    const newExp = {
      id: 'chiphi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      code,
      title,
      category,
      amount,
      month,
      year,
      supplierId,
      supplierName,
      date: date || new Date().toISOString().split('T')[0],
      invoiceNo,
      step,
      pendingReason: pendingReason || '',
      receiptUrl: receiptUrl || '',
      createdBy: (window.SESSION && SESSION.email) || 'nhinu@ghn.vn',
      department: (window.SESSION && SESSION.dept) || 'Office Admin General',
      note,
      history: [{
        step: Number(step) || 1,
        at: new Date().toLocaleString('vi-VN'),
        by: (window.SESSION && SESSION.email) || 'nhinu@ghn.vn',
        note: 'Tạo mới khoản chi'
      }]
    };
    OFFICE_EXPENSES.unshift(newExp);
    if(typeof toast==='function') toast('✅ Đã thêm mới khoản chi thành công!', '✅');
  }

  saveOfficeExpenses();
  window.closeModal('expModalExpenseForm');
  populateExpenseDropdowns();
  renderExpenseList();
  renderExpenseAnalytics();
}

window.handleDeleteExpenseRow = function(id){
  if(!confirm('Bạn có chắc chắn muốn xóa khoản chi này khỏi hệ thống?')) return;
  deleteExpense(id);
};

function deleteExpense(id){
  OFFICE_EXPENSES = OFFICE_EXPENSES.filter(e => e.id !== id);
  saveOfficeExpenses();
  populateExpenseDropdowns();
  renderExpenseList();
  renderExpenseAnalytics();
  if(typeof toast==='function') toast('Đã xóa khoản chi!', '🗑️');
}

window.openAddSupplierModal = function(){
  const titleEl = document.getElementById('expSupplierModalTitle');
  if(titleEl) titleEl.textContent = '🏢 Thêm Nhà cung cấp mới';
  const idEl = document.getElementById('supInpEditId'); if(idEl) idEl.value = '';
  const nameEl = document.getElementById('supInpName'); if(nameEl) nameEl.value = '';
  const codeEl = document.getElementById('supInpCode'); if(codeEl) codeEl.value = '';
  const taxEl = document.getElementById('supInpTaxCode'); if(taxEl) taxEl.value = '';
  const phoneEl = document.getElementById('supInpPhone'); if(phoneEl) phoneEl.value = '';
  const emailEl = document.getElementById('supInpEmail'); if(emailEl) emailEl.value = '';
  const bNameEl = document.getElementById('supInpBankName'); if(bNameEl) bNameEl.value = '';
  const bAccEl = document.getElementById('supInpBankAcc'); if(bAccEl) bAccEl.value = '';
  const bHolderEl = document.getElementById('supInpBankHolder'); if(bHolderEl) bHolderEl.value = '';
  const catEl = document.getElementById('supInpCategory'); if(catEl) catEl.value = '';
  const addrEl = document.getElementById('supInpAddress'); if(addrEl) addrEl.value = '';

  window.openModal('expModalSupplierForm');
};

window.openEditSupplierModal = function(id){
  ensureOfficeExpensesData();
  const sup = OFFICE_SUPPLIERS.find(s => s.id === id);
  if(!sup) return;

  const titleEl = document.getElementById('expSupplierModalTitle');
  if(titleEl) titleEl.textContent = '✏️ Chỉnh sửa thông tin Nhà cung cấp';
  const idEl = document.getElementById('supInpEditId'); if(idEl) idEl.value = sup.id;
  const nameEl = document.getElementById('supInpName'); if(nameEl) nameEl.value = sup.name || '';
  const codeEl = document.getElementById('supInpCode'); if(codeEl) codeEl.value = sup.code || '';
  const taxEl = document.getElementById('supInpTaxCode'); if(taxEl) taxEl.value = sup.taxCode || '';
  const phoneEl = document.getElementById('supInpPhone'); if(phoneEl) phoneEl.value = sup.phone || '';
  const emailEl = document.getElementById('supInpEmail'); if(emailEl) emailEl.value = sup.email || '';
  const bNameEl = document.getElementById('supInpBankName'); if(bNameEl) bNameEl.value = sup.bankName || '';
  const bAccEl = document.getElementById('supInpBankAcc'); if(bAccEl) bAccEl.value = sup.bankAcc || '';
  const bHolderEl = document.getElementById('supInpBankHolder'); if(bHolderEl) bHolderEl.value = sup.bankHolder || '';
  const catEl = document.getElementById('supInpCategory'); if(catEl) catEl.value = sup.category || '';
  const addrEl = document.getElementById('supInpAddress'); if(addrEl) addrEl.value = sup.address || '';

  window.openModal('expModalSupplierForm');
};

window.handleSaveSupplier = function(){
  const editId = (document.getElementById('supInpEditId')?.value || '').trim();
  const name = (document.getElementById('supInpName')?.value || '').trim();
  const code = (document.getElementById('supInpCode')?.value || '').trim();
  const taxCode = (document.getElementById('supInpTaxCode')?.value || '').trim();
  const phone = (document.getElementById('supInpPhone')?.value || '').trim();
  const email = (document.getElementById('supInpEmail')?.value || '').trim();
  const bankName = (document.getElementById('supInpBankName')?.value || '').trim();
  const bankAcc = (document.getElementById('supInpBankAcc')?.value || '').trim();
  const bankHolder = (document.getElementById('supInpBankHolder')?.value || '').trim();
  const category = (document.getElementById('supInpCategory')?.value || '').trim();
  const address = (document.getElementById('supInpAddress')?.value || '').trim();

  if(!name){
    if(typeof toast==='function') toast('Vui lòng nhập tên công ty / nhà cung cấp', '⚠️');
    else alert('Vui lòng nhập tên công ty / nhà cung cấp');
    return;
  }

  ensureOfficeExpensesData();

  if(editId){
    const idx = OFFICE_SUPPLIERS.findIndex(s => s.id === editId);
    if(idx !== -1){
      OFFICE_SUPPLIERS[idx] = {
        ...OFFICE_SUPPLIERS[idx],
        name,
        code: code || OFFICE_SUPPLIERS[idx].code || ('NCC-' + (idx + 1)),
        taxCode,
        phone,
        email,
        bankName,
        bankAcc,
        bankHolder,
        category,
        address
      };
      if(typeof toast==='function') toast('✅ Đã cập nhật thông tin NCC!', '✅');
    }
  } else {
    const newSup = {
      id: 'ncc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name,
      code: code || ('NCC-' + (OFFICE_SUPPLIERS.length + 1)),
      taxCode,
      phone,
      email,
      bankName,
      bankAcc,
      bankHolder,
      category,
      address,
      createdAt: new Date().toISOString()
    };
    OFFICE_SUPPLIERS.unshift(newSup);
    if(typeof toast==='function') toast('✅ Đã lưu Nhà cung cấp mới!', '✅');
  }

  saveOfficeSuppliers();
  populateExpenseDropdowns();
  window.closeModal('expModalSupplierForm');
  renderSuppliersList();
};

window.deleteSupplier = function(id){
  const inUse = OFFICE_EXPENSES.some(e => e.supplierId === id);
  if(inUse){
    if(typeof toast==='function') toast('Không thể xóa NCC này vì đang có hóa đơn chi phí liên kết!', '⚠️');
    return;
  }
  if(!confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) return;

  OFFICE_SUPPLIERS = OFFICE_SUPPLIERS.filter(s => s.id !== id);
  saveOfficeSuppliers();
  populateExpenseDropdowns();
  renderSuppliersList();
  if(typeof toast==='function') toast('Đã xóa nhà cung cấp!', '🗑️');
};

// ─── PHÓNG TO XEM CHỨNG TỪ (LIGHTBOX) ───
window.openReceiptLightbox = function(url, title){
  if(!url) return;
  const zoomImg = document.getElementById('expReceiptZoomImg');
  const zoomTitle = document.getElementById('expReceiptPreviewTitle');
  const zoomInfo = document.getElementById('expReceiptZoomInfo');
  const downloadBtn = document.getElementById('expReceiptDownloadBtn');

  if(zoomImg) zoomImg.src = url;
  if(zoomTitle) zoomTitle.textContent = title ? `🧾 ${title}` : '🧾 Hóa đơn / Chứng từ';
  if(zoomInfo) zoomInfo.textContent = 'Đã tải chứng từ từ GHN Office Hub';
  if(downloadBtn){
    downloadBtn.href = url;
    downloadBtn.download = `chung-tu-${Date.now()}.png`;
  }
  window.openModal('expModalReceiptPreview');
};

// ─── XUẤT BÁO CÁO EXCEL CHUYÊN NGHIỆP ───
window.exportExpensesToExcel = function(){
  ensureOfficeExpensesData();
  if(!OFFICE_EXPENSES.length){
    if(typeof toast==='function') toast('Chưa có dữ liệu khoản chi để xuất file Excel!', 'ℹ️');
    return;
  }

  if(typeof XLSX === 'undefined'){
    if(typeof toast==='function') toast('Thư viện Excel đang tải, vui lòng thử lại sau vài giây!', '⚠️');
    return;
  }

  const yearVal = document.getElementById('expFilterYear') ? document.getElementById('expFilterYear').value : 'all';
  const monthVal = document.getElementById('expFilterMonth') ? document.getElementById('expFilterMonth').value : 'all';

  const filtered = OFFICE_EXPENSES.filter(e => {
    if(yearVal !== 'all' && String(e.year) !== yearVal) return false;
    if(monthVal !== 'all' && String(e.month) !== monthVal) return false;
    return true;
  });

  if(!filtered.length){
    if(typeof toast==='function') toast('Không có dữ liệu phù hợp với bộ lọc để xuất Excel!', 'ℹ️');
    return;
  }

  const rows = [
    ['BÁO CÁO KHOẢN CHI VĂN PHÒNG - GHN OFFICE HUB'],
    [`Kỳ báo cáo: ${monthVal !== 'all' ? 'Tháng ' + monthVal + ' / ' : ''}${yearVal !== 'all' ? 'Năm ' + yearVal : 'Tất cả các năm'}`],
    [`Ngày xuất file: ${new Date().toLocaleString('vi-VN')} · Người lập: ${(window.SESSION && SESSION.email) || 'nhinu@ghn.vn'}`],
    [],
    [
      'STT',
      'Mã chi phí',
      'Khoản mục chi phí',
      'Danh mục',
      'Nhà cung cấp',
      'Số tiền (VNĐ)',
      'Kỳ (T/N)',
      'Ngày hóa đơn',
      'Số hóa đơn VAT',
      'Tiến trình xử lý',
      'Người đề xuất',
      'Ghi chú'
    ]
  ];

  let totalAmount = 0;
  filtered.forEach((item, idx) => {
    const stepInfo = getStepInfo(item.step);
    const amt = Number(item.amount) || 0;
    totalAmount += amt;

    rows.push([
      idx + 1,
      item.code || '',
      item.title || '',
      item.category || '',
      item.supplierName || '',
      amt,
      `T${item.month}/${item.year}`,
      item.date || '',
      item.invoiceNo || '',
      stepInfo.label,
      item.createdBy || '',
      item.note || ''
    ]);
  });

  rows.push([]);
  rows.push(['TỔNG CỘNG', '', '', '', '', totalAmount, '', '', '', '', '', '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 40 },
    { wch: 22 },
    { wch: 35 },
    { wch: 18 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chi_Phi_Van_Phong');

  const fileName = `GHN_Chi_Phi_Van_Phong_${yearVal !== 'all' ? yearVal : 'All'}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
  if(typeof toast==='function') toast(`📥 Đã tải xuống file Excel: ${fileName}`, '✅');
};

// ─── TẢI FILE EXCEL MẪU CHUẨN ĐỂ NHẬP LIỆU ───
window.downloadExpenseExcelTemplate = function(){
  if(typeof XLSX === 'undefined'){
    if(typeof toast === 'function') toast('Thư viện Excel đang tải, vui lòng chờ giây lát!', '⚠️');
    return;
  }

  const headers = [
    'MÃ CHI PHÍ',
    'DANH MỤC CHI PHÍ',
    'NỘI DUNG / KHOẢN MỤC CHI',
    'SỐ TIỀN THANH TOÁN (VNĐ)',
    'KỲ CHI PHÍ (THÁNG/NĂM)',
    'NHÀ CUNG CẤP',
    'NGÀY HÓA ĐƠN',
    'SỐ HÓA ĐƠN VAT'
  ];

  const sampleRow1 = [
    '3399',
    'Thuê Cây Xanh',
    'Thanh toán chi phí thuê cây xanh tại VP Thành Thái tháng 07.2026',
    20887200,
    7,
    'Cát Mộc',
    '13/07/2026',
    '977'
  ];

  const sampleRow2 = [
    '3400',
    'Văn Phòng Phẩm',
    'Chi phí giấy in và văn phòng phẩm tháng 07.2026',
    15500000,
    7,
    'Nam Khang',
    '15/07/2026',
    '1024'
  ];

  const sampleRow3 = [
    '3401',
    'Nước uống',
    'Chi phí nước uống Lavie văn phòng tháng 07.2026',
    66020400,
    7,
    'Lavie',
    '20/07/2026',
    '8854'
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2, sampleRow3]);

  ws['!cols'] = [
    { wch: 14 },
    { wch: 20 },
    { wch: 48 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Chi_Phi');
  XLSX.writeFile(wb, 'Mau_Nhap_Chi_Phi_Van_Phong.xlsx');
  if(typeof toast === 'function') toast('📥 Đã tải xuống file mẫu: Mau_Nhap_Chi_Phi_Van_Phong.xlsx', '✅');
};

// ─── NHẬP HÀNG LOẠT CHI PHÍ TỪ FILE EXCEL ───
window._pendingExpenseImports = [];

window.openImportExpensesModal = function(){
  window._pendingExpenseImports = [];
  const fileInp = document.getElementById('expImportFileInput');
  if(fileInp) fileInp.value = '';
  const label = document.getElementById('expImportFileLabel');
  if(label) label.textContent = 'Nhấp để chọn file hoặc kéo thả file Excel vào đây';
  const previewWrap = document.getElementById('expImportPreviewWrap');
  if(previewWrap) previewWrap.style.display = 'none';
  const tbody = document.getElementById('expImportPreviewTbody');
  if(tbody) tbody.innerHTML = '';
  const confirmBtn = document.getElementById('expImportConfirmBtn');
  if(confirmBtn){
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = '0.6';
    confirmBtn.textContent = '🚀 Xác nhận tải lên';
  }
  window.openModal('expModalImportExcel');
};

window.closeImportExpensesModal = function(){
  window._pendingExpenseImports = [];
  window.closeModal('expModalImportExcel');
};

window.handleExpenseFileSelect = function(e){
  const files = e.target.files;
  if(files && files.length) processExpenseExcelFile(files[0]);
};

window.handleExpenseDropFiles = function(files){
  if(files && files.length) processExpenseExcelFile(files[0]);
};

function processExpenseExcelFile(file){
  if(!file) return;
  const label = document.getElementById('expImportFileLabel');
  if(label) label.textContent = `📄 Đang đọc file: ${file.name}...`;

  const reader = new FileReader();
  reader.onload = function(evt){
    try {
      const data = new Uint8Array(evt.target.result);
      if(typeof XLSX === 'undefined'){
        if(typeof toast === 'function') toast('Thư viện Excel chưa sẵn sàng, vui lòng thử lại sau vài giây!', '⚠️');
        return;
      }
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if(!jsonRows || jsonRows.length < 2){
        if(typeof toast === 'function') toast('File Excel không có dữ liệu!', '⚠️');
        if(label) label.textContent = 'File không có dữ liệu, vui lòng chọn file khác.';
        return;
      }

      parseExpenseWorkbookRows(jsonRows, file.name);
    } catch(err){
      console.error(err);
      if(typeof toast === 'function') toast('Lỗi đọc file Excel: ' + err.message, '⚠️');
      if(label) label.textContent = 'Lỗi đọc file Excel, vui lòng kiểm tra lại file.';
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseExpenseWorkbookRows(jsonRows, fileName){
  let headerRowIdx = -1;
  for(let i = 0; i < Math.min(10, jsonRows.length); i++){
    const row = jsonRows[i];
    if(!Array.isArray(row)) continue;
    const strRow = row.map(c => String(c).trim().toLowerCase()).join(' ');
    if(strRow.includes('mã chi phí') || strRow.includes('danh mục') || strRow.includes('nội dung') || strRow.includes('khoản mục') || strRow.includes('số tiền')){
      headerRowIdx = i;
      break;
    }
  }

  let colCode = 0, colCat = 1, colTitle = 2, colAmt = 3, colPeriod = 4, colSup = 5, colDate = 6, colInvoice = 7;

  if(headerRowIdx >= 0){
    const hRow = jsonRows[headerRowIdx];
    hRow.forEach((h, idx) => {
      const s = String(h).trim().toLowerCase();
      if(s.includes('mã')) colCode = idx;
      else if(s.includes('danh mục') || s.includes('loại')) colCat = idx;
      else if(s.includes('nội dung') || s.includes('khoản mục') || s.includes('mục chi') || s.includes('tiêu đề')) colTitle = idx;
      else if(s.includes('tiền') || s.includes('thanh toán') || s.includes('vnđ')) colAmt = idx;
      else if(s.includes('kỳ') || s.includes('tháng/năm') || s.includes('tháng')) colPeriod = idx;
      else if(s.includes('nhà cung cấp') || s.includes('ncc') || s.includes('đơn vị')) colSup = idx;
      else if(s.includes('ngày')) colDate = idx;
      else if(s.includes('hóa đơn') || s.includes('số hđ') || s.includes('vat')) colInvoice = idx;
    });
  }

  const startIdx = headerRowIdx >= 0 ? headerRowIdx + 1 : 1;
  const parsedItems = [];
  const now = new Date();

  for(let i = startIdx; i < jsonRows.length; i++){
    const r = jsonRows[i];
    if(!r || !Array.isArray(r) || !r.some(cell => String(cell).trim() !== '')) continue;

    const rawCode = String(r[colCode] || '').trim();
    let rawCat = String(r[colCat] || '').trim();
    if(rawCat.toLowerCase().includes('cảnh quan') || rawCat.toLowerCase().includes('canh quan')) rawCat = 'Thuê Cây Xanh';
    const category = rawCat || 'Thuê Cây Xanh';

    const rawTitle = String(r[colTitle] || '').trim();
    const title = rawTitle || `Chi phí ${category}`;

    const rawAmt = r[colAmt];
    let amount = 0;
    if(typeof rawAmt === 'number') amount = Math.round(rawAmt);
    else if(rawAmt) amount = Number(String(rawAmt).replace(/[^0-9]/g, '')) || 0;

    if(!rawTitle && amount === 0) continue;

    // Parse kỳ chi phí (tháng/năm)
    const rawPeriod = String(r[colPeriod] || '').trim();
    let month = 0, year = 0;
    if(rawPeriod){
      const match = rawPeriod.match(/(\d{1,2})[\/\.\-](\d{4})/);
      if(match){
        month = parseInt(match[1], 10);
        year = parseInt(match[2], 10);
      } else {
        const num = parseInt(rawPeriod, 10);
        if(num >= 1 && num <= 12) month = num;
      }
    }

    // Parse ngày hóa đơn
    const rawDate = r[colDate];
    let dateStr = '';
    if(rawDate instanceof Date && !isNaN(rawDate.getTime())){
      const y = rawDate.getFullYear();
      const m = String(rawDate.getMonth() + 1).padStart(2, '0');
      const d = String(rawDate.getDate()).padStart(2, '0');
      dateStr = `${y}-${m}-${d}`;
      if(!year) year = y;
      if(!month) month = rawDate.getMonth() + 1;
    } else if(typeof rawDate === 'number' && rawDate > 20000 && rawDate < 60000){
      const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
      const y = jsDate.getFullYear();
      const m = String(jsDate.getMonth() + 1).padStart(2, '0');
      const d = String(jsDate.getDate()).padStart(2, '0');
      dateStr = `${y}-${m}-${d}`;
      if(!year) year = y;
      if(!month) month = jsDate.getMonth() + 1;
    } else if(rawDate){
      const s = String(rawDate).trim();
      const parts = s.split(/[\/\-\.]/);
      if(parts.length === 3){
        if(parts[0].length === 4){
          dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          if(!year) year = parseInt(parts[0], 10);
          if(!month) month = parseInt(parts[1], 10);
        } else {
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          if(!year) year = parseInt(parts[2], 10);
          if(!month) month = parseInt(parts[1], 10);
        }
      }
    }

    if(!year) year = now.getFullYear();
    if(!month || month < 1 || month > 12) month = now.getMonth() + 1;
    if(!dateStr) dateStr = `${year}-${String(month).padStart(2, '0')}-01`;

    const code = rawCode || `EXP-${String(year).slice(-2)}${String(month).padStart(2, '0')}-${String(OFFICE_EXPENSES.length + parsedItems.length + 1).padStart(3, '0')}`;

    const rawSup = String(r[colSup] || '').trim();
    let supId = '';
    let supName = rawSup;
    if(rawSup){
      const supObj = OFFICE_SUPPLIERS.find(s => s.name.trim().toLowerCase() === rawSup.toLowerCase());
      if(supObj){
        supId = supObj.id;
        supName = supObj.name;
      }
    }

    const invoiceNo = String(r[colInvoice] || '').trim();

    parsedItems.push({
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + i,
      code: code,
      title: title,
      category: category,
      amount: amount,
      month: month,
      year: year,
      supplierId: supId,
      supplierName: supName,
      date: dateStr,
      invoiceNo: invoiceNo,
      step: 1, // AUTO BƯỚC 1 THEO YÊU CẦU!
      note: 'Nhập từ file Excel: ' + fileName,
      createdBy: (window.SESSION && SESSION.email) || 'admin@ghn.vn',
      createdAt: new Date().toISOString(),
      receiptUrl: '',
      history: [
        {
          step: 1,
          at: new Date().toLocaleString('vi-VN'),
          by: (window.SESSION && SESSION.email) || 'admin@ghn.vn',
          note: 'Tải lên từ file Excel (Bước 1: Tiếp nhận đề xuất & HĐ)'
        }
      ]
    });
  }

  if(!parsedItems.length){
    if(typeof toast === 'function') toast('Không tìm thấy dòng dữ liệu chi phí hợp lệ trong file!', '⚠️');
    return;
  }

  window._pendingExpenseImports = parsedItems;

  const label = document.getElementById('expImportFileLabel');
  if(label) label.innerHTML = `✅ <b>${escapeHtml(fileName)}</b> (${parsedItems.length} khoản chi)`;

  const previewWrap = document.getElementById('expImportPreviewWrap');
  if(previewWrap) previewWrap.style.display = 'block';

  const countEl = document.getElementById('expImportPreviewCount');
  if(countEl) countEl.textContent = `Đã đọc thành công ${parsedItems.length} khoản chi`;

  const totalAmt = parsedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalAmtEl = document.getElementById('expImportPreviewTotalAmt');
  if(totalAmtEl) totalAmtEl.textContent = `Tổng tiền: ${totalAmt.toLocaleString('vi-VN')} ₫`;

  const tbody = document.getElementById('expImportPreviewTbody');
  if(tbody){
    let rowsHtml = '';
    parsedItems.slice(0, 15).forEach(item => {
      rowsHtml += `
        <tr>
          <td><b style="color:var(--cam);">${escapeHtml(item.code)}</b></td>
          <td><span class="pill" style="font-size:11px;background:#f1f5f9;color:#334155;">${escapeHtml(item.category)}</span></td>
          <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</td>
          <td style="text-align:right;font-weight:700;color:#0f172a;">${(Number(item.amount) || 0).toLocaleString('vi-VN')} ₫</td>
          <td style="text-align:center;">T${item.month}/${item.year}</td>
          <td>${escapeHtml(item.supplierName || '--')}</td>
          <td>${escapeHtml(item.invoiceNo || '--')}</td>
          <td style="text-align:center;"><span class="exp-status-pill exp-status-1">B1: Tiếp nhận</span></td>
        </tr>
      `;
    });
    if(parsedItems.length > 15){
      rowsHtml += `
        <tr>
          <td colspan="8" style="text-align:center;color:#64748b;font-style:italic;background:#f8fafc;padding:8px;">
            ... và ${parsedItems.length - 15} khoản chi khác nữa
          </td>
        </tr>
      `;
    }
    tbody.innerHTML = rowsHtml;
  }

  const confirmBtn = document.getElementById('expImportConfirmBtn');
  if(confirmBtn){
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '1';
    confirmBtn.textContent = `🚀 Xác nhận tải lên (${parsedItems.length} khoản chi)`;
  }
}

window.confirmImportExpensesExcel = function(){
  if(!window._pendingExpenseImports || !window._pendingExpenseImports.length){
    if(typeof toast === 'function') toast('Không có dữ liệu chi phí nào để tải lên!', '⚠️');
    return;
  }

  ensureOfficeExpensesData();

  // Tự động bổ sung các nhà cung cấp mới vào hệ thống nếu chưa có
  window._pendingExpenseImports.forEach(item => {
    if(item.supplierName && !item.supplierId){
      const supName = item.supplierName.trim();
      let supObj = OFFICE_SUPPLIERS.find(s => s.name.trim().toLowerCase() === supName.toLowerCase());
      if(!supObj){
        supObj = {
          id: 'sup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          code: 'NCC-' + (OFFICE_SUPPLIERS.length + 1),
          name: supName,
          taxCode: '',
          phone: '',
          email: '',
          category: item.category,
          bankName: '',
          bankAcc: '',
          bankHolder: '',
          note: 'Tự động tạo từ file Excel nhập chi phí'
        };
        OFFICE_SUPPLIERS.push(supObj);
      }
      item.supplierId = supObj.id;
    }
  });
  saveOfficeSuppliers();

  const count = window._pendingExpenseImports.length;
  // Đưa các dòng chi phí mới vào đầu danh sách
  OFFICE_EXPENSES.unshift(...window._pendingExpenseImports);
  saveOfficeExpenses();

  window.closeImportExpensesModal();

  renderExpenseList();
  renderExpenseAnalytics();
  populateExpenseDropdowns();

  if(typeof toast === 'function'){
    toast(`✅ Đã nhập thành công ${count} khoản chi phí từ Excel (Tiến trình: Bước 1)!`, '✅');
  }
};

window.copyToClipboard = function(text, label){
  if(!text || text === '--') return;
  const lbl = label ? label : 'thông tin';
  const cleanText = String(text).trim();

  function onCopied(){
    if(typeof toast === 'function') toast(`📋 Đã sao chép ${lbl}: ${cleanText}`, '✅');
  }

  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(cleanText).then(onCopied).catch(()=>{
      fallbackCopy(cleanText);
    });
  } else {
    fallbackCopy(cleanText);
  }

  function fallbackCopy(str){
    try {
      const ta = document.createElement('textarea');
      ta.value = str;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok) onCopied();
      else if(typeof toast === 'function') toast(`${cleanText}`, 'ℹ️');
    } catch(err){
      if(typeof toast === 'function') toast(`${cleanText}`, 'ℹ️');
    }
  }
};

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
