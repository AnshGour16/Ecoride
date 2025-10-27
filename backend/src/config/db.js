/**
 * MySQL Database Connection Module
 * Provides a connection pool with error handling
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Check if .env file exists before loading
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('Warning: .env file not found at path:', envPath);
  require('dotenv').config(); // Try default location as fallback
}

// Database configuration with safer defaults
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'ecoride_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Added for stability and to prevent unexpected disconnections
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  // Handle timezone automatically
  timezone: process.env.DB_TIMEZONE || 'local',
  // Connection timeout settings
  connectTimeout: 10000, // 10 seconds
  // Handle large numbers correctly
  supportBigNumbers: true,
  bigNumberStrings: true
};

// Create connection pool with error handling
let pool;
try {
  pool = mysql.createPool(config);
  
  // Add pool error event handler
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });
} catch (error) {
  console.error('Failed to create database pool:', error.message);
  process.exit(1); // Exit if we can't create the pool
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connection successful:', {
      host: config.host,
      database: config.database,
      port: config.port
    });
    return true;
  } catch (error) {
    console.error('Database connection failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      host: config.host,
      port: config.port
    });
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const query = async (sql, params = []) => {
  let connection;
  try {
    console.log('Executing query:', {
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      params: params
    });
    
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    console.log('Query executed successfully:', {
      rowsAffected: results.affectedRows,
      insertId: results.insertId,
      rowCount: Array.isArray(results) ? results.length : 0
    });
    return results;
  } catch (error) {
    console.error('Query error:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      params: params,
      stack: error.stack
    });
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Close the connection pool gracefully
 * @returns {Promise<void>}
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('Database connection pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  query,
  closePool
};