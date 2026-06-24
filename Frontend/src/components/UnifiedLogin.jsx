import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useCart();
  
  // State management
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: false
  });

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
        // Login flow - unified for both user and admin
        const response = await loginUser({
          email: formData.email,
          password: formData.password
        });
        
        // NETWORK ERROR FIX: Add debugging to see response
        console.log('Frontend login response:', response);
        
        if (response && response.success) {
          login(response.user, response.token);
          showToast('Login successful!');
          
          // Redirect based on role
          if (response.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/');
          }
        } else {
          setError(response?.message || 'Login failed');
          showToast(response?.message || 'Login failed');
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
          showToast('Account created successfully');
          // Switch to login form
          setIsLogin(true);
          setFormData({
            name: '',
            email: formData.email,
            phone: '',
            password: '',
            agreeTerms: false
          });
        } else {
          setError(response.message);
          showToast(response.message);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
      showToast('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Sign in to Meher Collection' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join Meher Collection to order amazing products'}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name field - only for signup */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-600 focus:border-pink-600"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-600 focus:border-pink-600"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone field - only for signup */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required={!isLogin}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-600 focus:border-pink-600"
                  placeholder="Enter 10-digit phone number"
                />
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-600 focus:border-pink-600"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms checkbox - only for signup */}
            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  required
                  className="h-4 w-4 text-pink-600 focus:ring-pink-600 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to the Terms and Conditions
                </label>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 disabled:bg-pink-300"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          {/* Toggle between login and signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  agreeTerms: false
                });
              }}
              className="text-pink-600 hover:text-pink-600 text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Admin login hint */}
          {isLogin && (
            <div className="text-center">
              {/* <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Admin: admin@sweethub.com / Admin@123</span>
              </div> */}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UnifiedLogin;
