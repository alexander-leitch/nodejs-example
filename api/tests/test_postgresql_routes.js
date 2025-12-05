/**
 * Unit Tests for PostgreSQL Routes
 * 
 * Tests all PostgreSQL CRUD endpoints for tasks
 */

const request = require('supertest');
const express = require('express');
const postgresRoutes = require('../src/routes/postgresql.routes');
const postgresDb = require('../src/config/postgresql');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/postgresql', postgresRoutes);

// Mock the PostgreSQL database
jest.mock('../src/config/postgresql');

describe('PostgreSQL Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/postgresql/tasks', () => {
        it('should return all tasks successfully', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', description: 'Description 1', status: 'pending' },
                { id: 2, title: 'Task 2', description: 'Description 2', status: 'completed' },
            ];

            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: mockTasks });

            const response = await request(app).get('/api/postgresql/tasks');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: mockTasks,
                count: 2,
            });
        });

        it('should handle database errors gracefully', async () => {
            postgresDb.pool.query = jest.fn().mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/postgresql/tasks');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/postgresql/tasks/:id', () => {
        it('should return a single task by ID', async () => {
            const mockTask = { id: 1, title: 'Task 1', description: 'Description 1', status: 'pending' };

            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [mockTask] });

            const response = await request(app).get('/api/postgresql/tasks/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: mockTask,
            });
        });

        it('should return 404 when task not found', async () => {
            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [] });

            const response = await request(app).get('/api/postgresql/tasks/999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error).toContain('not found');
        });

        it('should validate ID parameter', async () => {
            const response = await request(app).get('/api/postgresql/tasks/invalid');

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/postgresql/tasks', () => {
        it('should create a new task successfully with RETURNING clause', async () => {
            const newTask = {
                title: 'New Task',
                description: 'New Description',
                status: 'pending',
            };

            const createdTask = { id: 1, ...newTask };

            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [createdTask] });

            const response = await request(app)
                .post('/api/postgresql/tasks')
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
                .post('/api/postgresql/tasks')
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
                .post('/api/postgresql/tasks')
                .send(invalidTask);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('status');
        });

        it('should use parameterized queries with $1 syntax', async () => {
            const newTask = {
                title: 'Test',
                description: 'Test desc',
                status: 'pending',
            };

            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [{ id: 1, ...newTask }] });

            await request(app)
                .post('/api/postgresql/tasks')
                .send(newTask);

            expect(postgresDb.pool.query).toHaveBeenCalledWith(
                expect.stringContaining('$1'),
                expect.any(Array)
            );
        });
    });

    describe('PUT /api/postgresql/tasks/:id', () => {
        it('should update a task successfully with RETURNING clause', async () => {
            const updates = {
                title: 'Updated Task',
                status: 'completed',
            };

            const updatedTask = { id: 1, ...updates };

            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [updatedTask] });

            const response = await request(app)
                .put('/api/postgresql/tasks/1')
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toMatchObject(updates);
        });

        it('should return 404 when updating non-existent task', async () => {
            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [] });

            const response = await request(app)
                .put('/api/postgresql/tasks/999')
                .send({ title: 'Updated' });

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });

        it('should validate status field on update', async () => {
            const response = await request(app)
                .put('/api/postgresql/tasks/1')
                .send({ status: 'invalid_status' });

            expect(response.status).toBe(400);
        });

        it('should handle empty update gracefully', async () => {
            const response = await request(app)
                .put('/api/postgresql/tasks/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('No fields');
        });
    });

    describe('DELETE /api/postgresql/tasks/:id', () => {
        it('should delete a task successfully', async () => {
            postgresDb.pool.query = jest.fn().mockResolvedValue({ rowCount: 1 });

            const response = await request(app).delete('/api/postgresql/tasks/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Task deleted successfully',
            });
        });

        it('should return 404 when deleting non-existent task', async () => {
            postgresDb.pool.query = jest.fn().mockResolvedValue({ rowCount: 0 });

            const response = await request(app).delete('/api/postgresql/tasks/999');

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });
    });

    describe('PostgreSQL-specific features', () => {
        it('should use $1, $2 parameterized queries', async () => {
            const newTask = { title: 'Test', status: 'pending' };

            postgresDb.pool.query = jest.fn().mockResolvedValue({ rows: [{ id: 1, ...newTask }] });

            await request(app).post('/api/postgresql/tasks').send(newTask);

            const queryCall = postgresDb.pool.query.mock.calls[0];
            expect(queryCall[0]).toMatch(/\$\d+/); // Should contain $1, $2, etc.
        });

        it('should utilize RETURNING clause for inserts', async () => {
            postgresDb.pool.query = jest.fn().mockResolvedValue({
                rows: [{ id: 1, title: 'Test', status: 'pending' }]
            });

            await request(app).post('/api/postgresql/tasks').send({ title: 'Test' });

            const queryCall = postgresDb.pool.query.mock.calls[0];
            expect(queryCall[0]).toContain('RETURNING');
        });
    });
});
