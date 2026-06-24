import { useState, useEffect, useRef } from 'react';
import { Home, Search, User, ShoppingCart, HelpCircle, BadgePercent, LogOut, Settings, Package, Grid } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { getCartCount, showToast } = useCart();
  const { user, logout, isAuthenticated, getUserInitials } = useAuth();
  // Removed location panel state - no longer needed
  // State to control user dropdown
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // Refs for dropdowns to handle click outside
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  // Get dynamic cart count
  const cartCount = getCartCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) &&
          (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target))) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Removed location panel toggle - no longer needed

  // Handle keyboard navigation
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Handle signin button click - redirect to unified login page
  const handleSigninClick = () => {  
    navigate('/login');
  };
  
  // Handle logout - complete session cleanup
  const handleLogout = async () => {
    const currentRole = user?.role;
    
    // Close dropdown immediately
    setIsUserDropdownOpen(false);
    
    try {
      // Perform logout (now async)
      await logout();
      
      // Show appropriate toast message
      showToast('Logged out successfully!');
      // Redirect to home page for all users
      navigate('/');
      
      // Force page reload to ensure complete state reset
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed. Please try again.');
    }
  };
  
  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Navigate to collections page
  const handleCollectionsClick = () => {
    navigate('/collections');
  };

  return (
    <>
      {/* Main Navbar - Full Width and Fixed */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo Placeholder */}
              <div className="flex-shrink-0 px-2 sm:px-0">
                <div className="text-2xl font-bold text-pink-600">Meher Collection</div>
              </div>
              
              {/* Removed desktop location hamburger - no longer needed */}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation Items */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Home */}
                <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 rounded-md px-2 py-1" aria-label="Go to home page">
                  <Home className="w-5 h-5" />
                  <span className="font-semibold text-base">Home</span>
                </Link>
                
                {/* Collections - Navigate to collections page */}
                <button 
                  onClick={() => navigate('/collections')}
                  className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 rounded-md px-2 py-1"
                  aria-label="Browse collections"
                >
                  <Grid className="w-5 h-5" />
                  <span className="font-semibold text-base">Collections</span>
                </button>

                {/* Admin Panel - Only show for admin */}
                {user?.role === 'admin' && (
                  <Link to="/admin-dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 rounded-md px-2 py-1" aria-label="Admin Panel">
                    <BadgePercent className="w-5 h-5" />
                    <span className="font-semibold text-base">Admin Panel</span>
                  </Link>  
                )}
                
                {/* Help */}
                <Link to="/help" className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 rounded-md px-2 py-1" aria-label="Get help">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-semibold text-base">Help</span>
                </Link>
          
              {/* Cart - Only show for regular users, not admin */}
              {user?.role !== 'admin' && (
                <Link to="/cart" className="relative flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 rounded-md px-2 py-1" aria-label={`Cart with ${cartCount} items`}>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline font-semibold text-base">Cart</span>
                  {/* Cart Badge - Show count only if items exist */}
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Orders - Only show for regular users, not admin */}
              {isAuthenticated() && user?.role !== 'admin' && (
                <Link to="/orders" className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 rounded-md px-2 py-1" aria-label="My Orders">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold text-base">Orders</span>
                </Link>
              )}
              
                {/* Auth Section */}
                {isAuthenticated() ? (
                  <div className="relative" ref={desktopDropdownRef}>
                    {/* User Initials Badge */}
                    <button 
                      onClick={toggleUserDropdown}
                      className="w-10 h-10 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2"
                      aria-label="User menu"
                    >
                      {getUserInitials()}
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-pink-100 text-pink-600 rounded-full font-medium">ADMIN</span>
                          )}
                        </div>
                        <Link 
                          to="/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <Package className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link 
                            to="/admin-dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 transition-colors flex items-center space-x-2"
                          >
                            <BadgePercent className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleSigninClick}
                    className="flex items-center space-x-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 font-semibold text-sm"
                    aria-label="Sign in to your account"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>

              {/* Mobile Auth */}
              {isAuthenticated() ? (
                <div className="md:hidden relative" ref={mobileDropdownRef}>
                  {/* Mobile User Initials Badge */}
                  <button 
                    onClick={toggleUserDropdown}
                    className="w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    aria-label="User menu"
                  >
                    {getUserInitials()}
                  </button>
                  
                  {/* Mobile Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                        <p className="font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleSigninClick}
                  className="md:hidden flex items-center space-x-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 font-semibold text-sm"
                  aria-label="Sign in to your account"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
              
              {/* Removed mobile location hamburger - no longer needed */}
            </div>
          </div>
        </div>


      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>

      {/* Mobile Bottom Navigation Bar - Only visible on mobile screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 rounded-t-2xl shadow-lg">
        <div className="flex justify-around items-center py-2 px-4">
          
          {/* Home Navigation - Always visible */}
          <Link 
            to="/"
            className="flex flex-col items-center py-2 px-2 text-gray-600 hover:text-pink-500 transition-colors"
            aria-label="Go to home page"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          {/* Collections Navigation - Always visible */}
          <button 
            onClick={() => navigate('/collections')}
            className="flex flex-col items-center py-2 px-2 text-gray-600 hover:text-pink-500 transition-colors"
            aria-label="Browse collections"
          >
            <Grid className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Collections</span>
          </button>
          
          {/* Admin Panel Navigation - Only visible for admin users */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin-dashboard"
              className="flex flex-col items-center py-2 px-2 text-gray-600 hover:text-pink-500 transition-colors"
              aria-label="Admin Panel"
            >
              <Settings className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Admin Panel</span>
            </Link>
          )}
          
          {/* Orders Navigation - Only visible for regular users */}
          {isAuthenticated() && user?.role !== 'admin' && (
            <Link 
              to="/orders"
              className="flex flex-col items-center py-2 px-2 text-gray-600 hover:text-pink-500 transition-colors"
              aria-label="My Orders"
            >
              <Package className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Orders</span>
            </Link>
          )}
          
          {/* Cart Navigation - Only visible for regular users */}
          {user?.role !== 'admin' && (
            <Link 
              to="/cart"
              className="relative flex flex-col items-center py-2 px-2 text-gray-600 hover:text-pink-500 transition-colors"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Cart</span>
              {/* Cart Badge - Show count only if items exist */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
          
          {/* Help Navigation - Only visible for regular users */}
          {user?.role !== 'admin' && (
            <Link 
              to="/help"
              className="flex flex-col items-center py-2 px-2 text-gray-600 hover:text-pink-500 transition-colors"
              aria-label="Get help"
            >
              <HelpCircle className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Help</span>
            </Link>
          )}
          
        </div>
      </div>

  

      {/* Removed location side panel - no longer needed */} 
    </>
  );
};

export default Navbar;
