/**
 * Express API Server
 * 
 * This is the main entry point for the backend API.
 * It sets up the Express server, configures middleware, registers routes,
 * and handles database connections.
 * 
 * The server provides RESTful endpoints for both MySQL and PostgreSQL databases,
 * allowing you to see how to work with different databases in the same application.
 */

// Load environment variables from .env file
// This should be the first thing we do so variables are available everywhere
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');

// Import database configurations
const mysqlDb = require('./config/mysql');
const postgresDb = require('./config/postgresql');

// Import route handlers
const mysqlRoutes = require('./routes/mysql.routes');
const postgresRoutes = require('./routes/postgresql.routes');

// Create Express application instance
const app = express();

// Define the port the server will listen on
// Use environment variable if available, otherwise default to 3001
const PORT = process.env.PORT || 3001;

/**
 * Middleware Configuration
 * 
 * Middleware functions execute in order and can modify the request/response
 * or end the request-response cycle
 */

// CORS (Cross-Origin Resource Sharing) middleware
// This allows the frontend (running on a different port/domain) to make requests to this API
// In production, you would configure this to only allow specific origins
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
// express.json() parses incoming requests with JSON payloads
// This makes req.body available in route handlers
app.use(express.json());

// express.urlencoded() parses form data
// extended: true allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (simple version)
// This logs all incoming requests to the console
// In production, you'd use a proper logging library like Winston or Morgan
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next(); // Pass control to the next middleware
});

/**
 * Route Registration
 * 
 * Routes are organized by database type
 * Each route file handles all CRUD operations for that database
 */

// MySQL routes - all will be prefixed with /api/mysql
app.use('/api/mysql', mysqlRoutes);

// PostgreSQL routes - all will be prefixed with /api/postgresql
app.use('/api/postgresql', postgresRoutes);

/**
 * Health Check Endpoint
 * 
 * This endpoint is useful for monitoring and container health checks
 * It verifies that the API is running and can connect to both databases
 */
app.get('/health', async (req, res) => {
    // Test both database connections
    const mysqlStatus = await mysqlDb.testConnection();
    const postgresStatus = await postgresDb.testConnection();

    // If both databases are healthy, return 200 OK
    // If either fails, return 503 Service Unavailable
    const isHealthy = mysqlStatus && postgresStatus;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        databases: {
            mysql: mysqlStatus ? 'connected' : 'disconnected',
            postgresql: postgresStatus ? 'connected' : 'disconnected'
        }
    });
});

/**
 * Root Endpoint
 * 
 * Provides basic information about the API
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Node.js Example API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            mysql: {
                tasks: '/api/mysql/tasks',
                task: '/api/mysql/tasks/:id'
            },
            postgresql: {
                tasks: '/api/postgresql/tasks',
                task: '/api/postgresql/tasks/:id'
            }
        },
        documentation: 'See README.md for detailed API documentation'
    });
});

/**
 * 404 Handler
 * 
 * This middleware catches all requests that didn't match any routes above
 * It must be defined AFTER all other routes
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

/**
 * Global Error Handler
 * 
 * This catches any errors that occurred in route handlers
 * Express recognizes this as an error handler because it has 4 parameters
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

/**
 * Start the Server
 * 
 * Test database connections first, then start listening for requests
 */
async function startServer() {
    try {
        console.log('🚀 Starting server...');
        console.log('📊 Testing database connections...');

        // Test database connections
        await mysqlDb.testConnection();
        await postgresDb.testConnection();

        // Start the Express server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`📍 API available at http://localhost:${PORT}`);
            console.log(`🏥 Health check at http://localhost:${PORT}/health`);
            console.log(`\n📚 API Endpoints:`);
            console.log(`   MySQL:      http://localhost:${PORT}/api/mysql/tasks`);
            console.log(`   PostgreSQL: http://localhost:${PORT}/api/postgresql/tasks`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1); // Exit with error code
    }
}

// Start the server
startServer();

// Handle graceful shutdown
// This ensures connections are properly closed when the server stops
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
