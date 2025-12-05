/**
 * Test Setup File
 * 
 * This file runs before all tests and sets up the test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.MYSQL_HOST = 'localhost';
process.env.MYSQL_PORT = 3306;
process.env.MYSQL_USER = 'test_user';
process.env.MYSQL_PASSWORD = 'test_password';
process.env.MYSQL_DATABASE = 'test_db';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = 5432;
process.env.POSTGRES_USER = 'test_user';
process.env.POSTGRES_PASSWORD = 'test_password';
process.env.POSTGRES_DB = 'test_db';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Increase timeout for database tests
jest.setTimeout(10000);
