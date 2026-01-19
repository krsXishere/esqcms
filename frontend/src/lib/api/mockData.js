// Mock Data untuk Development (Tidak perlu Backend)

// ========== AUTH ==========
export const MOCK_USERS = {
  admin: {
    id: 1,
    username: "admin",
    password: "admin123", // Plain text untuk demo
    name: "Super Admin",
    email: "admin@seikaku.com",
    role: "super_admin",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
  inspector: {
    id: 2,
    username: "inspector",
    password: "inspector123",
    name: "Inspector User",
    email: "inspector@seikaku.com",
    role: "inspector",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
  checker: {
    id: 3,
    username: "checker",
    password: "checker123",
    name: "Checker User",
    email: "checker@seikaku.com",
    role: "checker",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
  approver: {
    id: 4,
    username: "approver",
    password: "approver123",
    name: "Approver User",
    email: "approver@seikaku.com",
    role: "approver",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
};

// ========== DASHBOARD ==========
export const MOCK_DASHBOARD_KPI = {
  overview: {
    total_checksheets: 1247,
    pending_approval: 23,
    revision_needed: 8,
    completed_today: 45,
    avg_cpk: 1.67,
    ng_rate: 2.3,
    on_time_rate: 94.5,
    active_models: 156,
  },
  analytics: {
    monthly_trend: [
      { month: "Jul", checksheets: 380, ng_rate: 2.1 },
      { month: "Aug", checksheets: 420, ng_rate: 1.9 },
      { month: "Sep", checksheets: 390, ng_rate: 2.4 },
      { month: "Oct", checksheets: 450, ng_rate: 2.0 },
      { month: "Nov", checksheets: 410, ng_rate: 2.2 },
      { month: "Dec", checksheets: 398, ng_rate: 2.3 },
    ],
    top_ng_parts: [
      { part: "Casing A-101", count: 45, percentage: 18.2 },
      { part: "Shaft B-202", count: 38, percentage: 15.4 },
      { part: "Impeller C-303", count: 32, percentage: 13.0 },
      { part: "Bearing D-404", count: 28, percentage: 11.3 },
      { part: "Seal E-505", count: 24, percentage: 9.7 },
    ],
  },
};

export const MOCK_RECENT_CHECKSHEETS = [
  {
    id: 1,
    checksheet_no: "QC-2026-001",
    type: "in_process",
    model: "Pump Model XYZ-100",
    part_name: "Casing A-101",
    inspector: "John Doe",
    status: "pending",
    created_at: "2026-01-13T08:30:00Z",
  },
  {
    id: 2,
    checksheet_no: "QC-2026-002",
    type: "final",
    model: "Pump Model ABC-200",
    part_name: "Shaft B-202",
    inspector: "Jane Smith",
    status: "checked",
    created_at: "2026-01-13T09:15:00Z",
  },
  {
    id: 3,
    checksheet_no: "QC-2026-003",
    type: "in_process",
    model: "Pump Model DEF-300",
    part_name: "Impeller C-303",
    inspector: "Bob Wilson",
    status: "approved",
    created_at: "2026-01-12T14:20:00Z",
  },
  {
    id: 4,
    checksheet_no: "QC-2026-004",
    type: "receiving",
    model: "Pump Model GHI-400",
    part_name: "Bearing D-404",
    inspector: "Alice Brown",
    status: "revision",
    created_at: "2026-01-12T11:45:00Z",
  },
  {
    id: 5,
    checksheet_no: "QC-2026-005",
    type: "final",
    model: "Pump Model JKL-500",
    part_name: "Seal E-505",
    inspector: "Charlie Davis",
    status: "rejected",
    created_at: "2026-01-12T10:00:00Z",
  },
];

// ========== CHECKSHEETS ==========
export const MOCK_CHECKSHEETS = [
  {
    id: 1,
    checksheet_no: "QC-2026-001",
    type: "in_process",
    model_id: 1,
    model_name: "Pump Model XYZ-100",
    part_id: 1,
    part_name: "Casing A-101",
    drawing_no: "DRW-A101-REV3",
    material: "SUS304",
    customer: "PT Ebara Indonesia",
    lot_no: "LOT-2026-001",
    quantity: 50,
    inspector: "John Doe",
    checker: null,
    approver: null,
    status: "pending",
    workflow_stage: "inspection",
    ng_count: 0,
    ng_rate: 0,
    cpk_value: null,
    remarks: null,
    created_at: "2026-01-13T08:30:00Z",
    updated_at: "2026-01-13T08:30:00Z",
  },
  {
    id: 2,
    checksheet_no: "QC-2026-002",
    type: "final",
    model_id: 2,
    model_name: "Pump Model ABC-200",
    part_id: 2,
    part_name: "Shaft B-202",
    drawing_no: "DRW-B202-REV2",
    material: "SUS316L",
    customer: "PT Ebara Manufacturing",
    lot_no: "LOT-2026-002",
    quantity: 30,
    inspector: "Jane Smith",
    checker: "Mike Johnson",
    approver: null,
    status: "checked",
    workflow_stage: "approval",
    ng_count: 2,
    ng_rate: 6.67,
    cpk_value: 1.45,
    remarks: "Minor defects found on 2 pieces",
    created_at: "2026-01-13T09:15:00Z",
    updated_at: "2026-01-13T11:00:00Z",
  },
  {
    id: 3,
    checksheet_no: "QC-2026-003",
    type: "in_process",
    model_id: 3,
    model_name: "Pump Model DEF-300",
    part_id: 3,
    part_name: "Impeller C-303",
    drawing_no: "DRW-C303-REV4",
    material: "Aluminium 6061",
    customer: "PT Pertamina",
    lot_no: "LOT-2026-003",
    quantity: 100,
    inspector: "Bob Wilson",
    checker: "Sarah Lee",
    approver: "David Kim",
    status: "approved",
    workflow_stage: "completed",
    ng_count: 1,
    ng_rate: 1.0,
    cpk_value: 1.89,
    remarks: "All within tolerance",
    created_at: "2026-01-12T14:20:00Z",
    updated_at: "2026-01-13T10:30:00Z",
  },
  {
    id: 4,
    checksheet_no: "QC-2026-004",
    type: "receiving",
    model_id: 4,
    model_name: "Pump Model GHI-400",
    part_id: 4,
    part_name: "Bearing D-404",
    drawing_no: "DRW-D404-REV1",
    material: "Chrome Steel",
    customer: "PT Chevron Pacific",
    lot_no: "LOT-2026-004",
    quantity: 200,
    inspector: "Alice Brown",
    checker: null,
    approver: null,
    status: "revision",
    workflow_stage: "inspection",
    ng_count: 0,
    ng_rate: 0,
    cpk_value: null,
    remarks: "Need to recheck dimension A-B",
    created_at: "2026-01-12T11:45:00Z",
    updated_at: "2026-01-13T08:00:00Z",
  },
  {
    id: 5,
    checksheet_no: "QC-2026-005",
    type: "final",
    model_id: 5,
    model_name: "Pump Model JKL-500",
    part_id: 5,
    part_name: "Seal E-505",
    drawing_no: "DRW-E505-REV2",
    material: "Rubber NBR",
    customer: "PT Total E&P",
    lot_no: "LOT-2026-005",
    quantity: 75,
    inspector: "Charlie Davis",
    checker: "Emma Wilson",
    approver: "Frank Miller",
    status: "rejected",
    workflow_stage: "completed",
    ng_count: 15,
    ng_rate: 20.0,
    cpk_value: 0.87,
    remarks: "Too many defects - batch rejected",
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-01-13T09:00:00Z",
  },
];

// Generate more checksheets untuk pagination testing
for (let i = 6; i <= 50; i++) {
  const types = ["in_process", "final", "receiving"];
  const statuses = ["pending", "checked", "approved", "revision", "rejected"];
  
  MOCK_CHECKSHEETS.push({
    id: i,
    checksheet_no: `QC-2026-${String(i).padStart(3, "0")}`,
    type: types[i % 3],
    model_id: (i % 5) + 1,
    model_name: `Pump Model ${String.fromCharCode(65 + (i % 26))}-${i * 100}`,
    part_id: (i % 5) + 1,
    part_name: `Part ${String.fromCharCode(65 + (i % 26))}-${i}`,
    drawing_no: `DRW-${String.fromCharCode(65 + (i % 26))}-REV${(i % 5) + 1}`,
    material: ["SUS304", "SUS316L", "Aluminium", "Steel", "Rubber"][i % 5],
    customer: ["PT Ebara", "PT Pertamina", "PT Chevron", "PT Total", "PT Shell"][i % 5],
    lot_no: `LOT-2026-${String(i).padStart(3, "0")}`,
    quantity: (i * 10) + 20,
    inspector: ["John", "Jane", "Bob", "Alice", "Charlie"][i % 5],
    checker: i % 2 === 0 ? ["Mike", "Sarah", "Emma"][i % 3] : null,
    approver: i % 3 === 0 ? ["David", "Frank", "Grace"][i % 3] : null,
    status: statuses[i % 5],
    workflow_stage: ["inspection", "checking", "approval", "completed"][i % 4],
    ng_count: i % 10,
    ng_rate: (i % 10) * 2.5,
    cpk_value: i % 2 === 0 ? 1.2 + (i % 10) * 0.1 : null,
    remarks: i % 5 === 0 ? "Sample remark" : null,
    created_at: new Date(2026, 0, 13 - (i % 7), 8 + (i % 12)).toISOString(),
    updated_at: new Date(2026, 0, 13, 8 + (i % 12)).toISOString(),
  });
}

// ========== MODELS ==========
export const MOCK_MODELS = [
  {
    id: 1,
    code: "XYZ-100",
    name: "Pump Model XYZ-100",
    description: "High pressure centrifugal pump",
    category: "Centrifugal Pump",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "ABC-200",
    name: "Pump Model ABC-200",
    description: "Medium pressure pump",
    category: "Centrifugal Pump",
    status: "active",
    created_at: "2025-01-02T00:00:00Z",
  },
  {
    id: 3,
    code: "DEF-300",
    name: "Pump Model DEF-300",
    description: "Low pressure industrial pump",
    category: "Industrial Pump",
    status: "active",
    created_at: "2025-01-03T00:00:00Z",
  },
  {
    id: 4,
    code: "GHI-400",
    name: "Pump Model GHI-400",
    description: "Heavy duty pump",
    category: "Heavy Duty",
    status: "inactive",
    created_at: "2025-01-04T00:00:00Z",
  },
  {
    id: 5,
    code: "JKL-500",
    name: "Pump Model JKL-500",
    description: "Compact pump design",
    category: "Compact",
    status: "active",
    created_at: "2025-01-05T00:00:00Z",
  },
];

// ========== PARTS ==========
export const MOCK_PARTS = [
  {
    id: 1,
    code: "A-101",
    name: "Casing A-101",
    description: "Main pump casing",
    model_id: 1,
    model_name: "Pump Model XYZ-100",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "B-202",
    name: "Shaft B-202",
    description: "Drive shaft assembly",
    model_id: 2,
    model_name: "Pump Model ABC-200",
    status: "active",
    created_at: "2025-01-02T00:00:00Z",
  },
  {
    id: 3,
    code: "C-303",
    name: "Impeller C-303",
    description: "Centrifugal impeller",
    model_id: 3,
    model_name: "Pump Model DEF-300",
    status: "active",
    created_at: "2025-01-03T00:00:00Z",
  },
  {
    id: 4,
    code: "D-404",
    name: "Bearing D-404",
    description: "Ball bearing unit",
    model_id: 4,
    model_name: "Pump Model GHI-400",
    status: "active",
    created_at: "2025-01-04T00:00:00Z",
  },
  {
    id: 5,
    code: "E-505",
    name: "Seal E-505",
    description: "Mechanical seal",
    model_id: 5,
    model_name: "Pump Model JKL-500",
    status: "active",
    created_at: "2025-01-05T00:00:00Z",
  },
];

// ========== USERS ==========
export const MOCK_USERS_LIST = [
  {
    id: 1,
    username: "admin",
    name: "Super Admin",
    email: "admin@seikaku.com",
    role: "super_admin",
    status: "active",
    last_login: "2026-01-13T08:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "inspector",
    name: "Inspector User",
    email: "inspector@seikaku.com",
    role: "inspector",
    status: "active",
    last_login: "2026-01-13T07:30:00Z",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 3,
    username: "checker",
    name: "Checker User",
    email: "checker@seikaku.com",
    role: "checker",
    status: "active",
    last_login: "2026-01-12T16:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 4,
    username: "approver",
    name: "Approver User",
    email: "approver@seikaku.com",
    role: "approver",
    status: "active",
    last_login: "2026-01-13T06:45:00Z",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 5,
    username: "john.doe",
    name: "John Doe",
    email: "john.doe@seikaku.com",
    role: "inspector",
    status: "active",
    last_login: "2026-01-12T14:20:00Z",
    created_at: "2025-02-01T00:00:00Z",
  },
  {
    id: 6,
    username: "jane.smith",
    name: "Jane Smith",
    email: "jane.smith@seikaku.com",
    role: "inspector",
    status: "inactive",
    last_login: "2025-12-20T10:00:00Z",
    created_at: "2025-03-01T00:00:00Z",
  },
];

// ========== CUSTOMERS ==========
export const MOCK_CUSTOMERS = [
  { id: 1, code: "CUST-001", name: "PT Ebara Indonesia", contact: "John Tan", phone: "021-12345678", status: "active" },
  { id: 2, code: "CUST-002", name: "PT Ebara Manufacturing", contact: "Lisa Wong", phone: "021-87654321", status: "active" },
  { id: 3, code: "CUST-003", name: "PT Pertamina", contact: "Budi Santoso", phone: "021-11223344", status: "active" },
  { id: 4, code: "CUST-004", name: "PT Chevron Pacific", contact: "Sarah Lee", phone: "021-55667788", status: "active" },
  { id: 5, code: "CUST-005", name: "PT Total E&P", contact: "Michael Chen", phone: "021-99887766", status: "inactive" },
];

// ========== MATERIALS ==========
export const MOCK_MATERIALS = [
  { id: 1, code: "MAT-001", name: "SUS304", description: "Stainless Steel 304", category: "Metal", status: "active" },
  { id: 2, code: "MAT-002", name: "SUS316L", description: "Stainless Steel 316L", category: "Metal", status: "active" },
  { id: 3, code: "MAT-003", name: "Aluminium 6061", description: "Aluminum Alloy 6061", category: "Metal", status: "active" },
  { id: 4, code: "MAT-004", name: "Chrome Steel", description: "Chrome Alloy Steel", category: "Metal", status: "active" },
  { id: 5, code: "MAT-005", name: "Rubber NBR", description: "Nitrile Rubber", category: "Rubber", status: "active" },
];

// ========== SHIFTS ==========
export const MOCK_SHIFTS = [
  { id: 1, name: "Shift 1", start_time: "07:00", end_time: "15:00", status: "active" },
  { id: 2, name: "Shift 2", start_time: "15:00", end_time: "23:00", status: "active" },
  { id: 3, name: "Shift 3", start_time: "23:00", end_time: "07:00", status: "active" },
];

// ========== SECTIONS ==========
export const MOCK_SECTIONS = [
  { id: 1, code: "SEC-001", name: "Machining", description: "Machining department", status: "active" },
  { id: 2, code: "SEC-002", name: "Assembly", description: "Assembly line", status: "active" },
  { id: 3, code: "SEC-003", name: "Quality Control", description: "QC inspection", status: "active" },
  { id: 4, code: "SEC-004", name: "Finishing", description: "Finishing process", status: "active" },
];

// ========== REJECT REASONS ==========
export const MOCK_REJECT_REASONS = [
  { id: 1, code: "REJ-001", name: "Dimensional Error", description: "Out of tolerance dimension", severity: "high", status: "active" },
  { id: 2, code: "REJ-002", name: "Surface Defect", description: "Scratch or dent on surface", severity: "medium", status: "active" },
  { id: 3, code: "REJ-003", name: "Material Defect", description: "Material quality issue", severity: "high", status: "active" },
  { id: 4, code: "REJ-004", name: "Assembly Error", description: "Incorrect assembly", severity: "medium", status: "active" },
  { id: 5, code: "REJ-005", name: "Missing Parts", description: "Parts not complete", severity: "high", status: "active" },
];

// ========== HELPER FUNCTIONS ==========

// Simulate API delay
export const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Paginate data
export const paginateData = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    page: parseInt(page),
    limit: parseInt(limit),
    total: data.length,
    total_pages: Math.ceil(data.length / limit),
  };
};

// Filter data by search query
export const filterBySearch = (data, searchQuery, fields) => {
  if (!searchQuery) return data;
  
  const query = searchQuery.toLowerCase();
  return data.filter((item) => {
    return fields.some((field) => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(query);
    });
  });
};

// Filter by field value
export const filterByField = (data, field, value) => {
  if (!value || value === "all") return data;
  return data.filter((item) => item[field] === value);
};

// Sort data
export const sortData = (data, sortBy, sortOrder = "asc") => {
  if (!sortBy) return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue === bValue) return 0;
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Generate random ID
export const generateId = () => {
  return Date.now() + Math.floor(Math.random() * 1000);
};
