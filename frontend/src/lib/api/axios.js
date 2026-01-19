"use client";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/useAuthStore";
import {
  MOCK_USERS,
  MOCK_DASHBOARD_KPI,
  MOCK_RECENT_CHECKSHEETS,
  MOCK_CHECKSHEETS,
  MOCK_MODELS,
  MOCK_PARTS,
  MOCK_USERS_LIST,
  MOCK_CUSTOMERS,
  MOCK_MATERIALS,
  MOCK_SHIFTS,
  MOCK_SECTIONS,
  MOCK_REJECT_REASONS,
  delay,
  paginateData,
  filterBySearch,
  filterByField,
  sortData,
  generateId,
} from "./mockData";

// ========== MOCK MODE CONFIG ==========
const USE_MOCK_DATA = true; // Set to false untuk connect ke real backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ========== MOCK API HANDLER ==========
const handleMockRequest = async (config) => {
  await delay(300); // Simulate network delay
  
  const { url, method = "get", data: requestData, params = {} } = config;
  const { page = 1, limit = 10, search = "", sort_by, sort_order } = params;
  
  // ========== AUTH ENDPOINTS ==========
  if (url.includes("/auth/login") && method === "post") {
    const { username, password } = requestData;
    const user = Object.values(MOCK_USERS).find(
      (u) => u.username === username && u.password === password
    );
    
    if (user) {
      const token = `mock_token_${user.id}_${Date.now()}`;
      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      };
    } else {
      throw {
        status: 401,
        message: "Invalid username or password",
      };
    }
  }
  
  if (url.includes("/auth/logout")) {
    return { success: true, message: "Logout successful" };
  }
  
  // ========== DASHBOARD ENDPOINTS ==========
  if (url.includes("/dashboard/kpi")) {
    const period = params.period || "overview";
    return {
      success: true,
      data: MOCK_DASHBOARD_KPI[period] || MOCK_DASHBOARD_KPI.overview,
    };
  }
  
  if (url.includes("/dashboard/recent-checksheets")) {
    return {
      success: true,
      data: MOCK_RECENT_CHECKSHEETS,
    };
  }
  
  // ========== CHECKSHEET ENDPOINTS ==========
  if (url.includes("/checksheets")) {
    let filtered = [...MOCK_CHECKSHEETS];
    
    // Filter by type
    if (params.type) {
      filtered = filterByField(filtered, "type", params.type);
    }
    
    // Filter by status
    if (params.status) {
      filtered = filterByField(filtered, "status", params.status);
    }
    
    // Filter by model
    if (params.model_id) {
      filtered = filterByField(filtered, "model_id", parseInt(params.model_id));
    }
    
    // Search
    if (search) {
      filtered = filterBySearch(filtered, search, [
        "checksheet_no",
        "model_name",
        "part_name",
        "drawing_no",
        "inspector",
      ]);
    }
    
    // Sort
    if (sort_by) {
      filtered = sortData(filtered, sort_by, sort_order);
    }
    
    // GET by ID
    const idMatch = url.match(/\/checksheets\/(\d+)$/);
    if (idMatch && method === "get") {
      const id = parseInt(idMatch[1]);
      const checksheet = filtered.find((c) => c.id === id);
      if (checksheet) {
        return { success: true, data: checksheet };
      } else {
        throw { status: 404, message: "Checksheet not found" };
      }
    }
    
    // CREATE
    if (method === "post") {
      const newChecksheet = {
        id: generateId(),
        ...requestData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_CHECKSHEETS.unshift(newChecksheet);
      return { success: true, message: "Checksheet created", data: newChecksheet };
    }
    
    // UPDATE
    if (method === "put" || method === "patch") {
      const idMatch = url.match(/\/checksheets\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_CHECKSHEETS.findIndex((c) => c.id === id);
        if (index !== -1) {
          MOCK_CHECKSHEETS[index] = {
            ...MOCK_CHECKSHEETS[index],
            ...requestData,
            updated_at: new Date().toISOString(),
          };
          return { success: true, message: "Checksheet updated", data: MOCK_CHECKSHEETS[index] };
        }
      }
    }
    
    // DELETE
    if (method === "delete") {
      const idMatch = url.match(/\/checksheets\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_CHECKSHEETS.findIndex((c) => c.id === id);
        if (index !== -1) {
          MOCK_CHECKSHEETS.splice(index, 1);
          return { success: true, message: "Checksheet deleted" };
        }
      }
    }
    
    // LIST
    return paginateData(filtered, page, limit);
  }
  
  // ========== MODELS ENDPOINTS ==========
  if (url.includes("/models")) {
    let filtered = [...MOCK_MODELS];
    
    if (search) {
      filtered = filterBySearch(filtered, search, ["code", "name", "description"]);
    }
    
    if (params.status) {
      filtered = filterByField(filtered, "status", params.status);
    }
    
    // GET by ID
    const idMatch = url.match(/\/models\/(\d+)$/);
    if (idMatch && method === "get") {
      const id = parseInt(idMatch[1]);
      const model = filtered.find((m) => m.id === id);
      if (model) {
        return { success: true, data: model };
      } else {
        throw { status: 404, message: "Model not found" };
      }
    }
    
    // CREATE
    if (method === "post") {
      const newModel = {
        id: generateId(),
        ...requestData,
        created_at: new Date().toISOString(),
      };
      MOCK_MODELS.unshift(newModel);
      return { success: true, message: "Model created", data: newModel };
    }
    
    // UPDATE
    if (method === "put" || method === "patch") {
      const idMatch = url.match(/\/models\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_MODELS.findIndex((m) => m.id === id);
        if (index !== -1) {
          MOCK_MODELS[index] = { ...MOCK_MODELS[index], ...requestData };
          return { success: true, message: "Model updated", data: MOCK_MODELS[index] };
        }
      }
    }
    
    // DELETE
    if (method === "delete") {
      const idMatch = url.match(/\/models\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_MODELS.findIndex((m) => m.id === id);
        if (index !== -1) {
          MOCK_MODELS.splice(index, 1);
          return { success: true, message: "Model deleted" };
        }
      }
    }
    
    return paginateData(filtered, page, limit);
  }
  
  // ========== PARTS ENDPOINTS ==========
  if (url.includes("/parts")) {
    let filtered = [...MOCK_PARTS];
    
    if (search) {
      filtered = filterBySearch(filtered, search, ["code", "name", "description"]);
    }
    
    if (params.model_id) {
      filtered = filterByField(filtered, "model_id", parseInt(params.model_id));
    }
    
    const idMatch = url.match(/\/parts\/(\d+)$/);
    if (idMatch && method === "get") {
      const id = parseInt(idMatch[1]);
      const part = filtered.find((p) => p.id === id);
      return part ? { success: true, data: part } : { status: 404, message: "Part not found" };
    }
    
    if (method === "post") {
      const newPart = { id: generateId(), ...requestData, created_at: new Date().toISOString() };
      MOCK_PARTS.unshift(newPart);
      return { success: true, message: "Part created", data: newPart };
    }
    
    if (method === "put" || method === "patch") {
      const idMatch = url.match(/\/parts\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_PARTS.findIndex((p) => p.id === id);
        if (index !== -1) {
          MOCK_PARTS[index] = { ...MOCK_PARTS[index], ...requestData };
          return { success: true, message: "Part updated", data: MOCK_PARTS[index] };
        }
      }
    }
    
    if (method === "delete") {
      const idMatch = url.match(/\/parts\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_PARTS.findIndex((p) => p.id === id);
        if (index !== -1) {
          MOCK_PARTS.splice(index, 1);
          return { success: true, message: "Part deleted" };
        }
      }
    }
    
    return paginateData(filtered, page, limit);
  }
  
  // ========== USERS ENDPOINTS ==========
  if (url.includes("/users")) {
    let filtered = [...MOCK_USERS_LIST];
    
    if (search) {
      filtered = filterBySearch(filtered, search, ["username", "name", "email"]);
    }
    
    if (params.role) {
      filtered = filterByField(filtered, "role", params.role);
    }
    
    if (params.status) {
      filtered = filterByField(filtered, "status", params.status);
    }
    
    const idMatch = url.match(/\/users\/(\d+)$/);
    if (idMatch && method === "get") {
      const id = parseInt(idMatch[1]);
      const user = filtered.find((u) => u.id === id);
      return user ? { success: true, data: user } : { status: 404, message: "User not found" };
    }
    
    if (method === "post") {
      const newUser = { id: generateId(), ...requestData, created_at: new Date().toISOString() };
      MOCK_USERS_LIST.unshift(newUser);
      return { success: true, message: "User created", data: newUser };
    }
    
    if (method === "put" || method === "patch") {
      const idMatch = url.match(/\/users\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_USERS_LIST.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS_LIST[index] = { ...MOCK_USERS_LIST[index], ...requestData };
          return { success: true, message: "User updated", data: MOCK_USERS_LIST[index] };
        }
      }
    }
    
    if (method === "delete") {
      const idMatch = url.match(/\/users\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        const index = MOCK_USERS_LIST.findIndex((u) => u.id === id);
        if (index !== -1) {
          MOCK_USERS_LIST.splice(index, 1);
          return { success: true, message: "User deleted" };
        }
      }
    }
    
    return paginateData(filtered, page, limit);
  }
  
  // ========== OTHER MASTER DATA ==========
  const masterDataMap = {
    "/customers": MOCK_CUSTOMERS,
    "/materials": MOCK_MATERIALS,
    "/shifts": MOCK_SHIFTS,
    "/sections": MOCK_SECTIONS,
    "/reject-reasons": MOCK_REJECT_REASONS,
  };
  
  for (const [endpoint, mockData] of Object.entries(masterDataMap)) {
    if (url.includes(endpoint)) {
      let filtered = [...mockData];
      if (search) {
        filtered = filterBySearch(filtered, search, ["code", "name", "description"]);
      }
      return paginateData(filtered, page, limit);
    }
  }
  
  // Default 404
  throw { status: 404, message: "Endpoint not found in mock data" };
};

// ========== AXIOS INSTANCE ==========
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // If mock mode, intercept and return mock data
    if (USE_MOCK_DATA) {
      try {
        const mockResponse = await handleMockRequest(config);
        // Throw special object to be caught by response interceptor
        throw { _isMockResponse: true, data: mockResponse };
      } catch (error) {
        if (error._isMockResponse) {
          throw error;
        } else {
          throw { _isMockError: true, error };
        }
      }
    }
    
    // Real API - Add auth token
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle mock responses
    if (error._isMockResponse) {
      return Promise.resolve(error.data);
    }
    
    // Handle mock errors
    if (error._isMockError) {
      const mockError = error.error;
      
      // 401 - Redirect to login
      if (mockError.status === 401) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      return Promise.reject(mockError);
    }
    
    // Handle real API errors
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      if (status === 403) {
        console.error("Access forbidden:", data.message);
      }
      
      return Promise.reject({
        status,
        message: data?.message || data?.error || "An error occurred",
        errors: data?.errors,
      });
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
      });
    } else {
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

export default apiClient;
