/**
 * MySQL Database Configuration
 * 
 * This file sets up a connection pool to the MySQL database.
 * A connection pool maintains multiple database connections that can be reused,
 * which is more efficient than creating a new connection for each query.
 */

// Import the mysql2 library with promise support
// The '/promise' import gives us async/await functionality instead of callbacks
const mysql = require('mysql2/promise');

/**
 * Create a connection pool
 * 
 * Pool configuration options:
 * - host: The hostname where MySQL is running (from Docker service name)
 * - user: Database username
 * - password: Database password
 * - database: The specific database to connect to
 * - waitForConnections: If true, queue requests when all connections are in use
 * - connectionLimit: Maximum number of connections in the pool
 * - queueLimit: Maximum number of queued connection requests (0 = unlimited)
 */
const pool = mysql.createPool({
  // In Docker Compose, services can reference each other by service name
  // 'mysql' is the service name defined in docker-compose.yml
  host: process.env.MYSQL_HOST || 'mysql',
  
  // Default MySQL port
  port: process.env.MYSQL_PORT || 3306,
  
  // Database credentials
  // These should match the values in docker-compose.yml
  user: process.env.MYSQL_USER || 'example_user',
  password: process.env.MYSQL_PASSWORD || 'example_password',
  database: process.env.MYSQL_DATABASE || 'example_db',
  
  // Pool configuration for optimal performance
  waitForConnections: true,
  connectionLimit: 10,  // Adjust based on your application's needs
  queueLimit: 0         // No limit on queued requests
});

/**
 * Test the database connection
 * This function is useful for health checks and debugging
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release(); // Always release connections back to the pool
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

// Export the pool for use in route handlers
// Also export the test function for health checks
module.exports = {
  pool,
  testConnection
};
