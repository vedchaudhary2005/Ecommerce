import { createContext, useState, useEffect } from 'react';
import { getUserProfile, logoutUser } from '../api/auth';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage and validate token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for user token first
        const savedToken = localStorage.getItem('sweetHubToken');
        const savedUser = localStorage.getItem('sweetHubUser');
        
        // Check for admin token
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        
        if (adminToken && adminUser) {
          // Admin session - restore without validation for now
          try {
            const parsedAdminUser = JSON.parse(adminUser);
            setToken(adminToken);
            setUser(parsedAdminUser);
          } catch (e) {
            // Clear invalid admin data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } else if (savedToken && savedUser) {
          // Regular user session - restore from localStorage first, then validate in background
          try {
            const parsedUser = JSON.parse(savedUser);
            setToken(savedToken);
            setUser(parsedUser);
            
            // Validate token in background (don't logout on network errors)
            try {
              const response = await getUserProfile(savedToken);
              if (response.success) {
                // Update user data if validation succeeds
                const userData = response.user || response.data?.user;
                setUser(userData);
                localStorage.setItem('sweetHubUser', JSON.stringify(userData));
              } else if (response.message && response.message.includes('Invalid') || response.message && response.message.includes('expired')) {
                // Only logout on explicit auth errors, not network errors
                localStorage.removeItem('sweetHubToken');
                localStorage.removeItem('sweetHubUser');
                setToken(null);
                setUser(null);
              }
              // Ignore network errors to prevent logout on refresh
            } catch (validationError) {
              console.log('Token validation failed, but keeping user logged in:', validationError);
              // Keep user logged in even if validation fails due to network issues
            }
          } catch (parseError) {
            // Clear invalid user data
            localStorage.removeItem('sweetHubToken');
            localStorage.removeItem('sweetHubUser');
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        // Clear invalid data
        localStorage.removeItem('sweetHubToken');
        localStorage.removeItem('sweetHubUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - handles both user and admin
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    
    if (userData.role === 'admin') {
      // Store admin credentials separately
      localStorage.setItem('adminToken', userToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      // Clear any existing user tokens
      localStorage.removeItem('sweetHubToken');
      localStorage.removeItem('sweetHubUser');
    } else {
      // Store user credentials
      localStorage.setItem('sweetHubToken', userToken);
      localStorage.setItem('sweetHubUser', JSON.stringify(userData));
      // Clear any existing admin tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  };

  // Logout function - completely clear all auth data
  const logout = async () => {
    try {
      // Call backend logout to clear server-side session
      await logoutUser();
    } catch (error) {
      console.error('Backend logout failed:', error);
    }
    
    // Clear all state immediately
    setUser(null);
    setToken(null);
    
    // Clear ALL possible tokens and user data from localStorage
    localStorage.removeItem('sweetHubToken');
    localStorage.removeItem('sweetHubUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    // Clear any cookies if they exist
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get user initials (first letter of name or email)
  const getUserInitials = () => {
    if (!user) return '';
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '';
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAdmin,
      isAuthenticated,
      getUserInitials
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthContext for custom hook usage
export { AuthContext };