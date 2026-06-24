import { API_ENDPOINTS, getHeaders } from './config';

// Admin login
export const adminLogin = async (credentials) => {
  try {
    console.log('🔑 Admin login attempt for:', credentials.email);
    
    const response = await fetch(API_ENDPOINTS.ADMIN.LOGIN, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // NETWORK ERROR FIX: Required for CORS with credentials
      body: JSON.stringify(credentials)
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Admin login failed:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Admin login successful:', data.data?.user?.email);
    return data;
  } catch (error) {
    console.error('❌ Network error during admin login:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Add new sweet with image upload
export const addSweet = async (sweetData, token) => {
  try {
    console.log('➕ Adding new sweet:', sweetData.name);
    console.log('📦 Sweet data:', sweetData);
    
    const formData = new FormData();
    
    // Append all fields to FormData, handling the images specially
    Object.keys(sweetData).forEach(key => {
      if (key === 'images' && Array.isArray(sweetData[key])) {
        sweetData[key].forEach(file => {
          if (file instanceof File) {
            formData.append('images', file);
            console.log('📷 Image file appended:', file.name);
          }
        });
      } else if (key !== 'images' && key !== 'image') {
        formData.append(key, sweetData[key]);
      }
    });
    
    // Log FormData contents for debugging
    console.log('📋 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }
    
    const response = await fetch(API_ENDPOINTS.ADMIN.ADD_SWEET, {
      method: 'POST',
      headers: getHeaders(token, true), // isFormData = true
      credentials: 'include',
      body: formData
    });
    
    // Enhanced error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server response:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { success: false, message: `Server error (${response.status})` };
      }
      
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Sweet added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error adding sweet:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get all sweets (admin view)
export const getAdminSweets = async (token) => {
  try {
    console.log('🔑 Fetching admin sweets from:', API_ENDPOINTS.ADMIN.GET_SWEETS);
    
    const response = await fetch(API_ENDPOINTS.ADMIN.GET_SWEETS, {
      method: 'GET',
      headers: getHeaders(token),
      credentials: 'include' // NETWORK ERROR FIX: Required for CORS with credentials
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to fetch admin sweets:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Admin sweets fetched successfully:', data.sweets?.length || 0, 'items');
    return data;
  } catch (error) {
    console.error('❌ Network error fetching admin sweets:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Update sweet
export const updateSweet = async (id, sweetData, token) => {
  try {
    console.log('✏️ Updating sweet:', id);
    
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(sweetData).forEach(key => {
      if (key === 'images' && Array.isArray(sweetData[key])) {
        sweetData[key].forEach(file => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (key !== 'images' && key !== 'image' && sweetData[key] !== null && sweetData[key] !== undefined) {
        formData.append(key, sweetData[key]);
      }
    });
    
    const response = await fetch(`${API_ENDPOINTS.ADMIN.UPDATE_SWEET}/${id}`, {
      method: 'PUT',
      headers: getHeaders(token, true), // isFormData = true
      credentials: 'include', // NETWORK ERROR FIX: Required for CORS with credentials
      body: formData
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to update sweet:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Sweet updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error updating sweet:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Delete sweet
export const deleteSweet = async (id, token) => {
  try {
    console.log('🗑️ Deleting sweet:', id);
    
    const response = await fetch(`${API_ENDPOINTS.ADMIN.DELETE_SWEET}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
      credentials: 'include' // NETWORK ERROR FIX: Required for CORS with credentials
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to delete sweet:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Sweet deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error deleting sweet:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get public sweets (for frontend display)
export const getPublicSweets = async () => {
  try {
    console.log('📡 Fetching public sweets from:', API_ENDPOINTS.SWEETS.GET_ALL);
    
    const response = await fetch(API_ENDPOINTS.SWEETS.GET_ALL, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include' // NETWORK ERROR FIX: Required for CORS with credentials
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to fetch sweets:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Sweets fetched successfully:', data.sweets?.length || 0, 'items');
    return data;
  } catch (error) {
    console.error('❌ Network error fetching sweets:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get all users (admin only)
export const getAllUsers = async (token) => {
  try {
    console.log('👥 Fetching all users from:', API_ENDPOINTS.ADMIN.USERS);
    
    const response = await fetch(API_ENDPOINTS.ADMIN.USERS, {
      method: 'GET',
      headers: getHeaders(token),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to fetch users:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Users fetched successfully:', data.data?.users?.length || 0, 'users');
    return data;
  } catch (error) {
    console.error('❌ Network error fetching users:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get all orders (admin only)
export const getAllOrders = async (token) => {
  try {
    console.log('📦 Fetching all orders from:', API_ENDPOINTS.ORDERS.GET_ALL);
    
    const response = await fetch(API_ENDPOINTS.ORDERS.GET_ALL, {
      method: 'GET',
      headers: getHeaders(token),
      credentials: 'include' // NETWORK ERROR FIX: Required for CORS with credentials
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to fetch orders:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Orders fetched successfully:', data.data?.orders?.length || 0, 'orders');
    return data;
  } catch (error) {
    console.error('❌ Network error fetching orders:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status, token) => {
  try {
    console.log('🔄 Updating order status:', orderId, 'to', status);
    
    // Use the correct API endpoint for order status updates
    const response = await fetch(`${API_ENDPOINTS.ORDERS.UPDATE_STATUS}/${orderId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      credentials: 'include', // NETWORK ERROR FIX: Required for CORS with credentials
      body: JSON.stringify({ status })
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to update order status:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Order status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error updating order status:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Toggle sweet visibility (admin only)
export const toggleSweetVisibility = async (sweetId, token) => {
  try {
    console.log('👁️ Toggling sweet visibility:', sweetId);
    
    const response = await fetch(`${API_ENDPOINTS.SWEETS.TOGGLE_VISIBILITY}/${sweetId}/visibility`, {
      method: 'PATCH',
      headers: getHeaders(token),
      credentials: 'include' // NETWORK ERROR FIX: Required for CORS with credentials
    });
    
    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('❌ Failed to toggle visibility:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Visibility toggled successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error toggling visibility:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};
