/* ============================================================
   PHÂN HỆ QUẢN LÝ CHI PHÍ VĂN PHÒNG (OFFICE EXPENSES MODULE)
   Hệ thống Quản lý Hành chính & Chi phí GHN Office Hub
   ============================================================ */

// ─── Danh mục & Nhà cung cấp mặc định ───
const DEFAULT_OFFICE_SUPPLIERS = [
  {
    id: 'sup-evn',
    code: 'EVN-HCM',
    name: 'Tổng Công ty Điện lực TP.HCM (EVN HCMC)',
    taxCode: '0300951119',
    phone: '1900 545454',
    email: 'cskh@evnhcmc.vn',
    bankName: 'Vietcombank - CN Tân Bình',
    bankAcc: '0071000889988',
    bankHolder: 'TONG CONG TY DIEN LUC TP HCM',
    category: 'Điện lực & Năng lượng',
    address: '356 Hai Bà Trưng, P. Tân Định, Quận 1, TP.HCM'
  },
  {
    id: 'sup-sawaco',
    code: 'SAWACO',
    name: 'Tổng Công ty Cấp nước Sài Gòn (SAWACO)',
    taxCode: '0304179357',
    phone: '1900 1567',
    email: 'sawaco@sawaco.com.vn',
    bankName: 'VietinBank - CN TP.HCM',
    bankAcc: '119000045233',
    bankHolder: 'TONG CONG TY CAP NUOC SAI GON',
    category: 'Nước sinh hoạt',
    address: '01 Công Xã Paris, P. Bến Nghé, Quận 1, TP.HCM'
  },
  {
    id: 'sup-viettel',
    code: 'VIETTEL',
    name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel Telecom)',
    taxCode: '0100109106',
    phone: '1800 8000',
    email: 'cskh@viettel.com.vn',
    bankName: 'MBBank - Hội sở chính',
    bankAcc: '0011001234567',
    bankHolder: 'TAP DOAN VIEN THONG QUAN DOI',
    category: 'Internet & Viễn thông',
    address: 'Tòa nhà Viettel Complex, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM'
  },
  {
    id: 'sup-building',
    code: 'BQL-GHN',
    name: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)',
    taxCode: '0312345678',
    phone: '028 3812 9999',
    email: 'bql.building@thuanan.vn',
    bankName: 'Techcombank - CN Tân Phú',
    bankAcc: '19034567890012',
    bankHolder: 'CTY CP DAU TU VA DICH VU BDS THUAN AN',
    category: 'Thuê mặt bằng & Tòa nhà',
    address: 'Tòa nhà GHN Office Hub, Kho Tân Phú, TP.HCM'
  },
  {
    id: 'sup-daikin',
    code: 'DAIVET-ME',
    name: 'Công ty TNHH Cơ Điện Lạnh Đại Việt (Daikin Service)',
    taxCode: '0311223344',
    phone: '0903 112 233',
    email: 'service@daiviet-me.vn',
    bankName: 'Vietcombank - CN Tân Bình',
    bankAcc: '0441000778899',
    bankHolder: 'CTY TNHH CO DIEN LANH DAI VIET',
    category: 'Bảo trì máy lạnh & CSVC',
    address: '45/2 Cộng Hòa, P. 13, Q. Tân Bình, TP.HCM'
  },
  {
    id: 'sup-green',
    code: 'PHUONGNAM-GREEN',
    name: 'Công ty TNHH Cảnh Quan & Cây Xanh Phương Nam',
    taxCode: '0313456789',
    phone: '0918 223 344',
    email: 'green@phuongnam.vn',
    bankName: 'Agribank - CN TP.HCM',
    bankAcc: '6420205123456',
    bankHolder: 'CTY CANH QUAN PHUONG NAM',
    category: 'Cây xanh & Cảnh quan',
    address: '128 Nguyễn Đình Chiểu, Quận 3, TP.HCM'
  },
  {
    id: 'sup-lavie',
    code: 'LAVIE-VN',
    name: 'Công ty TNHH La Vie (Chi nhánh TP.HCM)',
    taxCode: '1100223344',
    phone: '1900 1906',
    email: 'orders@laviewater.com',
    bankName: 'Vietcombank - CN TP.HCM',
    bankAcc: '0071005556667',
    bankHolder: 'CONG TY TNHH LA VIE',
    category: 'Nước uống đóng bình',
    address: 'KCN Tân Tạo, Q. Bình Tân, TP.HCM'
  }
];

