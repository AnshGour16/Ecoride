const Payment = require('../models/payment');
const Booking = require('../models/booking');
const DummyPaymentGateway = require('../services/dummyPaymentGateway');

const paymentGateway = new DummyPaymentGateway();

class PaymentController {
    // Process a new payment
    static async processPayment(req, res) {
        try {
            const { booking_id, payment_method, amount, card_details, upi_details } = req.body;

            // Extract UPI ID from upi_details if it exists
            const upi_id = upi_details?.upi_id;

            // Validate required fields
            if (!booking_id || !payment_method || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: booking_id, payment_method, amount'
                });
            }

            // Verify the booking exists and belongs to the user
            const booking = await Booking.findById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Verify the amount matches the booking total
            if (parseFloat(amount) !== parseFloat(booking.total_amount)) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment amount does not match booking total'
                });
            }

            // Check if payment already exists for this booking
            const existingPayments = await Payment.findByBookingId(booking_id);
            const completedPayment = existingPayments.find(p => p.payment_status === 'completed');
            if (completedPayment) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already completed for this booking'
                });
            }

            let gatewayResult;

            // Process payment based on method
            if (payment_method === 'card') {
                if (!card_details) {
                    return res.status(400).json({
                        success: false,
                        message: 'Card details required for card payment'
                    });
                }

                gatewayResult = await paymentGateway.processCardPayment({
                    amount: amount,
                    booking_id: booking_id,
                    card_details: card_details
                });
            } else if (payment_method === 'upi') {
                if (!upi_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'UPI ID required for UPI payment'
                    });
                }

                gatewayResult = await paymentGateway.processUpiPayment({
                    amount: amount,
                    booking_id: booking_id,
                    upi_id: upi_id
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported payment method'
                });
            }

            // Create payment record
            const paymentData = {
                booking_id: booking_id,
                amount: amount,
                payment_method: payment_method,
                payment_status: gatewayResult.status,
                transaction_id: gatewayResult.transaction_id,
                payment_date: new Date()
            };

            const paymentId = await Payment.create(paymentData);

            // If payment is successful, update booking status
            if (gatewayResult.success && gatewayResult.status === 'completed') {
                await Booking.updateStatus(booking_id, 'confirmed');
            }

            // Prepare response
            const response = {
                success: gatewayResult.success,
                payment_id: paymentId,
                transaction_id: gatewayResult.transaction_id,
                status: gatewayResult.status,
                amount: amount,
                payment_method: payment_method,
                message: gatewayResult.message
            };

            // Add additional data based on payment method
            if (payment_method === 'card' && gatewayResult.authorization_code) {
                response.authorization_code = gatewayResult.authorization_code;
            }

            if (payment_method === 'upi' && gatewayResult.upi_ref_id) {
                response.upi_ref_id = gatewayResult.upi_ref_id;
            }

            // Add error details if payment failed
            if (!gatewayResult.success) {
                response.error_code = gatewayResult.error_code;
                response.error_message = gatewayResult.error_message;
            }

            const statusCode = gatewayResult.success ? 200 : 400;
            res.status(statusCode).json(response);

        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during payment processing',
                error: error.message
            });
        }
    }

    // Get payment details by ID
    static async getPaymentById(req, res) {
        try {
            const { id } = req.params;
            const payment = await Payment.findById(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                payment: payment
            });
        } catch (error) {
            console.error('Error fetching payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching payment details',
                error: error.message
            });
        }
    }

    // Get payments for a specific booking
    static async getPaymentsByBooking(req, res) {
        try {
            const { booking_id } = req.params;
            const payments = await Payment.findByBookingId(booking_id);

            res.json({
                success: true,
                payments: payments
            });
        } catch (error) {
            console.error('Error fetching payments for booking:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching payment details',
                error: error.message
            });
        }
    }

    // Verify payment status
    static async verifyPayment(req, res) {
        try {
            const { transaction_id } = req.params;
            
            const payment = await Payment.findByTransactionId(transaction_id);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Verify with payment gateway
            const verificationResult = await paymentGateway.verifyPayment(transaction_id);

            res.json({
                success: true,
                payment: payment,
                verification: verificationResult
            });
        } catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }

    // Process refund
    static async processRefund(req, res) {
        try {
            const { payment_id } = req.params;
            const { refund_amount, reason } = req.body;

            const payment = await Payment.findById(payment_id);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            if (payment.payment_status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only refund completed payments'
                });
            }

            const refundResult = await paymentGateway.processRefund(
                payment.transaction_id,
                refund_amount,
                payment.amount
            );

            if (refundResult.success) {
                await Payment.processRefund(payment_id, refund_amount);
            }

            res.json({
                success: refundResult.success,
                message: refundResult.message,
                refund_transaction_id: refundResult.refund_transaction_id,
                refund_amount: refund_amount
            });

        } catch (error) {
            console.error('Error processing refund:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing refund',
                error: error.message
            });
        }
    }

    // Webhook handler for payment status updates
    static async handleWebhook(req, res) {
        try {
            const { event_type, transaction_id, status, signature } = req.body;

            // Verify webhook signature
            if (!paymentGateway.verifyWebhookSignature(transaction_id, status, signature)) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }

            // Find payment by transaction ID
            const payment = await Payment.findByTransactionId(transaction_id);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found for transaction ID'
                });
            }

            // Update payment status
            await Payment.updateStatus(payment.id, status);

            // If payment is completed, update booking status
            if (status === 'completed') {
                await Booking.updateStatus(payment.booking_id, 'confirmed');
            }

            console.log(`Webhook processed: ${transaction_id} -> ${status}`);
            
            res.json({
                success: true,
                message: 'Webhook processed successfully'
            });

        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook',
                error: error.message
            });
        }
    }

    // Get all payments (admin only)
    static async getAllPayments(req, res) {
        try {
            const payments = await Payment.findAll();
            res.json({
                success: true,
                payments: payments
            });
        } catch (error) {
            console.error('Error fetching all payments:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching payments',
                error: error.message
            });
        }
    }

    // Get payment statistics (admin only)
    static async getPaymentStats(req, res) {
        try {
            const stats = await Payment.getPaymentStats();
            res.json({
                success: true,
                stats: stats
            });
        } catch (error) {
            console.error('Error fetching payment stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching payment statistics',
                error: error.message
            });
        }
    }

    // Get payment gateway status
    static async getGatewayStatus(req, res) {
        try {
            const status = await paymentGateway.getGatewayStatus();
            res.json({
                success: true,
                gateway_status: status
            });
        } catch (error) {
            console.error('Error checking gateway status:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking payment gateway status',
                error: error.message
            });
        }
    }
}

module.exports = PaymentController;