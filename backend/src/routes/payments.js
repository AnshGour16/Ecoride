const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Process a new payment
router.post('/process', verifyToken, PaymentController.processPayment);

// Get payment by ID
router.get('/:id', verifyToken, PaymentController.getPaymentById);

// Get payments for a specific booking
router.get('/booking/:booking_id', verifyToken, PaymentController.getPaymentsByBooking);

// Verify payment status
router.get('/verify/:transaction_id', verifyToken, PaymentController.verifyPayment);

// Process refund (admin only)
router.post('/:payment_id/refund', verifyToken, PaymentController.processRefund);

// Webhook endpoint for payment status updates (no auth required)
router.post('/webhook', PaymentController.handleWebhook);

// Admin routes
router.get('/', verifyToken, PaymentController.getAllPayments);
router.get('/admin/stats', verifyToken, PaymentController.getPaymentStats);

// Gateway status endpoint
router.get('/gateway/status', PaymentController.getGatewayStatus);

module.exports = router;