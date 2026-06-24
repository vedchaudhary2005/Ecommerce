// ProceedToOrder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../api/config';

const ProceedToOrder = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, showToast } = useCart();
  const { user, token } = useAuth();

  // Helper: safe price parser (removes non-digits, returns 0 on failure)
  const parsePrice = (priceStr) => {
    if (!priceStr && priceStr !== 0) return 0;
    const digits = String(priceStr).replace(/[^\d]/g, '');
    const num = parseInt(digits, 10);
    return Number.isNaN(num) ? 0 : num;
  };

  // Load saved form data from individual localStorage keys
  const loadSavedFormData = () => {
    try {
      return {
        name: localStorage.getItem('userName') || user?.name || '',
        phone: localStorage.getItem('userPhone') || '',
        altPhone: localStorage.getItem('userAltPhone') || '',
        address: localStorage.getItem('userAddress') || '',
        city: localStorage.getItem('userCity') || '',
        pincode: localStorage.getItem('userPincode') || '',
        landmark: localStorage.getItem('userLandmark') || '',
        paymentMode: localStorage.getItem('userPaymentMode') || 'COD'
      };
    } catch (error) {
      console.error('Error loading saved form data:', error);
      return {
        name: user?.name || '',
        phone: '',
        altPhone: '',
        address: '',
        city: '',
        pincode: '',
        landmark: '',
        paymentMode: 'COD'
      };
    }
  };

  const [formData, setFormData] = useState(loadSavedFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total amount
  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      // parse price safely and multiply by quantity
      const unitPrice = parsePrice(item.price);
      const qty = Number(item.quantity) || 0;
      return total + unitPrice * qty;
    }, 0);
  };

  // AUTO-FILL: Load saved data from localStorage on component mount
  useEffect(() => {
    // Retrieve saved form data from localStorage and auto-fill form fields
    const savedData = loadSavedFormData();
    setFormData(savedData);
    console.log('Auto-filled form with saved data from localStorage');
  }, [user]); // Re-load when user changes

  // AUTO-SAVE: Save form data to localStorage whenever any field changes
  useEffect(() => {
    try {
      // Store each field individually in localStorage for easy retrieval
      localStorage.setItem('userName', formData.name || '');
      localStorage.setItem('userPhone', formData.phone || '');
      localStorage.setItem('userAltPhone', formData.altPhone || '');
      localStorage.setItem('userAddress', formData.address || '');
      localStorage.setItem('userCity', formData.city || '');
      localStorage.setItem('userPincode', formData.pincode || '');
      localStorage.setItem('userLandmark', formData.landmark || '');
      localStorage.setItem('userPaymentMode', formData.paymentMode || 'COD');
      
      console.log('Auto-saved form data to localStorage');
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, [formData]); // Runs whenever formData changes

  // Handle form input changes - automatically updates localStorage via useEffect
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update React state (this will trigger the useEffect above to save to localStorage)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Order placement handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.altPhone || !formData.address || !formData.city || !formData.pincode || !formData.landmark) {
        showToast('Please fill all required fields');
        setIsLoading(false);
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          sweetId: item.id,
          name: item.name,
          image: item.image,
          qty: Number(item.quantity) || 0,
          price: parsePrice(item.price) * (Number(item.quantity) || 0)
        })),
        totalAmount: getTotalAmount(),
        address: {
          name: formData.name,
          phone: formData.phone,
          altPhone: formData.altPhone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          landmark: formData.landmark
        },
        paymentMode: formData.paymentMode
      };

      // Do not include credentials: 'include' unless you actually use cookie auth + CORS on server
      const response = await fetch(API_ENDPOINTS.ORDERS.PLACE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Only add Authorization if token exists
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });

      // Defensive: if server returned non-2xx, read text for debug and show toast
      if (!response.ok) {
        const text = await response.text().catch(() => null);
        console.error('Order API returned non-OK:', response.status, text);
        showToast('Server error while placing order. Please try again.');
        setIsLoading(false);
        return;
      }

      // Defensive JSON parsing: only parse JSON if content-type includes application/json
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (err) {
          console.error('Failed to parse JSON response:', err);
          showToast('Unexpected server response. Please try again.');
          setIsLoading(false);
          return;
        }
      } else {
        // If server returned plain text but with 200 OK, log it and show fallback success
        const text = await response.text().catch(() => '');
        console.warn('Non-JSON successful response from order API:', text);
        showToast('Order placed (server response not JSON).');
        
        // CART CLEARING: Clear cart even for non-JSON successful responses
        // Since server returned 200 OK, we assume order was placed successfully
        clearCart();
        console.log('Cart cleared after successful order placement (non-JSON response)');
        
        // small delay so user sees toast
        setTimeout(() => navigate('/orders'), 500);
        setIsLoading(false);
        return;
      }

      console.log('Order placement response:', { status: response.status, data });

      if (data && data.success) {
        // Keep saved form data in localStorage for future orders (don't clear)
        // User details will be auto-filled on next visit
        console.log('Order successful - keeping user details saved for future orders');

        // CART CLEARING: Clear cart after successful order placement
        // This removes all items from cart state and localStorage
        // Cart count in navbar will update immediately to 0
        clearCart();
        console.log('Cart cleared after successful order placement');

        showToast('Order placed successfully!');

        // Auto-redirect to orders page after brief delay to allow toast to show and state to update
        setTimeout(() => {
          navigate('/orders');
        }, 500);
      } else {
        // Backend sent success: false OR no data
        showToast((data && data.message) ? data.message : 'Failed to place order. Please try again.');
      }

    } catch (error) {
      // Catch network / unexpected errors
      console.error('Order placement error (frontend):', error);
      showToast('Network error — please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No items in cart</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Delivery Information</h2>
              {/* Auto-save message when form has saved data */}
              {(formData.name || formData.phone || formData.address) && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Your details are automatically saved and will be pre-filled next time
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone *
                </label>
                <input
                  type="tel"
                  name="altPhone"
                  value={formData.altPhone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{6}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark *
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMode"
                    value="COD"
                    checked={formData.paymentMode === 'COD'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="cod" className="text-sm text-gray-700">
                    To Complete Payment Call on (93104 13217)
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
              >
                {isLoading ? 'Placing Order...' : `Place Order - ₹${getTotalAmount()}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-pink-700 font-medium">
                      ₹{parsePrice(item.price) * (Number(item.quantity) || 0)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-pink-700">₹{getTotalAmount()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default ProceedToOrder;
