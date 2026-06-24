import { API_ENDPOINTS, getHeaders } from './config';

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format (10 digits)
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Register new user with frontend validation
export const registerUser = async (userData) => {
  try {
    const { name, email, phone, password } = userData;

    if (!name || !email || !phone || !password) {
      return { success: false, message: 'All fields are required' };
    }

    if (!isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    if (!isValidPhone(phone)) {
      return { success: false, message: 'Phone must be 10 digits' };
    }

    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // NETWORK ERROR FIX: Required for CORS with credentials
      body: JSON.stringify({
        name,
        email: email.toLowerCase().trim(),
        phone,
        password,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Login user - unified endpoint for both user and admin
export const loginUser = async (credentials) => {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // NETWORK ERROR FIX: Handle response properly
      body: JSON.stringify({ email, password }), // FIX: Added missing body to send credentials
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        return errorData;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        return { success: false, message: `Server error (${response.status})` };
      }
    }

    try {
      const data = await response.json();
      console.log('Backend success response:', data);
      return data;
    } catch (parseError) {
      console.error('Failed to parse success response:', parseError);
      return { success: false, message: 'Invalid response from server' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get user profile - validate token and fetch user data
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(API_ENDPOINTS.USERS.PROFILE, {
      method: 'GET',
      headers: getHeaders(token),
      credentials: 'include',
    });

    // FIX: Check response status before parsing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        success: false, 
        message: `Server error (${response.status})` 
      }));
      console.error('Get profile error:', errorData);
      return errorData;
    }

    const data = await response.json();
    console.log('Profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Network error fetching profile:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Logout user - call backend to clear server-side session
export const logoutUser = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // NETWORK ERROR FIX: Required for CORS with credentials
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};
