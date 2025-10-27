const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Starting persistent database connection...');
console.log('Using configuration:', {
    host: 'localhost',
    user: 'root',
    database: 'ecoride_db',
    port: 3306
});

async function keepAlive(connection) {
    try {
        // Send a ping every 5 minutes to avoid idle timeout
        setInterval(async () => {
            try {
                await connection.ping();
                console.log(`[${new Date().toISOString()}] Connection alive`);
            } catch (err) {
                console.error('Ping failed:', err.message);
            }
        }, 5 * 60 * 1000);
    } catch (err) {
        console.error('Keep-alive error:', err.message);
    }
}

async function main() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1234',
            database: 'ecoride_db'
        });

        console.log('✅ Successfully connected to MySQL!');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Database tables:', rows);

        await keepAlive(connection);

        // Prevent script from exiting until Ctrl+C
        process.stdin.resume();

    } catch (error) {
        console.error('❌ Database connection error:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        });
        process.exit(1);
    }

    process.on('SIGINT', async () => {
        console.log('\nClosing database connection...');
        if (connection) await connection.end();
        process.exit(0);
    });
}

main();
