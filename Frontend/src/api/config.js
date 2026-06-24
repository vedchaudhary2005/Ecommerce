// API configuration for SweetHub backend
// Uses Vite environment variables - switches automatically between dev and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Export backend URL for image handling
export { BACKEND_URL };

// API endpoints
export const API_ENDPOINTS = {
  USERS: {
    REGISTER: `${API_BASE_URL}/users/register`,
    LOGIN: `${API_BASE_URL}/users/login`,
    PROFILE: `${API_BASE_URL}/users/profile`
  },
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`
  },
  ADMIN: {
    LOGIN: `${API_BASE_URL}/admin/login`,
    ADD_SWEET: `${API_BASE_URL}/admin/add-sweet`,
    GET_SWEETS: `${API_BASE_URL}/admin/get-sweets`,
    UPDATE_SWEET: `${API_BASE_URL}/admin/update-sweet`,
    DELETE_SWEET: `${API_BASE_URL}/admin/delete-sweet`,
    USERS: `${API_BASE_URL}/admin/users`
  },
  SWEETS: {
    GET_ALL: `${API_BASE_URL}/sweets`,
    GET_ONE: `${API_BASE_URL}/sweets`,
    TOGGLE_VISIBILITY: `${API_BASE_URL}/sweets`
  },
  ORDERS: {
    GET_ALL: `${API_BASE_URL}/orders`,
    PLACE_ORDER: `${API_BASE_URL}/orders/place`,
    UPDATE_STATUS: `${API_BASE_URL}/orders/update-status`,
    GET_BY_ID: `${API_BASE_URL}/orders`,
    GET_USER_ORDERS: `${API_BASE_URL}/orders/user`
  },
  SLIDER: {
    GET_ALL: `${API_BASE_URL}/slider`,
    UPLOAD: `${API_BASE_URL}/slider`,
    DELETE: `${API_BASE_URL}/slider`
  }
};

// Default headers for API requests
export const getHeaders = (token = null, isFormData = false) => {
  const headers = {};
  
  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};