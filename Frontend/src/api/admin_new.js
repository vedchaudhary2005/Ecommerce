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

// Add new product with image upload
export const addProduct = async (productData, token) => {
  try {
    console.log('➕ Adding new product:', productData.name);
    
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    
    const response = await fetch(API_ENDPOINTS.ADMIN.ADD_SWEET, {
      method: 'POST',
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
      console.error('❌ Failed to add product:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Product added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error adding product:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get all products (admin view)
export const getAdminProducts = async (token) => {
  try {
    console.log('🔑 Fetching admin products from:', API_ENDPOINTS.ADMIN.GET_SWEETS);
    
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
      console.error('❌ Failed to fetch admin products:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Admin products fetched successfully:', data.sweets?.length || 0, 'items');
    return data;
  } catch (error) {
    console.error('❌ Network error fetching admin products:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Update product
export const updateProduct = async (id, productData, token) => {
  try {
    console.log('✏️ Updating product:', id);
    
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
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
      console.error('❌ Failed to update product:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Product updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error updating product:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Delete product
export const deleteProduct = async (id, token) => {
  try {
    console.log('🗑️ Deleting product:', id);
    
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
      console.error('❌ Failed to delete product:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Product deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network error deleting product:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get public products (for frontend display)
export const getPublicProducts = async () => {
  try {
    console.log('📡 Fetching public products from:', API_ENDPOINTS.SWEETS.GET_ALL);
    
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
      console.error('❌ Failed to fetch products:', errorData);
      return errorData;
    }
    
    const data = await response.json();
    console.log('✅ Products fetched successfully:', data.sweets?.length || 0, 'items');
    return data;
  } catch (error) {
    console.error('❌ Network error fetching products:', error);
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

// Toggle product visibility (admin only)
export const toggleProductVisibility = async (productId, token) => {
  try {
    console.log('👁️ Toggling product visibility:', productId);
    
    const response = await fetch(`${API_ENDPOINTS.SWEETS.TOGGLE_VISIBILITY}/${productId}/visibility`, {
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