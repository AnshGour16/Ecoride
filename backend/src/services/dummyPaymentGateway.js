class DummyPaymentGateway {
    constructor() {
        this.apiUrl = 'https://dummy-payment-gateway.ecoride.com';
        this.merchantId = 'ECORIDE_MERCHANT_001';
        this.apiKey = 'dummy_api_key_12345';
    }

    // Generate a dummy transaction ID
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TXN_${timestamp}_${random}`.toUpperCase();
    }

    // Simulate card payment processing
    async processCardPayment(paymentData) {
        try {
            // Handle both 'number' and 'card_number' properties for flexibility
            const cardNumber = paymentData.card_details.number || paymentData.card_details.card_number;
            
            if (!cardNumber) {
                throw new Error('Card number is required');
            }

            console.log('Processing card payment:', {
                amount: paymentData.amount,
                card: `****${cardNumber.slice(-4)}`
            });

            // Simulate network delay
            await this.simulateDelay(1000, 3000);

            const transactionId = this.generateTransactionId();

            // Simulate different payment scenarios based on card number
            let result;

            if (cardNumber.endsWith('0000')) {
                // Failed payment scenario
                result = {
                    success: false,
                    status: 'failed',
                    transaction_id: transactionId,
                    error_code: 'INSUFFICIENT_FUNDS',
                    error_message: 'Insufficient funds in the account',
                    gateway_response: {
                        code: '51',
                        message: 'Declined - Insufficient Funds'
                    }
                };
            } else if (cardNumber.endsWith('9999')) {
                // Pending payment scenario
                result = {
                    success: true,
                    status: 'pending',
                    transaction_id: transactionId,
                    message: 'Payment is being processed',
                    gateway_response: {
                        code: '00',
                        message: 'Transaction Accepted - Pending'
                    }
                };
            } else {
                // Successful payment scenario
                result = {
                    success: true,
                    status: 'completed',
                    transaction_id: transactionId,
                    message: 'Payment processed successfully',
                    gateway_response: {
                        code: '00',
                        message: 'Transaction Approved'
                    },
                    authorization_code: `AUTH_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                };
            }

            // Add common fields
            result.amount = paymentData.amount;
            result.currency = 'INR';
            result.payment_method = 'card';
            result.processed_at = new Date().toISOString();

            console.log('Card payment result:', result);
            return result;

        } catch (error) {
            console.error('Error processing card payment:', error);
            throw new Error('Payment gateway error: ' + error.message);
        }
    }

    // Simulate UPI payment processing
    async processUpiPayment(paymentData) {
        try {
            console.log('Processing UPI payment:', {
                amount: paymentData.amount,
                upi_id: paymentData.upi_id
            });

            // Simulate network delay
            await this.simulateDelay(500, 2000);

            const transactionId = this.generateTransactionId();

            // Simulate different UPI scenarios based on UPI ID
            let result;

            if (paymentData.upi_id.includes('fail')) {
                result = {
                    success: false,
                    status: 'failed',
                    transaction_id: transactionId,
                    error_code: 'UPI_DECLINED',
                    error_message: 'UPI transaction declined by user',
                    gateway_response: {
                        code: 'U30',
                        message: 'UPI Transaction Declined'
                    }
                };
            } else {
                result = {
                    success: true,
                    status: 'completed',
                    transaction_id: transactionId,
                    message: 'UPI payment successful',
                    gateway_response: {
                        code: '00',
                        message: 'UPI Transaction Approved'
                    },
                    upi_ref_id: `UPI${Math.random().toString(36).substring(2, 12).toUpperCase()}`
                };
            }

            // Add common fields
            result.amount = paymentData.amount;
            result.currency = 'INR';
            result.payment_method = 'upi';
            result.processed_at = new Date().toISOString();

            console.log('UPI payment result:', result);
            return result;

        } catch (error) {
            console.error('Error processing UPI payment:', error);
            throw new Error('UPI gateway error: ' + error.message);
        }
    }

    // Simulate payment verification
    async verifyPayment(transactionId) {
        try {
            console.log('Verifying payment:', transactionId);

            // Simulate network delay
            await this.simulateDelay(200, 800);

            // Simulate verification response
            const verificationResult = {
                transaction_id: transactionId,
                verified: true,
                verification_time: new Date().toISOString(),
                gateway_response: {
                    code: '00',
                    message: 'Transaction Verified'
                }
            };

            console.log('Payment verification result:', verificationResult);
            return verificationResult;

        } catch (error) {
            console.error('Error verifying payment:', error);
            throw new Error('Verification error: ' + error.message);
        }
    }

    // Simulate refund processing
    async processRefund(transactionId, refundAmount, originalAmount) {
        try {
            console.log('Processing refund:', {
                transaction_id: transactionId,
                refund_amount: refundAmount,
                original_amount: originalAmount
            });

            // Simulate network delay
            await this.simulateDelay(1000, 2000);

            const refundTransactionId = this.generateTransactionId();

            // Simulate refund scenarios
            let result;

            if (refundAmount > originalAmount) {
                result = {
                    success: false,
                    error_code: 'INVALID_REFUND_AMOUNT',
                    error_message: 'Refund amount cannot exceed original payment amount',
                    gateway_response: {
                        code: '54',
                        message: 'Invalid Refund Amount'
                    }
                };
            } else {
                result = {
                    success: true,
                    status: 'completed',
                    refund_transaction_id: refundTransactionId,
                    original_transaction_id: transactionId,
                    refund_amount: refundAmount,
                    currency: 'INR',
                    message: 'Refund processed successfully',
                    gateway_response: {
                        code: '00',
                        message: 'Refund Approved'
                    },
                    processed_at: new Date().toISOString()
                };
            }

            console.log('Refund result:', result);
            return result;

        } catch (error) {
            console.error('Error processing refund:', error);
            throw new Error('Refund gateway error: ' + error.message);
        }
    }

    // Simulate webhook notification
    async simulateWebhook(paymentData, status) {
        try {
            console.log('Simulating webhook for payment:', paymentData.transaction_id);

            // Simulate webhook delay
            await this.simulateDelay(2000, 5000);

            const webhookData = {
                event_type: 'payment.status_update',
                transaction_id: paymentData.transaction_id,
                merchant_id: this.merchantId,
                status: status,
                amount: paymentData.amount,
                currency: 'INR',
                timestamp: new Date().toISOString(),
                signature: this.generateWebhookSignature(paymentData.transaction_id, status)
            };

            console.log('Webhook data:', webhookData);
            return webhookData;

        } catch (error) {
            console.error('Error simulating webhook:', error);
            throw error;
        }
    }

    // Generate webhook signature for verification
    generateWebhookSignature(transactionId, status) {
        const crypto = require('crypto');
        const data = `${transactionId}:${status}:${this.apiKey}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Verify webhook signature
    verifyWebhookSignature(transactionId, status, signature) {
        const expectedSignature = this.generateWebhookSignature(transactionId, status);
        return signature === expectedSignature;
    }

    // Utility method to simulate network delays
    async simulateDelay(minMs = 500, maxMs = 2000) {
        const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Get payment gateway status (for health checks)
    async getGatewayStatus() {
        try {
            await this.simulateDelay(100, 300);
            
            return {
                status: 'online',
                gateway_name: 'Dummy Payment Gateway',
                version: '1.0.0',
                supported_methods: ['card', 'upi'],
                merchant_id: this.merchantId,
                last_checked: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'offline',
                error: error.message,
                last_checked: new Date().toISOString()
            };
        }
    }
}

module.exports = DummyPaymentGateway;