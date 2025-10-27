const { pool, query } = require('../config/db');

class User {
    /**
     * Create a new user
     * @param {Object} userData - User data including name, email, hashed_password
     * @returns {Promise<Object>} User object with ID
     */
    static async create(userData) {
        try {
            // Build fields and values arrays dynamically
            const fields = ['name', 'email', 'hashed_password', 'role'];
            const values = [userData.name, userData.email, userData.hashed_password, userData.role || 'user'];

            // Optional fields
            if (userData.phone !== undefined) {
                fields.push('phone');
                values.push(userData.phone);
            }
            if (userData.address !== undefined) {
                fields.push('address');
                values.push(userData.address);
            }
            if (userData.driver_license !== undefined) {
                fields.push('driver_license');
                values.push(userData.driver_license);
            }
            if (userData.license_expiry !== undefined) {
                fields.push('license_expiry');
                values.push(userData.license_expiry);
            }

            const placeholders = fields.map(() => '?').join(', ');
            const sql = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`;

            console.log('Attempting to insert user:', userData);
            const [result] = await pool.query(sql, values);
            console.log('Insert result:', result);

            return {
                id: result.insertId,
                name: userData.name,
                email: userData.email,
                role: userData.role || 'user'
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email address is already registered');
            }
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    /**
     * Find user by email
     * @param {string} email - User's email address
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findByEmail(email) {
        try {
            const [rows] = await pool.query(
                `SELECT id, name, email, hashed_password, role, phone, address, 
                driver_license, license_expiry, created_at 
                FROM users WHERE email = ?`,
                [email]
            );
            
            // Handle case where rows might be undefined or not an array
            if (!rows || !Array.isArray(rows) || rows.length === 0) {
                return null;
            }
            
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Failed to find user by email');
        }
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null if not found
     */
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                `SELECT id, name, email, role, phone, address, 
                driver_license, license_expiry, created_at 
                FROM users WHERE id = ?`,
                [id]
            );
            
            // Handle case where rows might be undefined or not an array
            if (!rows || !Array.isArray(rows) || rows.length === 0) {
                return null;
            }
            
            return rows[0];
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw new Error('Failed to find user by id');
        }
    }

    /**
     * Update user information
     * @param {number} id - User ID to update
     * @param {Object} userData - Data to update
     * @returns {Promise<boolean>} True if update was successful
     */
    static async update(id, userData) {
        try {
            // Build dynamic update query based on provided fields
            const fieldsToUpdate = [];
            const values = [];
            
            // List of allowed fields to update
            const allowedFields = [
                'name', 'phone', 'address', 
                'driver_license', 'license_expiry'
            ];
            
            allowedFields.forEach(field => {
                if (userData[field] !== undefined) {
                    fieldsToUpdate.push(`${field} = ?`);
                    values.push(userData[field]);
                }
            });
            
            if (fieldsToUpdate.length === 0) {
                throw new Error('No valid fields provided for update');
            }
            
            values.push(id);
            
            const [result] = await pool.query(
                `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
                values
            );
            
            return result && result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    /**
     * Update user password
     * @param {number} id - User ID
     * @param {string} newHashedPassword - New hashed password
     * @returns {Promise<boolean>} True if password was updated
     */
    static async updatePassword(id, newHashedPassword) {
        try {
            const [result] = await pool.query(
                'UPDATE users SET hashed_password = ? WHERE id = ?',
                [newHashedPassword, id]
            );
            return result && result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Failed to update password');
        }
    }

    /**
     * Check if email exists (useful for registration validation)
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} True if email exists
     */
    static async emailExists(email) {
        try {
            const [rows] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            return rows && Array.isArray(rows) && rows.length > 0;
        } catch (error) {
            console.error('Error checking if email exists:', error);
            throw new Error('Failed to check email existence');
        }
    }

    static async findAll() {
        try {
            console.log('User.findAll called');
            const sql = `SELECT id, name, email, role, phone, address, 
                driver_license, license_expiry, created_at 
                FROM users`;
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
            const userArray = Array.isArray(rows) ? rows : [rows];
            console.log('Returning users:', userArray.length);
            return userArray;
        } catch (error) {
            console.error('Error in User.findAll:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }

    static async destroy({ where }) {
        try {
            if (!where || !where.id) throw new Error('No user ID provided for deletion');
            const [result] = await pool.query('DELETE FROM users WHERE id = ?', [where.id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }

    static async findByPk(id) {
        return this.findById(id);
    }
}

module.exports = User;