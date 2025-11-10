const { pool, query } = require('../config/db');

class Payment {
    static async create(paymentData) {
        try {
            console.log('Creating payment with data:', paymentData);
            const sql = `INSERT INTO payments 
                (booking_id, amount, payment_date, payment_method, payment_status, transaction_id) 
                VALUES (?, ?, ?, ?, ?, ?)`;
            const params = [
                paymentData.booking_id,
                paymentData.amount,
                paymentData.payment_date || new Date(),
                paymentData.payment_method,
                paymentData.payment_status || 'pending',
                paymentData.transaction_id
            ];
            
            const result = await query(sql, params);
            console.log('Payment created with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const result = await query(
                'SELECT * FROM payments WHERE id = ?',
                [id]
            );
            return result[0];
        } catch (error) {
            console.error('Error finding payment by ID:', error);
            throw error;
        }
    }

    static async findByBookingId(bookingId) {
        try {
            const result = await query(
                'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC',
                [bookingId]
            );
            return result;
        } catch (error) {
            console.error('Error finding payments by booking ID:', error);
            throw error;
        }
    }

    static async findByTransactionId(transactionId) {
        try {
            const result = await query(
                'SELECT * FROM payments WHERE transaction_id = ?',
                [transactionId]
            );
            return result[0];
        } catch (error) {
            console.error('Error finding payment by transaction ID:', error);
            throw error;
        }
    }

    static async updateStatus(id, status, additionalData = {}) {
        try {
            let sql = 'UPDATE payments SET payment_status = ?';
            let params = [status, id];

            // Add optional fields if provided
            if (additionalData.refund_amount) {
                sql += ', refund_amount = ?';
                params.splice(-1, 0, additionalData.refund_amount);
            }
            if (additionalData.refund_date) {
                sql += ', refund_date = ?';
                params.splice(-1, 0, additionalData.refund_date);
            }

            sql += ' WHERE id = ?';

            const result = await query(sql, params);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const result = await query(`
                SELECT p.*, b.user_id, u.name as user_name, u.email as user_email,
                       b.car_id, c.model, c.brand
                FROM payments p
                JOIN bookings b ON p.booking_id = b.id
                JOIN users u ON b.user_id = u.id
                JOIN cars c ON b.car_id = c.id
                ORDER BY p.created_at DESC
            `);
            return result;
        } catch (error) {
            console.error('Error finding all payments:', error);
            throw error;
        }
    }

    static async getPaymentStats() {
        try {
            const result = await query(`
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) as failed_count,
                    AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END) as avg_payment_amount
                FROM payments
            `);
            return result[0];
        } catch (error) {
            console.error('Error getting payment stats:', error);
            throw error;
        }
    }

    static async processRefund(paymentId, refundAmount) {
        try {
            const refundDate = new Date();
            const result = await query(
                `UPDATE payments 
                 SET payment_status = 'refunded', refund_amount = ?, refund_date = ? 
                 WHERE id = ? AND payment_status = 'completed'`,
                [refundAmount, refundDate, paymentId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }
}

module.exports = Payment;