// Mock SVG invoice preview
function generateSampleInvoiceSvg(title, code, amount, date){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#f8fafc;font-family:sans-serif;">
    <rect x="20" y="20" width="560" height="760" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="20" y="20" width="560" height="90" rx="12" fill="#f26522"/>
    <text x="50" y="60" fill="#ffffff" font-size="22" font-weight="bold">GHN OFFICE HUB - HÓA ĐƠN ĐIỆN TỬ</text>
    <text x="50" y="88" fill="#ffedd5" font-size="14">Mã chứng từ: ${code} · Ngày: ${date}</text>
    
    <text x="50" y="150" fill="#64748b" font-size="12">KHOẢN MỤC CHI PHÍ</text>
    <text x="50" y="175" fill="#0f172a" font-size="18" font-weight="bold">${title}</text>
    
    <line x1="50" y1="200" x2="550" y2="200" stroke="#e2e8f0" stroke-width="1.5"/>
    
    <text x="50" y="235" fill="#64748b" font-size="12">TỔNG SỐ TIỀN THANH TOÁN (ĐÃ GỒM VAT)</text>
    <text x="50" y="275" fill="#f26522" font-size="32" font-weight="bold">${(amount||0).toLocaleString('vi-VN')} VNĐ</text>
    
    <rect x="50" y="310" width="500" height="140" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="70" y="340" fill="#334155" font-size="14" font-weight="bold">ĐƠN VỊ THỤ HƯỞNG &amp; THÔNG TIN CHUYỂN KHOẢN</text>
    <text x="70" y="370" fill="#64748b" font-size="13">Đơn vị cung cấp dịch vụ được chỉ định</text>
    <text x="70" y="395" fill="#64748b" font-size="13">Nội dung: ${code} GHN THANH TOAN</text>
    <text x="70" y="420" fill="#10b981" font-size="13" font-weight="bold">✓ Hóa đơn điện tử hợp lệ theo quy định Tổng cục Thuế</text>
    
    <circle cx="480" cy="580" r="60" fill="#fef2f2" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
    <text x="445" y="580" fill="#ef4444" font-size="14" font-weight="bold">ĐÃ KIỂM TRA</text>
    <text x="450" y="600" fill="#ef4444" font-size="11">HÀNH CHÍNH GHN</text>
    
    <text x="50" y="740" fill="#94a3b8" font-size="12">Chứng từ số lưu trữ nội bộ GHN Office Hub · Tự động tạo bởi hệ thống</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ─── Danh sách Khoản chi mẫu phong phú (2025 & 2026) ───
const DEFAULT_OFFICE_EXPENSES = [
  // 2026 - T9
  {
    id: 'exp-2609-001',
    code: 'EXP-2609-001',
    title: 'Hóa đơn tiền điện khối văn phòng & Server T09/2026',
    category: 'Điện lực',
    supplierId: 'sup-evn',
    supplierName: 'Tổng Công ty Điện lực TP.HCM (EVN HCMC)',
    amount: 38450000,
    month: 9,
    year: 2026,
    date: '2026-09-05',
    invoiceNo: '0019283',
    step: 2,
    receiptUrl: generateSampleInvoiceSvg('Hóa đơn tiền điện T09/2026', 'EXP-2609-001', 38450000, '05/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã gồm lượng điện tiêu thụ máy lạnh trung tâm tầng 2 & tầng 3',
    history: [
      { step: 1, at: '2026-09-05 08:30', by: 'nhinu@ghn.vn', note: 'Tiếp nhận hóa đơn điện tử EVN' },
      { step: 2, at: '2026-09-06 10:15', by: 'nhinu@ghn.vn', note: 'Hành chính đối soát chỉ số công tơ' }
    ]
  },
  {
    id: 'exp-2609-002',
    code: 'EXP-2609-002',
    title: 'Hóa đơn tiền nước sinh hoạt văn phòng T09/2026',
    category: 'Nước sinh hoạt',
    supplierId: 'sup-sawaco',
    supplierName: 'Tổng Công ty Cấp nước Sài Gòn (SAWACO)',
    amount: 5120000,
    month: 9,
    year: 2026,
    date: '2026-09-04',
    invoiceNo: '0081273',
    step: 3,
    receiptUrl: generateSampleInvoiceSvg('Hóa đơn tiền nước T09/2026', 'EXP-2609-002', 5120000, '04/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Chỉ số nước tháng 9 ổn định, không có rò rỉ',
    history: [
      { step: 1, at: '2026-09-04 09:00', by: 'nhinu@ghn.vn', note: 'Tiếp nhận hóa đơn SAWACO' },
      { step: 2, at: '2026-09-05 14:00', by: 'nhinu@ghn.vn', note: 'Hành chính xác nhận số khối' },
      { step: 3, at: '2026-09-06 11:30', by: 'admin@ghn.vn', note: 'Kế toán kiểm tra hóa đơn hợp lệ' }
    ]
  },
  {
    id: 'exp-2609-003',
    code: 'EXP-2609-003',
    title: 'Cước thuê đường truyền cáp quang Leased Line T09/2026',
    category: 'Internet & Viễn thông',
    supplierId: 'sup-viettel',
    supplierName: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel Telecom)',
    amount: 14500000,
    month: 9,
    year: 2026,
    date: '2026-09-02',
    invoiceNo: '0047219',
    step: 5,
    receiptUrl: generateSampleInvoiceSvg('Cước Internet Leased Line T09/2026', 'EXP-2609-003', 14500000, '02/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Gói Leased Line 150Mbps quốc tế + 500Mbps trong nước',
    history: [
      { step: 1, at: '2026-09-02 08:30', by: 'nhinu@ghn.vn', note: 'Tiếp nhận hóa đơn Viettel' },
      { step: 2, at: '2026-09-03 09:00', by: 'nhinu@ghn.vn', note: 'Hành chính xác nhận SLA mạng 99.9%' },
      { step: 3, at: '2026-09-03 14:20', by: 'admin@ghn.vn', note: 'Kế toán lập đề nghị chi' },
      { step: 4, at: '2026-09-04 10:00', by: 'nhinu@ghn.vn', note: 'BGĐ duyệt chi' },
      { step: 5, at: '2026-09-04 15:30', by: 'nhinu@ghn.vn', note: 'Đã hoàn tất thanh toán ủy nhiệm chi' }
    ]
  },
  {
    id: 'exp-2609-004',
    code: 'EXP-2609-004',
    title: 'Tiền thuê mặt bằng văn phòng GHN Hub Tân Phú T09/2026',
    category: 'Thuê mặt bằng & Tòa nhà',
    supplierId: 'sup-building',
    supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)',
    amount: 125000000,
    month: 9,
    year: 2026,
    date: '2026-09-01',
    invoiceNo: '0038491',
    step: 4,
    receiptUrl: generateSampleInvoiceSvg('Tiền thuê mặt bằng văn phòng T09/2026', 'EXP-2609-004', 125000000, '01/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Phí thuê diện tích 1.200m2 + phí quản lý tòa nhà',
    history: [
      { step: 1, at: '2026-09-01 09:00', by: 'nhinu@ghn.vn', note: 'Tiếp nhận hóa đơn từ BQL Tòa nhà' },
      { step: 2, at: '2026-09-02 11:00', by: 'nhinu@ghn.vn', note: 'Hành chính kiểm tra hợp đồng thuê' },
      { step: 3, at: '2026-09-03 16:00', by: 'admin@ghn.vn', note: 'Kế toán hoàn tất hồ sơ trình ký' },
      { step: 4, at: '2026-09-05 09:30', by: 'nhinu@ghn.vn', note: 'Trình BGĐ duyệt chi chuyển khoản' }
    ]
  },
  {
    id: 'exp-2609-005',
    code: 'EXP-2609-005',
    title: 'Bảo trì bảo dưỡng định kỳ hệ thống máy lạnh VRV T09/2026',
    category: 'Bảo trì máy lạnh & CSVC',
    supplierId: 'sup-daikin',
    supplierName: 'Công ty TNHH Cơ Điện Lạnh Đại Việt (Daikin Service)',
    amount: 8500000,
    month: 9,
    year: 2026,
    date: '2026-09-07',
    invoiceNo: '0023419',
    step: 1,
    receiptUrl: generateSampleInvoiceSvg('Bảo trì máy lạnh VRV T09/2026', 'EXP-2609-005', 8500000, '07/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Vệ sinh lưới lọc 14 dàn lạnh, nạp bổ sung gas R410A',
    history: [
      { step: 1, at: '2026-09-07 14:00', by: 'nhinu@ghn.vn', note: 'Ký biên bản nghiệm thu & tiếp nhận đề xuất' }
    ]
  },
  {
    id: 'exp-2609-006',
    code: 'EXP-2609-006',
    title: 'Chi phí thuê và chăm sóc cây xanh văn phòng T09/2026',
    category: 'Cây xanh & Cảnh quan',
    supplierId: 'sup-green',
    supplierName: 'Công ty TNHH Cảnh Quan & Cây Xanh Phương Nam',
    amount: 4800000,
    month: 9,
    year: 2026,
    date: '2026-09-03',
    invoiceNo: '0011827',
    step: 5,
    receiptUrl: generateSampleInvoiceSvg('Thuê & chăm sóc cây xanh T09/2026', 'EXP-2609-006', 4800000, '03/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Thay mới 12 chậu kim tiền & thiết mộc lan sảnh lễ tân',
    history: [
      { step: 1, at: '2026-09-03 10:00', by: 'nhinu@ghn.vn', note: 'Tiếp nhận đề xuất' },
      { step: 5, at: '2026-09-05 16:00', by: 'nhinu@ghn.vn', note: 'Đã thanh toán hoàn tất' }
    ]
  },
  {
    id: 'exp-2609-007',
    code: 'EXP-2609-007',
    title: 'Cung cấp nước khoáng bình La Vie 19L tháng 09/2026',
    category: 'Nước uống đóng bình',
    supplierId: 'sup-lavie',
    supplierName: 'Công ty TNHH La Vie (Chi nhánh TP.HCM)',
    amount: 6250000,
    month: 9,
    year: 2026,
    date: '2026-09-06',
    invoiceNo: '0077182',
    step: 5,
    receiptUrl: generateSampleInvoiceSvg('Cung cấp nước khoáng bình La Vie T09/2026', 'EXP-2609-007', 6250000, '06/09/2026'),
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Giao 125 bình 19L cho các tầng văn phòng',
    history: [
      { step: 1, at: '2026-09-06 09:30', by: 'nhinu@ghn.vn', note: 'Tiếp nhận hóa đơn' },
      { step: 5, at: '2026-09-08 14:00', by: 'nhinu@ghn.vn', note: 'Đã thanh toán hoàn tất' }
    ]
  },

  // 2026 - T8
  {
    id: 'exp-2608-001',
    code: 'EXP-2608-001',
    title: 'Hóa đơn tiền điện tòa nhà T08/2026',
    category: 'Điện lực',
    supplierId: 'sup-evn',
    supplierName: 'Tổng Công ty Điện lực TP.HCM (EVN HCMC)',
    amount: 41200000,
    month: 8,
    year: 2026,
    date: '2026-08-05',
    invoiceNo: '0018742',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã hoàn tất thanh toán'
  },
  {
    id: 'exp-2608-002',
    code: 'EXP-2608-002',
    title: 'Hóa đơn tiền nước sinh hoạt T08/2026',
    category: 'Nước sinh hoạt',
    supplierId: 'sup-sawaco',
    supplierName: 'Tổng Công ty Cấp nước Sài Gòn (SAWACO)',
    amount: 4950000,
    month: 8,
    year: 2026,
    date: '2026-08-04',
    invoiceNo: '0080129',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã hoàn tất thanh toán'
  },
  {
    id: 'exp-2608-003',
    code: 'EXP-2608-003',
    title: 'Cước Internet Leased Line Viettel T08/2026',
    category: 'Internet & Viễn thông',
    supplierId: 'sup-viettel',
    supplierName: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel Telecom)',
    amount: 14500000,
    month: 8,
    year: 2026,
    date: '2026-08-03',
    invoiceNo: '0046182',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã thanh toán'
  },
  {
    id: 'exp-2608-004',
    code: 'EXP-2608-004',
    title: 'Tiền thuê mặt bằng văn phòng T08/2026',
    category: 'Thuê mặt bằng & Tòa nhà',
    supplierId: 'sup-building',
    supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)',
    amount: 125000000,
    month: 8,
    year: 2026,
    date: '2026-08-01',
    invoiceNo: '0037812',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã hoàn tất'
  },
  {
    id: 'exp-2608-005',
    code: 'EXP-2608-005',
    title: 'Chi phí chăm sóc cây xanh & Nước uống La Vie T08/2026',
    category: 'Cây xanh & Cảnh quan',
    supplierId: 'sup-green',
    supplierName: 'Công ty TNHH Cảnh Quan & Cây Xanh Phương Nam',
    amount: 10650000,
    month: 8,
    year: 2026,
    date: '2026-08-05',
    invoiceNo: '0010992',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã thanh toán'
  },

  // 2026 - T7
  {
    id: 'exp-2607-001',
    code: 'EXP-2607-001',
    title: 'Tổng chi phí điện, nước & mạng cáp quang T07/2026',
    category: 'Điện lực',
    supplierId: 'sup-evn',
    supplierName: 'Tổng Công ty Điện lực TP.HCM (EVN HCMC)',
    amount: 58900000,
    month: 7,
    year: 2026,
    date: '2026-07-05',
    invoiceNo: '0017652',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã thanh toán'
  },
  {
    id: 'exp-2607-002',
    code: 'EXP-2607-002',
    title: 'Tiền thuê mặt bằng văn phòng T07/2026',
    category: 'Thuê mặt bằng & Tòa nhà',
    supplierId: 'sup-building',
    supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)',
    amount: 125000000,
    month: 7,
    year: 2026,
    date: '2026-07-01',
    invoiceNo: '0036981',
    step: 5,
    receiptUrl: '',
    createdBy: 'nhinu@ghn.vn',
    department: 'Office Admin General',
    note: 'Đã thanh toán'
  },

  // 2026 - T1..T6
  { id: 'exp-2606-001', code: 'EXP-2606-001', title: 'Chi phí vận hành văn phòng T06/2026', category: 'Thuê mặt bằng & Tòa nhà', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)', amount: 198500000, month: 6, year: 2026, date: '2026-06-05', step: 5 },
  { id: 'exp-2605-001', code: 'EXP-2605-001', title: 'Chi phí vận hành văn phòng T05/2026 (Cao điểm)', category: 'Điện lực', supplierId: 'sup-evn', supplierName: 'Tổng Công ty Điện lực TP.HCM (EVN HCMC)', amount: 205300000, month: 5, year: 2026, date: '2026-05-05', step: 5 },
  { id: 'exp-2604-001', code: 'EXP-2604-001', title: 'Chi phí vận hành văn phòng T04/2026', category: 'Thuê mặt bằng & Tòa nhà', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)', amount: 192000000, month: 4, year: 2026, date: '2026-04-05', step: 5 },
  { id: 'exp-2603-001', code: 'EXP-2603-001', title: 'Chi phí vận hành văn phòng T03/2026', category: 'Thuê mặt bằng & Tòa nhà', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)', amount: 188400000, month: 3, year: 2026, date: '2026-03-05', step: 5 },
  { id: 'exp-2602-001', code: 'EXP-2602-001', title: 'Chi phí vận hành văn phòng T02/2026 (Tết)', category: 'Thuê mặt bằng & Tòa nhà', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)', amount: 165200000, month: 2, year: 2026, date: '2026-02-05', step: 5 },
  { id: 'exp-2601-001', code: 'EXP-2601-001', title: 'Chi phí vận hành văn phòng T01/2026', category: 'Thuê mặt bằng & Tòa nhà', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)', amount: 185000000, month: 1, year: 2026, date: '2026-01-05', step: 5 },

  // Dữ liệu đối sánh 2025
  { id: 'exp-2501', code: 'EXP-2501', title: 'Tổng chi phí T01/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 172000000, month: 1, year: 2025, step: 5, date: '2025-01-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2502', code: 'EXP-2502', title: 'Tổng chi phí T02/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 158000000, month: 2, year: 2025, step: 5, date: '2025-02-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2503', code: 'EXP-2503', title: 'Tổng chi phí T03/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 176000000, month: 3, year: 2025, step: 5, date: '2025-03-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2504', code: 'EXP-2504', title: 'Tổng chi phí T04/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 182000000, month: 4, year: 2025, step: 5, date: '2025-04-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2505', code: 'EXP-2505', title: 'Tổng chi phí T05/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 195000000, month: 5, year: 2025, step: 5, date: '2025-05-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2506', code: 'EXP-2506', title: 'Tổng chi phí T06/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 189000000, month: 6, year: 2025, step: 5, date: '2025-06-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2507', code: 'EXP-2507', title: 'Tổng chi phí T07/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 184000000, month: 7, year: 2025, step: 5, date: '2025-07-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2508', code: 'EXP-2508', title: 'Tổng chi phí T08/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 191000000, month: 8, year: 2025, step: 5, date: '2025-08-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2509', code: 'EXP-2509', title: 'Tổng chi phí T09/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 186000000, month: 9, year: 2025, step: 5, date: '2025-09-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2510', code: 'EXP-2510', title: 'Tổng chi phí T10/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 188000000, month: 10, year: 2025, step: 5, date: '2025-10-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2511', code: 'EXP-2511', title: 'Tổng chi phí T11/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 192000000, month: 11, year: 2025, step: 5, date: '2025-11-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' },
  { id: 'exp-2512', code: 'EXP-2512', title: 'Tổng chi phí T12/2025', category: 'Thuê mặt bằng & Tòa nhà', amount: 210000000, month: 12, year: 2025, step: 5, date: '2025-12-05', supplierId: 'sup-building', supplierName: 'Công ty CP Đầu Tư & Dịch Vụ BĐS Thuận An (BQL Tòa Nhà)' }
];

// ─── Biến trạng thái toàn cục phân hệ ───
let OFFICE_SUPPLIERS = null;
let OFFICE_EXPENSES = null;

let expTrendChartInstance = null;
let expCategoryChartInstance = null;
let expSupplierChartInstance = null;

let expCurrentDetailId = null;
let expensesEventsBound = false;

// ─── Khởi tạo từ Cloud / LocalStorage ───
window.initOfficeExpensesFromCloud = function(raw, persistDefaults){
  raw = raw || {};
  OFFICE_SUPPLIERS = (Array.isArray(raw.officeSuppliers) && raw.officeSuppliers.length) ? raw.officeSuppliers : null;
  if(!OFFICE_SUPPLIERS){
    OFFICE_SUPPLIERS = JSON.parse(JSON.stringify(DEFAULT_OFFICE_SUPPLIERS));
    if(persistDefaults && typeof cloudSet === 'function') cloudSet('officeSuppliers', OFFICE_SUPPLIERS);
  }

  OFFICE_EXPENSES = (Array.isArray(raw.officeExpenses) && raw.officeExpenses.length) ? raw.officeExpenses : null;
  if(!OFFICE_EXPENSES){
    OFFICE_EXPENSES = JSON.parse(JSON.stringify(DEFAULT_OFFICE_EXPENSES));
    if(persistDefaults && typeof cloudSet === 'function') cloudSet('officeExpenses', OFFICE_EXPENSES);
  }
};

function ensureOfficeExpensesData(){
  if(!OFFICE_SUPPLIERS || !OFFICE_SUPPLIERS.length){
    OFFICE_SUPPLIERS = JSON.parse(JSON.stringify(DEFAULT_OFFICE_SUPPLIERS));
  }
  if(!OFFICE_EXPENSES || !OFFICE_EXPENSES.length){
    OFFICE_EXPENSES = JSON.parse(JSON.stringify(DEFAULT_OFFICE_EXPENSES));
  }
}

function saveOfficeExpenses(){
  if(typeof cloudSet === 'function') cloudSet('officeExpenses', OFFICE_EXPENSES);
}

function saveOfficeSuppliers(){
  if(typeof cloudSet === 'function') cloudSet('officeSuppliers', OFFICE_SUPPLIERS);
}

// ─── Helper Functions ───
function getStepInfo(step){
  step = String(step);
  switch(step){
    case '1':
      return { num: 1, label: 'B1: Tiếp nhận đề xuất', cls: 'exp-status-1', desc: 'Đã tiếp nhận đề xuất & hóa đơn' };
    case '2':
      return { num: 2, label: 'B2: Hành chính đối soát', cls: 'exp-status-2', desc: 'HC đối soát chỉ số & hợp đồng' };
    case '3':
      return { num: 3, label: 'B3: Kế toán kiểm tra', cls: 'exp-status-3', desc: 'Kế toán rà soát thuế & lập đề nghị chi' };
    case '4':
      return { num: 4, label: 'B4: BGĐ phê duyệt', cls: 'exp-status-4', desc: 'Đang trình Ban Giám Đốc ký duyệt' };
    case '5':
      return { num: 5, label: 'B5: Đã thanh toán', cls: 'exp-status-5', desc: 'Đã hoàn tất thanh toán ủy nhiệm chi' };
    case 'rejected':
      return { num: 0, label: '✕ Đã từ chối', cls: 'exp-status-rej', desc: 'Đề xuất chi phí bị từ chối / hủy bỏ' };
    default:
      return { num: 1, label: 'B1: Tiếp nhận', cls: 'exp-status-1', desc: '' };
  }
}

window.closeModal = function(modalId){
  const el = document.getElementById(modalId);
  if(el) el.classList.remove('show');
};

window.openModal = function(modalId){
  const el = document.getElementById(modalId);
  if(el) el.classList.add('show');
};

// ─── Khởi động trang & Sự kiện ───
window.renderExpensesPage = function(){
  ensureOfficeExpensesData();
  setupExpensesEventsOnce();
  populateExpenseDropdowns();

  // Đảm bảo subpage đầu tiên hiển thị
  const activeSubBtn = document.querySelector('#expensesSubNav button.active');
  const sub = activeSubBtn ? activeSubBtn.dataset.sub : 'analytics';

  if(sub === 'analytics') renderExpenseAnalytics();
  else if(sub === 'list') renderExpenseList();
  else if(sub === 'suppliers') renderSuppliersList();
};

function setupExpensesEventsOnce(){
  if(expensesEventsBound) return;
  expensesEventsBound = true;

  // Setup Sub Navigation
  if(typeof setupSubNav === 'function'){
    setupSubNav('expensesSubNav', 'exp', (sub)=>{
      if(sub === 'analytics') renderExpenseAnalytics();
      else if(sub === 'list') renderExpenseList();
      else if(sub === 'suppliers') renderSuppliersList();
    });
  }

  // Analytics Filter events
  const anYear = document.getElementById('expAnalyticsYearSelect');
  const anMonth = document.getElementById('expAnalyticsMonthSelect');
  if(anYear) anYear.addEventListener('change', renderExpenseAnalytics);
  if(anMonth) anMonth.addEventListener('change', renderExpenseAnalytics);

  // List Filter events
  const filterInputs = ['expFilterYear', 'expFilterMonth', 'expFilterCategory', 'expFilterSupplier', 'expFilterStep', 'expSearchInput'];
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
      const fSup = document.getElementById('expFilterSupplier'); if(fSup) fSup.value = 'all';
      const fStep = document.getElementById('expFilterStep'); if(fStep) fStep.value = 'all';
      renderExpenseList();
    });
  }

  // Supplier Search
  const supSearch = document.getElementById('expSupplierSearchInput');
  if(supSearch) supSearch.addEventListener('input', renderSuppliersList);

  // Header Buttons
  const btnAddExp = document.getElementById('expAddExpenseBtn');
  if(btnAddExp) btnAddExp.addEventListener('click', window.openAddExpenseModal);

  const btnAddSup = document.getElementById('expAddSupplierBtn');
  if(btnAddSup) btnAddSup.addEventListener('click', window.openAddSupplierModal);

  const btnExportExcel = document.getElementById('expExportExcelBtn');
  if(btnExportExcel) btnExportExcel.addEventListener('click', window.exportExpensesToExcel);

  // Save Expense Form
  const btnSaveExp = document.getElementById('expBtnSaveExpense');
  if(btnSaveExp) btnSaveExp.addEventListener('click', handleSaveExpense);

  // Save Supplier Form
  const btnSaveSup = document.getElementById('expBtnSaveSupplier');
  if(btnSaveSup) btnSaveSup.addEventListener('click', handleSaveSupplier);

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
      if(file.size > 2.5 * 1024 * 1024){
        if(typeof toast === 'function') toast('Ảnh dung lượng quá lớn, vui lòng chọn file dưới 2.5MB', '⚠️');
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
  // 1. Supplier Selects
  const selSupplier = document.getElementById('expInpSupplierSelect');
  const filterSupplier = document.getElementById('expFilterSupplier');

  if(selSupplier){
    const curVal = selSupplier.value;
    let html = '<option value="">-- Chọn Nhà cung cấp --</option>';
    OFFICE_SUPPLIERS.forEach(s => {
      html += `<option value="${s.id}">${s.code} - ${s.name}</option>`;
    });
    selSupplier.innerHTML = html;
    if(curVal) selSupplier.value = curVal;
  }

  if(filterSupplier){
    const curVal = filterSupplier.value;
    let html = '<option value="all">Tất cả nhà cung cấp</option>';
    OFFICE_SUPPLIERS.forEach(s => {
      html += `<option value="${s.id}">${s.code} - ${s.name}</option>`;
    });
    filterSupplier.innerHTML = html;
    if(curVal) filterSupplier.value = curVal;
  }

  // 2. Category Filter
  const filterCat = document.getElementById('expFilterCategory');
  if(filterCat){
    const curVal = filterCat.value;
    const cats = Array.from(new Set(OFFICE_EXPENSES.map(e => e.category).filter(Boolean)));
    let html = '<option value="all">Tất cả danh mục</option>';
    cats.forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });
    filterCat.innerHTML = html;
    if(curVal) filterCat.value = curVal;
  }
}

