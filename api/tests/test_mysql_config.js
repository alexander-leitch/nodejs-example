/**
 * Unit Tests for MySQL Configuration Module
 * 
 * Tests the MySQL connection pool setup and test connection functionality
 */

const mysqlConfig = require('../src/config/mysql');

// Mock the mysql2 library
jest.mock('mysql2/promise', () => ({
    createPool: jest.fn(() => ({
        getConnection: jest.fn(),
        end: jest.fn(),
    })),
}));

describe('MySQL Configuration', () => {
    describe('createPool', () => {
        it('should create a connection pool with correct configuration', () => {
            const mysql = require('mysql2/promise');

            expect(mysql.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    host: process.env.MYSQL_HOST,
                    port: parseInt(process.env.MYSQL_PORT),
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE,
                })
            );
        });

        it('should set connection limit to 10', () => {
            const mysql = require('mysql2/promise');

            expect(mysql.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    connectionLimit: 10,
                })
            );
        });

        it('should enable waiting for connections', () => {
            const mysql = require('mysql2/promise');

            expect(mysql.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    waitForConnections: true,
                })
            );
        });
    });

    describe('testConnection', () => {
        it('should return true when connection is successful', async () => {
            const mockConnection = {
                execute: jest.fn().mockResolvedValue([[]]),
                release: jest.fn(),
            };

            mysqlConfig.pool.getConnection = jest.fn().mockResolvedValue(mockConnection);

            const result = await mysqlConfig.testConnection();

            expect(result).toBe(true);
            expect(mockConnection.execute).toHaveBeenCalledWith('SELECT 1');
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should return false when connection fails', async () => {
            mysqlConfig.pool.getConnection = jest.fn().mockRejectedValue(new Error('Connection failed'));

            const result = await mysqlConfig.testConnection();

            expect(result).toBe(false);
        });

        it('should release connection even if execute fails', async () => {
            const mockConnection = {
                execute: jest.fn().mockRejectedValue(new Error('Query failed')),
                release: jest.fn(),
            };

            mysqlConfig.pool.getConnection = jest.fn().mockResolvedValue(mockConnection);

            await mysqlConfig.testConnection();

            expect(mockConnection.release).toHaveBeenCalled();
        });
    });

    describe('pool export', () => {
        it('should export the connection pool', () => {
            expect(mysqlConfig).toHaveProperty('pool');
            expect(mysqlConfig.pool).toBeDefined();
        });

        it('should export testConnection function', () => {
            expect(mysqlConfig).toHaveProperty('testConnection');
            expect(typeof mysqlConfig.testConnection).toBe('function');
        });
    });
});
