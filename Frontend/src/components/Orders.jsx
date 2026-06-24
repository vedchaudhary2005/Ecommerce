import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { API_ENDPOINTS, getHeaders } from '../api/config';

const Orders = () => {
  const { user, token } = useAuth();
  const { showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.ORDERS.GET_USER_ORDERS}/${user.id}`, {
          headers: getHeaders(token),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.data.orders);
        } else {
          showToast('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
        showToast('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchOrders();
    }
  }, [user, token, showToast]);

  // Get status badge color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Processing':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />,
          description: 'Your order is being prepared'
        };
      case 'Out for Delivery':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Truck className="w-4 h-4" />,
          description: 'Your order is on the way'
        };
      case 'Delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          description: 'Order delivered successfully'
        };
      case 'Cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <Package className="w-4 h-4" />,
          description: 'Order has been cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Package className="w-4 h-4" />,
          description: 'Order status unknown'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24"> {/* Added extra bottom padding for mobile nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          Order #{order._id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center space-x-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span>{order.status}</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{statusInfo.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <Package className="w-5 h-5 mr-2" />
                          Items Ordered
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800">{item.name}</h5>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.qty}
                                </p>
                                <p className="text-sm text-pink-700 font-medium">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Delivery Details
                        </h4>
                        
                        {/* Delivery Address */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                            <div>
                              <p className="font-medium text-gray-800">{order.address.name}</p>
                              <p className="text-sm text-gray-600">
                                {order.address.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.address.city} - {order.address.pincode}
                              </p>
                              {order.address.landmark && (
                                <p className="text-sm text-gray-500">
                                  Landmark: {order.address.landmark}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Contact: {order.address.phone}</span>
                          </div>
                          {order.address.altPhone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Alt: {order.address.altPhone}</span>
                            </div>
                          )}
                        </div>

                        {/* Payment & Total */}
                        <div className="bg-pink-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">Total Amount:</span>
                            <span className="font-bold text-pink-700 text-lg">₹{order.totalAmount}</span>
                          </div>
                          <p className="text-sm text-gray-600">Payment: {order.paymentMode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
