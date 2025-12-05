/**
 * Unit Tests for MySQL Routes
 * 
 * Tests all MySQL CRUD endpoints for tasks
 */

const request = require('supertest');
const express = require('express');
const mysqlRoutes = require('../src/routes/mysql.routes');
const mysqlDb = require('../src/config/mysql');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/mysql', mysqlRoutes);

// Mock the MySQL database
jest.mock('../src/config/mysql');

describe('MySQL Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/mysql/tasks', () => {
        it('should return all tasks successfully', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', description: 'Description 1', status: 'pending' },
                { id: 2, title: 'Task 2', description: 'Description 2', status: 'completed' },
            ];

            mysqlDb.pool.query = jest.fn().mockResolvedValue([mockTasks]);

            const response = await request(app).get('/api/mysql/tasks');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: mockTasks,
                count: 2,
            });
        });

        it('should handle database errors gracefully', async () => {
            mysqlDb.pool.query = jest.fn().mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/mysql/tasks');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/mysql/tasks/:id', () => {
        it('should return a single task by ID', async () => {
            const mockTask = [{ id: 1, title: 'Task 1', description: 'Description 1', status: 'pending' }];

            mysqlDb.pool.query = jest.fn().mockResolvedValue([mockTask]);

            const response = await request(app).get('/api/mysql/tasks/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: mockTask[0],
            });
        });

        it('should return 404 when task not found', async () => {
            mysqlDb.pool.query = jest.fn().mockResolvedValue([[]]);

            const response = await request(app).get('/api/mysql/tasks/999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error).toContain('not found');
        });

        it('should validate ID parameter', async () => {
            const response = await request(app).get('/api/mysql/tasks/invalid');

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/mysql/tasks', () => {
        it('should create a new task successfully', async () => {
            const newTask = {
                title: 'New Task',
                description: 'New Description',
                status: 'pending',
            };

            mysqlDb.pool.query = jest.fn()
                .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT query
                .mockResolvedValueOnce([[{ id: 1, ...newTask }]]); // SELECT query

            const response = await request(app)
                .post('/api/mysql/tasks')
                .send(newTask);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toMatchObject(newTask);
        });

        it('should require title field', async () => {
            const invalidTask = {
                description: 'No title',
            };

            const response = await request(app)
                .post('/api/mysql/tasks')
                .send(invalidTask);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('title');
        });

        it('should validate status field', async () => {
            const invalidTask = {
                title: 'Task',
                status: 'invalid_status',
            };

            const response = await request(app)
                .post('/api/mysql/tasks')
                .send(invalidTask);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('status');
        });
    });

    describe('PUT /api/mysql/tasks/:id', () => {
        it('should update a task successfully', async () => {
            const updates = {
                title: 'Updated Task',
                status: 'completed',
            };

            mysqlDb.pool.query = jest.fn()
                .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE query
                .mockResolvedValueOnce([[{ id: 1, ...updates }]]); // SELECT query

            const response = await request(app)
                .put('/api/mysql/tasks/1')
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toMatchObject(updates);
        });

        it('should return 404 when updating non-existent task', async () => {
            mysqlDb.pool.query = jest.fn().mockResolvedValue([{ affectedRows: 0 }]);

            const response = await request(app)
                .put('/api/mysql/tasks/999')
                .send({ title: 'Updated' });

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });

        it('should validate status field on update', async () => {
            const response = await request(app)
                .put('/api/mysql/tasks/1')
                .send({ status: 'invalid_status' });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/mysql/tasks/:id', () => {
        it('should delete a task successfully', async () => {
            mysqlDb.pool.query = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/mysql/tasks/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Task deleted successfully',
            });
        });

        it('should return 404 when deleting non-existent task', async () => {
            mysqlDb.pool.query = jest.fn().mockResolvedValue([{ affectedRows: 0 }]);

            const response = await request(app).delete('/api/mysql/tasks/999');

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });
    });
});
