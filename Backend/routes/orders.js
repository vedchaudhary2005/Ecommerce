const express = require('express');
const Order = require('../models/Order');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { placeOrder, updateOrderStatus, getAllOrders, getOrderById, getUserOrders } = require('../controllers/orderController');
const router = express.Router();

// POST /api/orders/place - Place new order with guaranteed success (using controller)
router.post('/place', authenticate, placeOrder);

// POST /api/orders - Create new order (legacy endpoint, redirects to controller)
router.post('/', authenticate, placeOrder);

// POST /api/orders/clear-cart - Clear user cart after successful order (optional endpoint)
router.post('/clear-cart', authenticate, async (req, res) => {
  try {
    // Log cart clearing request
    console.log('🧹 Cart clear request:', {
      userId: req.user.id,
      userAgent: req.get('User-Agent'),
      isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '')
    });

    // Note: Cart clearing is typically handled on frontend after successful order
    // This endpoint is provided for cases where frontend needs server confirmation
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('💥 Cart clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// GET /api/orders/user/:userId - Fetch all orders for a specific user (using controller)
router.get('/user/:userId', authenticate, getUserOrders);

// GET /api/orders/:orderId - Get single order details for tracking (using controller)
router.get('/:orderId', authenticate, getOrderById);

// GET /api/orders - Get all orders (admin only) (using controller)
router.get('/', authenticate, authorizeAdmin, getAllOrders);

// PUT /api/orders/update-status/:orderId - Update order status (admin only) (using controller)
router.put('/update-status/:orderId', authenticate, authorizeAdmin, updateOrderStatus);



module.exports = router;