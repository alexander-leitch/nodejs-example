/**
 * Unit Tests for PostgreSQL Configuration Module
 * 
 * Tests the PostgreSQL connection pool setup and test connection functionality
 */

const postgresConfig = require('../src/config/postgresql');

// Mock the pg library
jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('PostgreSQL Configuration', () => {
    describe('Pool', () => {
        it('should create a connection pool with correct configuration', () => {
            const { Pool } = require('pg');

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    host: process.env.POSTGRES_HOST,
                    port: parseInt(process.env.POSTGRES_PORT),
                    user: process.env.POSTGRES_USER,
                    password: process.env.POSTGRES_PASSWORD,
                    database: process.env.POSTGRES_DB,
                })
            );
        });

        it('should set max connections to 20', () => {
            const { Pool } = require('pg');

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    max: 20,
                })
            );
        });

        it('should set idle timeout to 30 seconds', () => {
            const { Pool } = require('pg');

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    idleTimeoutMillis: 30000,
                })
            );
        });

        it('should set connection timeout to 2 seconds', () => {
            const { Pool } = require('pg');

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    connectionTimeoutMillis: 2000,
                })
            );
        });
    });

    describe('testConnection', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return true when connection is successful', async () => {
            postgresConfig.pool.query = jest.fn().mockResolvedValue({ rows: [] });

            const result = await postgresConfig.testConnection();

            expect(result).toBe(true);
            expect(postgresConfig.pool.query).toHaveBeenCalledWith('SELECT 1');
        });

        it('should return false when connection fails', async () => {
            postgresConfig.pool.query = jest.fn().mockRejectedValue(new Error('Connection failed'));

            const result = await postgresConfig.testConnection();

            expect(result).toBe(false);
        });

        it('should handle database errors gracefully', async () => {
            const dbError = new Error('Database error');
            dbError.code = '28P01'; // Invalid password error code

            postgresConfig.pool.query = jest.fn().mockRejectedValue(dbError);

            const result = await postgresConfig.testConnection();

            expect(result).toBe(false);
        });
    });

    describe('pool export', () => {
        it('should export the connection pool', () => {
            expect(postgresConfig).toHaveProperty('pool');
            expect(postgresConfig.pool).toBeDefined();
        });

        it('should export testConnection function', () => {
            expect(postgresConfig).toHaveProperty('testConnection');
            expect(typeof postgresConfig.testConnection).toBe('function');
        });
    });

    describe('error event handling', () => {
        it('should register error event handler on pool', () => {
            expect(postgresConfig.pool.on).toHaveBeenCalledWith('error', expect.any(Function));
        });
    });
});