// ─── TAB 1: PHÂN TÍCH & BÁO CÁO (ANALYTICS) ───
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
  const paidList = expensesForPeriod.filter(e => String(e.step) === '5');
  const pendingList = expensesForPeriod.filter(e => String(e.step) !== '5');

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
        elMom.textContent = 'Kỳ phát sinh mới';
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

  // 4. Top NCC Bar Chart
  const supTotals = {};
  expensesForPeriod.forEach(e => {
    const name = e.supplierName || 'Khác';
    supTotals[name] = (supTotals[name] || 0) + (Number(e.amount)||0);
  });
  renderSupplierChart(supTotals);

  // 5. Bảng phân tích biến động 12 tháng
  renderMonthlyVarianceTable(selectedYear, priorYear, curMonthly, priorMonthly);
}

function renderTrendChart(yearCur, yearPrior, dataCur, dataPrior){
  const canvas = document.getElementById('expTrendChartCanvas');
  if(!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if(expTrendChartInstance) expTrendChartInstance.destroy();

  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, 'rgba(242, 101, 34, 0.25)');
  grad.addColorStop(1, 'rgba(242, 101, 34, 0.00)');

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
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#f26522',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          label: `Năm trước ${yearPrior} (VNĐ)`,
          data: dataPrior,
          borderColor: '#0284c7',
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#0284c7',
          pointBorderColor: '#ffffff',
          pointRadius: 4
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

function renderSupplierChart(supTotals){
  const canvas = document.getElementById('expSupplierChartCanvas');
  if(!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if(expSupplierChartInstance) expSupplierChartInstance.destroy();

  const sorted = Object.entries(supTotals).sort((a,b)=>b[1]-a[1]).slice(0, 5);
  const labels = sorted.map(s => s[0].length > 22 ? s[0].substring(0, 22) + '...' : s[0]);
  const data = sorted.map(s => s[1]);

  expSupplierChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Số tiền chi trả (VNĐ)',
        data: data,
        backgroundColor: '#0284c7',
        borderRadius: 6,
        maxBarThickness: 32
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
              return ` Chi trả: ${(ctx.raw||0).toLocaleString('vi-VN')} ₫`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
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

function renderMonthlyVarianceTable(yearCur, yearPrior, curArr, priorArr){
  const tbody = document.getElementById('expMonthlyTableBody');
  if(!tbody) return;

  let rowsHtml = '';
  for(let i = 0; i < 12; i++){
    const m = i + 1;
    const curVal = curArr[i] || 0;
    const priorVal = priorArr[i] || 0;
    const diff = curVal - priorVal;
    let pctBadge = '<span class="exp-diff-badge">--</span>';
    let note = '';

    if(priorVal > 0){
      const pct = ((diff / priorVal) * 100).toFixed(1);
      if(diff > 0){
        pctBadge = `<span class="exp-diff-badge pos">+${pct}% ↗</span>`;
        note = curVal > 40000000 ? 'Tăng do cao điểm phụ tải hoặc diện tích sử dụng' : 'Tăng chi phí dịch vụ';
      } else if(diff < 0){
        pctBadge = `<span class="exp-diff-badge neg">${pct}% ↘</span>`;
        note = 'Tiết kiệm chi phí so với cùng kỳ';
      } else {
        pctBadge = `<span class="exp-diff-badge">0.0%</span>`;
        note = 'Chi phí ổn định';
      }
    } else if(curVal > 0){
      pctBadge = `<span class="exp-diff-badge pos">Mới ↗</span>`;
      note = 'Kỳ phát sinh mới';
    } else {
      note = 'Chưa phát sinh dữ liệu';
    }

    const diffFormatted = (diff >= 0 ? '+' : '') + diff.toLocaleString('vi-VN') + ' ₫';

    rowsHtml += `<tr>
      <td><b>Tháng ${m}</b></td>
      <td style="text-align:right;"><b style="color:#0f172a;">${curVal.toLocaleString('vi-VN')} ₫</b></td>
      <td style="text-align:right;color:#64748b;">${priorVal.toLocaleString('vi-VN')} ₫</td>
      <td style="text-align:right;font-weight:700;color:${diff > 0 ? '#ef4444' : (diff < 0 ? '#10b981' : '#64748b')};">${diffFormatted}</td>
      <td style="text-align:center;">${pctBadge}</td>
      <td style="font-size:12px;color:#475569;">${note}</td>
    </tr>`;
  }
  tbody.innerHTML = rowsHtml;
}

// ─── TAB 2: DANH SÁCH & TIẾN TRÌNH DUYỆT (LIST) ───
function renderExpenseList(){
  ensureOfficeExpensesData();
  const yearEl = document.getElementById('expFilterYear');
  const monthEl = document.getElementById('expFilterMonth');
  const catEl = document.getElementById('expFilterCategory');
  const supEl = document.getElementById('expFilterSupplier');
  const stepEl = document.getElementById('expFilterStep');
  const searchEl = document.getElementById('expSearchInput');

  const yearVal = yearEl ? yearEl.value : 'all';
  const monthVal = monthEl ? monthEl.value : 'all';
  const catVal = catEl ? catEl.value : 'all';
  const supVal = supEl ? supEl.value : 'all';
  const stepVal = stepEl ? stepEl.value : 'all';
  const query = (searchEl ? searchEl.value : '').trim().toLowerCase();

  const filtered = OFFICE_EXPENSES.filter(item => {
    if(yearVal !== 'all' && String(item.year) !== yearVal) return false;
    if(monthVal !== 'all' && String(item.month) !== monthVal) return false;
    if(catVal !== 'all' && item.category !== catVal) return false;
    if(supVal !== 'all' && item.supplierId !== supVal) return false;
    if(stepVal !== 'all' && String(item.step) !== stepVal) return false;
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
    for(let s = 1; s <= 5; s++){
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
        ${item.invoiceNo ? `<div style="font-size:11px;color:#64748b;">Số HĐ: ${item.invoiceNo}</div>` : ''}
      </td>
      <td><span class="pill" style="background:#f1f5f9;color:#334155;font-size:12px;">${item.category || 'Khác'}</span></td>
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
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px;color:#94a3b8;background:#fff;border-radius:14px;border:1px dashed #cbd5e1;">
      <span style="font-size:40px;display:block;margin-bottom:8px;">🏢</span>
      Không tìm thấy Nhà cung cấp nào phù hợp.
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
          <span class="pill cam" style="font-size:11px;padding:2px 8px;margin-top:4px;display:inline-block;">${s.code || 'NCC'}</span>
        </div>
      </div>

      <div class="supplier-meta">
        <div class="supplier-meta-row">
          <span class="lbl">Mã số thuế:</span>
          <span class="val"><b>${s.taxCode || '--'}</b></span>
        </div>
        <div class="supplier-meta-row">
          <span class="lbl">Hotline/SĐT:</span>
          <span class="val">${s.phone || '--'}</span>
        </div>
        <div class="supplier-meta-row">
          <span class="lbl">Email:</span>
          <span class="val" style="color:#0284c7;">${s.email || '--'}</span>
        </div>
        <div class="supplier-meta-row">
          <span class="lbl">Lĩnh vực:</span>
          <span class="val">${s.category || '--'}</span>
        </div>
      </div>

      <div class="supplier-bank-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-weight:700;font-size:11.5px;color:#0284c7;">💳 TÀI KHOẢN NGÂN HÀNG:</span>
          <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px;" onclick="window.copyToClipboard('${s.bankAcc || ''}')">📋 Copy STK</button>
        </div>
        <div><b>${s.bankName || '--'}</b></div>
        <div style="font-family:monospace;font-size:13.5px;color:#0f172a;font-weight:800;letter-spacing:0.5px;margin:2px 0;">
          ${s.bankAcc || '--'}
        </div>
        <div style="font-size:11.5px;color:#64748b;">Chủ TK: <b>${s.bankHolder || '--'}</b></div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:10px 12px;border-radius:10px;margin-bottom:12px;font-size:12.5px;">
        <span style="color:#64748b;">Tổng lũy kế:</span>
        <span style="font-weight:800;color:var(--cam);">${totalPaid.toLocaleString('vi-VN')} ₫ (${invoiceCount} HĐ)</span>
      </div>

      <div style="display:flex;gap:8px;">
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
  const pct = curNum === 0 ? 0 : Math.max(0, Math.min(100, (curNum - 1) * 25));
  const progressLine = document.getElementById('expDetailStepperProgress');
  if(progressLine) progressLine.style.width = pct + '%';

  for(let s = 1; s <= 5; s++){
    const el = document.getElementById('expStep' + s);
    if(el){
      el.classList.remove('active', 'completed');
      if(curNum === s) el.classList.add('active');
      else if(curNum > s) el.classList.add('completed');
    }
  }

  const advBtn = document.getElementById('expDetailAdvanceBtn');
  if(advBtn){
    if(curNum >= 5){
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
          <span>MST: <b>${sup.taxCode || '--'}</b></span>
          <span>Hotline: ${sup.phone || '--'}</span>
        </div>
        <div style="border-top:1px dashed #cbd5e1;padding-top:6px;margin-top:6px;">
          <div style="font-size:11.5px;color:#0284c7;font-weight:700;">💳 NGÂN HÀNG THỤ HƯỞNG:</div>
          <div style="font-weight:700;font-size:13px;color:#0f172a;">${sup.bankName || '--'}</div>
          <div style="font-family:monospace;font-weight:800;font-size:14px;color:var(--cam);">${sup.bankAcc || '--'}</div>
          <div style="font-size:11.5px;color:#64748b;">Chủ TK: <b>${sup.bankHolder || '--'}</b></div>
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
  if(curStep >= 5){
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
  document.getElementById('expInpCategory').value = 'Điện lực';
  document.getElementById('expInpAmount').value = '';
  document.getElementById('expInpMonth').value = String(now.getMonth() + 1);
  document.getElementById('expInpYear').value = String(now.getFullYear());
  document.getElementById('expInpSupplierSelect').value = '';
  document.getElementById('expInpDate').value = now.toISOString().split('T')[0];
  document.getElementById('expInpInvoiceNo').value = '';
  document.getElementById('expInpStep').value = '1';
  document.getElementById('expInpNote').value = '';

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
  document.getElementById('expInpCategory').value = item.category || 'Điện lực';
  document.getElementById('expInpAmount').value = item.amount || '';
  document.getElementById('expInpMonth').value = String(item.month || 9);
  document.getElementById('expInpYear').value = String(item.year || 2026);
  document.getElementById('expInpSupplierSelect').value = item.supplierId || '';
  document.getElementById('expInpDate').value = item.date || '';
  document.getElementById('expInpInvoiceNo').value = item.invoiceNo || '';
  document.getElementById('expInpStep').value = String(item.step || '1');
  document.getElementById('expInpNote').value = item.note || '';

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

function handleSaveExpense(){
  const editId = document.getElementById('expInpEditId').value.trim();
  const code = document.getElementById('expInpCode').value.trim();
  const title = document.getElementById('expInpTitle').value.trim();
  const category = document.getElementById('expInpCategory').value;
  const amount = parseFloat(document.getElementById('expInpAmount').value) || 0;
  const month = parseInt(document.getElementById('expInpMonth').value, 10) || 9;
  const year = parseInt(document.getElementById('expInpYear').value, 10) || 2026;
  const supplierId = document.getElementById('expInpSupplierSelect').value;
  const date = document.getElementById('expInpDate').value;
  const invoiceNo = document.getElementById('expInpInvoiceNo').value.trim();
  const step = document.getElementById('expInpStep').value;
  const note = document.getElementById('expInpNote').value.trim();
  const receiptUrl = document.getElementById('expInpReceiptBase64').value;

  if(!code){ if(typeof toast==='function') toast('Vui lòng nhập mã chi phí', '⚠️'); return; }
  if(!title){ if(typeof toast==='function') toast('Vui lòng nhập nội dung chi phí', '⚠️'); return; }
  if(amount <= 0){ if(typeof toast==='function') toast('Vui lòng nhập số tiền thanh toán hợp lệ', '⚠️'); return; }

  const sup = OFFICE_SUPPLIERS.find(s => s.id === supplierId);
  const supplierName = sup ? sup.name : '';

  if(editId){
    const idx = OFFICE_EXPENSES.findIndex(e => e.id === editId);
    if(idx !== -1){
      OFFICE_EXPENSES[idx] = {
        ...OFFICE_EXPENSES[idx],
        code, title, category, amount, month, year, supplierId, supplierName, date, invoiceNo, step, note,
        receiptUrl: receiptUrl || OFFICE_EXPENSES[idx].receiptUrl
      };
      if(typeof toast==='function') toast('✅ Đã cập nhật khoản chi phí!', '✅');
    }
  } else {
    const newExp = {
      id: 'exp-' + Date.now(),
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
      receiptUrl: receiptUrl || generateSampleInvoiceSvg(title, code, amount, date || 'Hôm nay'),
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

// ─── THÊM / SỬA NHÀ CUNG CẤP ───
window.openAddSupplierModal = function(){
  document.getElementById('expSupplierModalTitle').textContent = '🏢 Thêm Nhà cung cấp mới';
  document.getElementById('supInpEditId').value = '';
  document.getElementById('supInpName').value = '';
  document.getElementById('supInpCode').value = '';
  document.getElementById('supInpTaxCode').value = '';
  document.getElementById('supInpPhone').value = '';
  document.getElementById('supInpEmail').value = '';
  document.getElementById('supInpBankName').value = '';
  document.getElementById('supInpBankAcc').value = '';
  document.getElementById('supInpBankHolder').value = '';
  document.getElementById('supInpCategory').value = '';
  document.getElementById('supInpAddress').value = '';

  window.openModal('expModalSupplierForm');
};

window.openEditSupplierModal = function(id){
  const sup = OFFICE_SUPPLIERS.find(s => s.id === id);
  if(!sup) return;

  document.getElementById('expSupplierModalTitle').textContent = '✏️ Chỉnh sửa thông tin Nhà cung cấp';
  document.getElementById('supInpEditId').value = sup.id;
  document.getElementById('supInpName').value = sup.name || '';
  document.getElementById('supInpCode').value = sup.code || '';
  document.getElementById('supInpTaxCode').value = sup.taxCode || '';
  document.getElementById('supInpPhone').value = sup.phone || '';
  document.getElementById('supInpEmail').value = sup.email || '';
  document.getElementById('supInpBankName').value = sup.bankName || '';
  document.getElementById('supInpBankAcc').value = sup.bankAcc || '';
  document.getElementById('supInpBankHolder').value = sup.bankHolder || '';
  document.getElementById('supInpCategory').value = sup.category || '';
  document.getElementById('supInpAddress').value = sup.address || '';

  window.openModal('expModalSupplierForm');
};

function handleSaveSupplier(){
  const editId = document.getElementById('supInpEditId').value.trim();
  const name = document.getElementById('supInpName').value.trim();
  const code = document.getElementById('supInpCode').value.trim();
  const taxCode = document.getElementById('supInpTaxCode').value.trim();
  const phone = document.getElementById('supInpPhone').value.trim();
  const email = document.getElementById('supInpEmail').value.trim();
  const bankName = document.getElementById('supInpBankName').value.trim();
  const bankAcc = document.getElementById('supInpBankAcc').value.trim();
  const bankHolder = document.getElementById('supInpBankHolder').value.trim();
  const category = document.getElementById('supInpCategory').value.trim();
  const address = document.getElementById('supInpAddress').value.trim();

  if(!name){ if(typeof toast==='function') toast('Vui lòng nhập tên công ty / nhà cung cấp', '⚠️'); return; }

  if(editId){
    const idx = OFFICE_SUPPLIERS.findIndex(s => s.id === editId);
    if(idx !== -1){
      OFFICE_SUPPLIERS[idx] = {
        ...OFFICE_SUPPLIERS[idx],
        name, code, taxCode, phone, email, bankName, bankAcc, bankHolder, category, address
      };
      if(typeof toast==='function') toast('✅ Đã cập nhật thông tin NCC!', '✅');
    }
  } else {
    const newSup = {
      id: 'sup-' + Date.now(),
      name, code, taxCode, phone, email, bankName, bankAcc, bankHolder, category, address
    };
    OFFICE_SUPPLIERS.push(newSup);
    if(typeof toast==='function') toast('✅ Đã lưu Nhà cung cấp mới!', '✅');
  }

  saveOfficeSuppliers();
  populateExpenseDropdowns();
  window.closeModal('expModalSupplierForm');
  renderSuppliersList();
}

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

window.copyToClipboard = function(text){
  if(!text) return;
  navigator.clipboard.writeText(text).then(()=>{
    if(typeof toast==='function') toast(`📋 Đã sao chép STK: ${text}`, '✅');
  }).catch(()=>{
    if(typeof toast==='function') toast(`STK: ${text}`, 'ℹ️');
  });
};

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
