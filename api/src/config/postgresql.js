/**
 * PostgreSQL Database Configuration
 * 
 * This file sets up a connection pool to the PostgreSQL database.
 * Similar to MySQL, we use pooling for efficient connection management.
 * 
 * The 'pg' library is the standard PostgreSQL client for Node.js and
 * includes built-in promise support.
 */

// Import the Pool class from the pg library
const { Pool } = require('pg');

/**
 * Create a PostgreSQL connection pool
 * 
 * Pool configuration options:
 * - host: The hostname where PostgreSQL is running
 * - port: PostgreSQL port (default: 5432)
 * - user: Database username
 * - password: Database password
 * - database: The specific database to connect to
 * - max: Maximum number of clients in the pool
 * - idleTimeoutMillis: How long a client can be idle before being removed
 * - connectionTimeoutMillis: How long to wait when connecting before timing out
 */
const pool = new Pool({
    // In Docker Compose, 'postgresql' is the service name
    host: process.env.POSTGRES_HOST || 'postgresql',

    // PostgreSQL default port
    port: process.env.POSTGRES_PORT || 5432,

    // Database credentials
    // These should match the values in docker-compose.yml
    user: process.env.POSTGRES_USER || 'example_user',
    password: process.env.POSTGRES_PASSWORD || 'example_password',
    database: process.env.POSTGRES_DB || 'example_db',

    // Pool configuration
    max: 10,                      // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,     // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000 // Timeout after 2 seconds if unable to connect
});

/**
 * Test the database connection
 * This function attempts to connect and run a simple query
 */
async function testConnection() {
    try {
        // Attempt to acquire a client from the pool
        const client = await pool.connect();

        // Run a simple query to verify the connection works
        const result = await client.query('SELECT NOW()');

        console.log('✅ PostgreSQL database connected successfully');
        console.log('   Server time:', result.rows[0].now);

        // Release the client back to the pool
        // This is important to prevent connection leaks
        client.release();

        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        return false;
    }
}

/**
 * Handle pool errors
 * This catches errors that occur on idle clients
 * For example, if the database server goes down
 */
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Export the pool and test function
module.exports = {
    pool,
    testConnection
};
