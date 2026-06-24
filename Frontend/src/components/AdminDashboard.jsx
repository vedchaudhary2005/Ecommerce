import { useState, useEffect } from 'react';
import { Users, Shield, Plus, Edit, Trash2, Eye, X, Upload, Package, CheckCircle, EyeOff } from 'lucide-react';
// import { getAllUsers } from '../api/auth';
import { getAdminSweets, addSweet, updateSweet, deleteSweet, getAllUsers, getAllOrders, updateOrderStatus, toggleSweetVisibility } from '../api/admin';
import { BACKEND_URL, API_ENDPOINTS } from '../api/config'; // Fix: Import backend URL and endpoints
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useSweetsContext } from '../hooks/useSweetsContext';
import { FASHION_CATEGORIES } from '../constants/categories';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const { showToast } = useCart();
  const { refetchSweets } = useSweetsContext();
  
  // State management
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'users', 'orders', or 'slider'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sliderImages, setSliderImages] = useState([]); // Slider images state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View product modal state
  const [viewingProduct, setViewingProduct] = useState(null);
  
  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    rating: '4.0',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [token]);

  // Real-time polling for order updates - only when on orders tab
  useEffect(() => {
    let pollingInterval;
    
    // Only start polling when viewing orders tab and user is authenticated
    if ((activeTab === 'orders' || activeTab === 'finishOrders') && token) {
      console.log('Starting real-time order polling...');
      
      // Poll for new orders every 8 seconds
      pollingInterval = setInterval(async () => {
        try {
          // Fetch only orders data to avoid unnecessary API calls
          const ordersResponse = await getAllOrders(token);
          
          if (ordersResponse.success) {
            const newOrders = ordersResponse.data?.orders || [];
            
            // Check if there are new orders by comparing lengths
            if (newOrders.length !== orders.length) {
              console.log(`New orders detected: ${newOrders.length - orders.length} new orders`);
              setOrders(newOrders);
              
              // Show notification for new orders (only if more orders than before)
              if (newOrders.length > orders.length) {
                showToast(`${newOrders.length - orders.length} new order(s) received!`);
              }
            } else {
              // Update orders silently in case of status changes
              setOrders(newOrders);
            }
          }
        } catch (error) {
          // Silently handle polling errors to avoid disrupting user experience
          console.log('Order polling error (silent):', error);
        }
      }, 8000); // Poll every 8 seconds
    }
    
    // Cleanup polling when component unmounts or tab changes
    return () => {
      if (pollingInterval) {
        console.log('Stopping real-time order polling...');
        clearInterval(pollingInterval);
      }
    };
  }, [activeTab, token, orders.length]); // Re-run when tab changes or orders count changes

  // Fetch slider images from API
  const fetchSliderImages = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SLIDER.GET_ALL);
      const data = await response.json();
      
      if (data.success) {
        setSliderImages(data.data?.images || []);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
    }
  };

  // Fetch all data - enhanced with better error handling for real-time updates
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
        getAllUsers(token),
        getAdminSweets(token),
        getAllOrders(token)
      ]);
      
      if (usersResponse.success) {
        setUsers(usersResponse.data?.users || []);
      }
      
      if (productsResponse.success) {
        setProducts(productsResponse.data?.products || productsResponse.data?.sweets || []);
      }
      
      if (ordersResponse.success) {
        const newOrders = ordersResponse.data?.orders || [];
        setOrders(newOrders);
        console.log(`Loaded ${newOrders.length} orders from server`);
      }
      
      // Fetch slider images
      await fetchSliderImages();
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product form input changes
  const handleProductFormChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'images' && files) {
      const selectedFiles = Array.from(files);
      if (selectedFiles.length > 5) {
        showToast('Maximum 5 images allowed');
        return;
      }
      setProductForm(prev => ({ ...prev, images: selectedFiles }));
      
      // Create image previews
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      category: '',
      description: '',
      rating: '4.0',
      images: []
    });
    setImagePreviews([]);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  // Handle product form submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      // Validate form
      if (!productForm.name || !productForm.price || !productForm.category || !productForm.description) {
        showToast('Please fill in all required fields');
        return;
      }
      
      if (!editingProduct && (!productForm.images || productForm.images.length === 0)) {
        showToast('Please select at least one image');
        return;
      }
      
      let response;
      if (editingProduct) {
        // Update existing product
        response = await updateSweet(editingProduct._id, productForm, token);
      } else {
        // Add new product
        response = await addSweet(productForm, token);
      }
      
      if (response.success) {
        showToast(editingProduct ? 'Product updated successfully' : 'Product added successfully');
        resetProductForm();
        // Force immediate refresh of both admin and public data
        await fetchData(); // Refresh admin data
        refetchSweets(); // Refresh public products data immediately
        // Additional refresh after short delay to ensure data propagation
        setTimeout(() => refetchSweets(), 500);
      } else {
        showToast(response.message || 'Operation failed');
      }
    } catch (error) {
      showToast('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      rating: product.rating.toString(),
      images: [] // Don't pre-fill images
    });
    setImagePreviews([]);
    setShowProductForm(true);
  };

  // Handle delete product with confirmation and enhanced error logging
  const handleDeleteProduct = async (productId, productName) => {
    console.log('🗑️ DELETE REQUEST:', { productId, productName, token: !!token });
    
    if (window.confirm(`Are you sure to delete this product "${productName}"?`)) {
      try {
        console.log('🔄 Calling deleteSweet API...');
        const response = await deleteSweet(productId, token);
        
        console.log('📦 Delete API Response:', response);
        
        if (response.success) {
          showToast('Product deleted successfully');
          console.log('✅ Product deleted, updating UI...');
          
          // Immediately remove from local state for instant UI update
          setProducts(prev => prev.filter(p => p._id !== productId));
          
          // Refresh public products data so Home/Collections pages update
          refetchSweets();
          
          console.log('🔄 UI updated after deletion');
        } else {
          console.error('❌ Delete failed:', response.message);
          showToast(response.message || 'Delete failed');
        }
      } catch (error) {
        console.error('💥 Network error during delete:', error);
        showToast('Network error. Please try again.');
      }
    }
  };
  
  // Admin order update handler - Fixed to use proper API function and handle errors
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Log the update attempt for debugging
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Use the proper API function from admin.js
      const response = await updateOrderStatus(orderId, newStatus, token);
      
      if (response.success) {
        showToast('Order status updated successfully');
        // Refresh data to show updated status immediately
        await fetchData();
      } else {
        // Show specific error message from backend
        showToast(response.message || 'Failed to update order status');
        console.error('Order update failed:', response);
      }
    } catch (error) {
      // Handle network errors and other exceptions
      console.error('Order status update error:', error);
      showToast('Network error. Please check your connection and try again.');
    }
  };
  
  // Handle toggle product visibility
  const handleToggleVisibility = async (productId, currentVisibility) => {
    try {
      const response = await toggleSweetVisibility(productId, token);
      if (response.success) {
        showToast(response.message);
        fetchData(); // Refresh admin data
        refetchSweets(); // Refresh public products data
      } else {
        showToast(response.message || 'Toggle failed');
      }
    } catch (error) {
      showToast('Network error. Please try again.');
    }
  };

  // Handle slider image upload
  const handleSliderImageUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(API_ENDPOINTS.SLIDER.UPLOAD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('Slider image uploaded successfully');
        await fetchSliderImages(); // Refresh slider images
        e.target.reset(); // Clear form
      } else {
        showToast(data.message || 'Upload failed');
      }
    } catch (error) {
      showToast('Network error. Please try again.');
    }
  };

  // Handle slider image delete
  const handleDeleteSliderImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this slider image?')) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SLIDER.DELETE}/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToast('Slider image deleted successfully');
          await fetchSliderImages(); // Refresh slider images
        } else {
          showToast(data.message || 'Delete failed');
        }
      } catch (error) {
        showToast('Network error. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24"> {/* Added extra bottom padding for mobile nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-pink-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>
            
            {/* Add Product Button */}
            {activeTab === 'products' && (
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
              <nav className="-mb-px flex space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'products'
                    ? 'border-pink-600 text-pink-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products Management
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'orders'
                    ? 'border-pink-600 text-pink-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'users'
                    ? 'border-pink-600 text-pink-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users Management
              </button>
              <button
                onClick={() => setActiveTab('finishOrders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'finishOrders'
                    ? 'border-pink-600 text-pink-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Finish Orders
              </button>
              <button
                onClick={() => setActiveTab('slider')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'slider'
                    ? 'border-pink-600 text-pink-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Slider
              </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-pink-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => ['Pending', 'Processing', 'Out for Delivery'].includes(o.status)).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'products' ? (
          /* Products Management */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Products Management</h2>
            </div>
            
            {error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No products found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img 
                            src={`${BACKEND_URL}${product.image}`} 
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.rating}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isVisible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setViewingProduct(product)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(product._id, product.isVisible)}
                              className={`p-1 rounded ${
                                product.isVisible 
                                  ? 'text-gray-600 hover:text-gray-900' 
                                  : 'text-blue-600 hover:text-blue-900'
                              }`}
                              title={product.isVisible ? 'Hide' : 'Show'}
                            >
                              {product.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id, product.name)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'orders' ? (
          /* Active Orders Management - Only Pending and Processing */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Active Orders Management</h2>
              <p className="text-sm text-gray-600 mt-1">Pending and processing orders</p>
            </div>
            
            {error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : orders.filter(order => ['Pending', 'Processing', 'Out for Delivery'].includes(order.status)).length === 0 ? (
              <div className="p-6 text-center text-gray-500">No active orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.filter(order => ['Pending', 'Processing', 'Out for Delivery'].includes(order.status)).map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.address?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.address?.city || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.address?.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-gray-900 truncate">
                            {order.address?.address || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.address?.pincode || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="mb-1">
                                {item.name} × {item.qty}
                              </div>
                            )) || 'No items'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.paymentMode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-600"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          /* Users Management */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Registered Users</h2>
            </div>
            
            {error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'slider' ? (
          /* Slider Images Management */
          <div className="space-y-6">
            {/* Upload Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Slider Image</h2>
              <form onSubmit={handleSliderImageUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image File *
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    name="caption"
                    placeholder="Enter image caption"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Upload Image
                </button>
              </form>
            </div>

            {/* Slider Images List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Current Slider Images</h2>
                <p className="text-sm text-gray-600 mt-1">{sliderImages.length} images uploaded</p>
              </div>
              
              {sliderImages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No slider images found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {sliderImages.map((image) => (
                    <div key={image._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000${image.imageUrl}`}
                        alt={image.caption || 'Slider image'}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {image.caption || 'No caption'}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          Uploaded: {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeleteSliderImage(image._id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Finish Orders - Completed/Cancelled Orders */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Finish Orders</h2>
              <p className="text-sm text-gray-600 mt-1">Completed and cancelled orders</p>
            </div>
            
            {error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : orders.filter(order => ['Delivered', 'Cancelled'].includes(order.status)).length === 0 ? (
              <div className="p-6 text-center text-gray-500">No finished orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.filter(order => ['Delivered', 'Cancelled'].includes(order.status)).map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
                          <div className="text-sm text-gray-500">{order.address.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="mb-1">
                                {item.name} × {item.qty}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View Product Modal */}
        {viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Product Details</h3>
                  <button
                    onClick={() => setViewingProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={`${BACKEND_URL}${viewingProduct.image}`} 
                      alt={viewingProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Name</h4>
                      <p className="text-gray-900">{viewingProduct.name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Category</h4>
                      <p className="text-gray-900">{viewingProduct.category}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Price</h4>
                      <p className="text-gray-900">₹{viewingProduct.price}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Rating</h4>
                      <p className="text-gray-900">{viewingProduct.rating}/5</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Description</h4>
                      <p className="text-gray-900">{viewingProduct.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={resetProductForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Product Form */}
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={productForm.price}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                        min="1"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                        required
                      >
                        <option value="">Select Category</option>
                        {FASHION_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={productForm.rating}
                        onChange={handleProductFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                        min="1"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-600"
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images (Max 5) {!editingProduct && '*'}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center w-full">
                        {imagePreviews.length > 0 ? (
                          <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {imagePreviews.map((preview, idx) => (
                              <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="h-20 w-20 object-cover rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex justify-center text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-pink-700 hover:text-pink-600 focus-within:outline-none">
                            <span>Upload files</span>
                            <input
                              type="file"
                              name="images"
                              onChange={handleProductFormChange}
                              accept="image/*"
                              multiple
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB. Select multiple files (max 5) at once.</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white rounded-md transition-colors"
                    >
                      {formLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
