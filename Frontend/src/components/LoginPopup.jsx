import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const LoginPopup = ({ setShowLogin }) => {
  // State to toggle between signup and login forms
  const [isLogin, setIsLogin] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useCart(); // Using existing toast system
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: false
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Fix: Use unified login for both admin and user
        const response = await loginUser({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          login(response.data.user, response.data.token);
          showToast('Login successful!'); // Fix: Consistent success message
          setShowLogin(false);
          
          // Fix: Redirect admin to dashboard, not admin-panel
          if (response.data.user.role === 'admin') {
            window.location.href = '/admin-dashboard';
          }
        } else {
          setError(response.message);
          showToast('Invalid credentials'); // Fix: Consistent error message
        }
      } else {
        // Register new user
        const response = await registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        if (response.success) {
          showToast('Account created successfully'); // Fix: Consistent success message
          // Switch to login form after successful registration
          setIsLogin(true);
          setFormData({
            name: '',
            email: formData.email, // Keep email for convenience
            phone: '',
            password: '',
            agreeTerms: false
          });
        } else {
          setError(response.message);
          showToast(response.message); // Fix: Show actual error message
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      showToast('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Popup Container */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setShowLogin(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field - Only for Signup */}
          {!isLogin && (
            <div className="mb-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 placeholder-gray-800 placeholder:font-semibold"
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 placeholder-gray-800 placeholder:font-semibold"
              placeholder="Enter email"
              required
            />
          </div>
          
          {/* Phone Field - Required for Signup */}
          {!isLogin && (
            <div className="mb-5">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 placeholder-gray-800 placeholder:font-semibold"
                placeholder="Enter 10-digit phone number"
                required
                maxLength="10"
                pattern="[0-9]{10}"
              />
            </div>
          )}

          {/* Password Field with Eye Toggle */}
          <div className="mb-5 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 placeholder-gray-800 placeholder:font-semibold"
              placeholder="Enter password"
              required 
            />
            {/* Eye Icon Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Terms Checkbox - Only for Signup */}
          {!isLogin && (
            <div className="flex items-start space-x-2 mb-5">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-600 border-gray-300 rounded"
                required
              />
              <label className="text-sm text-gray-700">
                By continuing, I agree to the Terms and Conditions.
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white font-semibold py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Link */}
     <div className="text-center mt-4">
  {isLogin ? (
    <p className="text-sm font-medium">
      Don't have an account?{" "}
      <button
        onClick={() => setIsLogin(false)}
        className="text-pink-600 hover:text-pink-700 transition-colors"
      >
        Sign up here
      </button>
    </p>
  ) : (
    <p className="text-sm font-medium">
      Already have an account?{" "}
      <button
        onClick={() => setIsLogin(true)}
        className="text-pink-600 hover:text-pink-700 transition-colors"
      >
        Login here
      </button>
    </p>
  )}
</div>

      </div>
    </div>
  );
};

export default LoginPopup;
