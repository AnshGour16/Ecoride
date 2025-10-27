const { pool, query } = require('../config/db');

class Booking {
    static async create(bookingData) {
        try {
            console.log('Attempting to create booking with data:', bookingData);
            const sql = 'INSERT INTO bookings (user_id, car_id, start_date, end_date, status, pickup_location_id, dropoff_location_id, total_amount, driver_license_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const params = [
                    bookingData.user_id, 
                    bookingData.car_id, 
                    bookingData.start_date, 
                    bookingData.end_date, 
                bookingData.status || 'pending',
                bookingData.pickup_location_id || 1, // Default to location ID 1 if not provided
                bookingData.dropoff_location_id || 1, // Default to location ID 1 if not provided
                bookingData.total_amount || 0,
                bookingData.driver_license_number || null
            ];
            console.log('Executing SQL:', sql);
            console.log('With parameters:', params);
            
            const result = await query(sql, params);
            console.log('Booking.create result:', result);
            
            if (!result || !result.insertId) {
                console.error('No insertId returned from query');
                throw new Error('Failed to get insert ID from booking creation');
            }
            
            return result.insertId;
        } catch (error) {
            console.error('Error creating booking:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack,
                bookingData,
                sql: sql,
                params: params
            });
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await pool.query(
                `SELECT b.*, c.model, c.brand, c.image_url, c.price
                 FROM bookings b
                 JOIN cars c ON b.car_id = c.id
                 WHERE b.user_id = ?
                 ORDER BY b.created_at DESC`,
                [userId]
            );
            // Map car fields into a nested car object and remove them from the top level
            return rows.map(row => {
                const { model, brand, image_url, price, ...booking } = row;
                return {
                    ...booking,
                    car: {
                        model,
                        brand,
                        image_url,
                        price
                    }
                };
            });
        } catch (error) {
            console.error('Error finding bookings by user ID:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            console.log('[Booking Model] Finding booking by ID:', id);
            const result = await query(
                `SELECT b.*, c.model, c.brand, c.image_url, c.price
                 FROM bookings b
                 JOIN cars c ON b.car_id = c.id
                 WHERE b.id = ?`,
                [id]
            );
            console.log('[Booking Model] Find result:', result);
            return result[0];
        } catch (error) {
            console.error('[Booking Model] Error in findById:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw error;
        }
    }

    static async update(id, bookingData) {
        try {
            const [result] = await pool.query(
                'UPDATE bookings SET status = ?, start_date = ?, end_date = ? WHERE id = ?',
                [
                    bookingData.status, 
                    bookingData.start_date, 
                    bookingData.end_date, 
                    id
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    }

    // New method to check for conflicting bookings
    static async findConflictingBookings(carId, startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM bookings 
                 WHERE car_id = ? 
                 AND status != 'cancelled'
                 AND ((start_date BETWEEN ? AND ?) 
                 OR (end_date BETWEEN ? AND ?)
                 OR (start_date <= ? AND end_date >= ?))`,
                [carId, startDate, endDate, startDate, endDate, startDate, endDate]
            );
            return rows;
        } catch (error) {
            console.error('Error checking conflicting bookings:', error);
            throw error;
        }
    }

    // Method to get all bookings (for admin)
    static async findAll() {
        try {
            console.log('Booking.findAll called');
            const sql = `SELECT b.*, c.model, c.brand, u.name as user_name, u.email
                 FROM bookings b
                 JOIN cars c ON b.car_id = c.id
                 JOIN users u ON b.user_id = u.id
                 ORDER BY b.created_at DESC`;
            console.log('Executing SQL:', sql);
            
            const rows = await query(sql);
            console.log('Query result:', {
                rowCount: rows?.length || 0,
                firstRow: rows?.[0] ? 'exists' : 'none'
            });
            
            if (!rows) {
                console.log('No rows returned from query');
                return [];
            }
            
            // Ensure we're returning an array
            const bookingArray = Array.isArray(rows) ? rows : [rows];
            console.log('Returning bookings:', bookingArray.length);
            return bookingArray;
        } catch (error) {
            console.error('Error in Booking.findAll:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw new Error(`Failed to fetch bookings: ${error.message}`);
        }
    }

    static async updateStatus(id, status) {
        try {
            console.log('[Booking Model] Updating booking status:', { id, status });
            const result = await query(
                'UPDATE bookings SET status = ? WHERE id = ?',
                [status, id]
            );
            console.log('[Booking Model] Update result:', result);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('[Booking Model] Error in updateStatus:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw error;
        }
    }

    static async updateEBillDetails(id, eBillDetails) {
        try {
            const [result] = await pool.query(
                'UPDATE bookings SET e_bill_details = ? WHERE id = ?',
                [JSON.stringify(eBillDetails), id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating e-bill details:', error);
            throw error;
        }
    }
}

module.exports = Booking;