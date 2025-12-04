/**
 * PostgreSQL Routes
 * 
 * This file defines RESTful API endpoints for task management using PostgreSQL.
 * The structure is similar to the MySQL routes, but uses PostgreSQL-specific syntax.
 * 
 * Key differences from MySQL:
 * - Uses $1, $2, etc. for query parameters instead of ?
 * - Returns results directly (no [rows, fields] destructuring)
 * - Uses RETURNING clause to get inserted/updated data in one query
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/postgresql');

/**
 * GET /api/postgresql/tasks
 * 
 * Retrieve all tasks from the PostgreSQL database
 */
router.get('/tasks', async (req, res) => {
    try {
        // PostgreSQL query using the pool
        // Unlike MySQL, pg returns { rows, fields, ... } directly
        const result = await pool.query(
            'SELECT * FROM tasks ORDER BY created_at DESC'
        );

        // Access the rows from the result object
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching tasks from PostgreSQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks',
            message: error.message
        });
    }
});

/**
 * GET /api/postgresql/tasks/:id
 * 
 * Retrieve a single task by its ID
 * 
 * Note: PostgreSQL uses $1, $2, etc. for parameterized queries
 * This is different from MySQL's ? placeholder
 */
router.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // PostgreSQL parameterized query using $1 syntax
        // The values array maps to $1, $2, etc. in order
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching task from PostgreSQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task',
            message: error.message
        });
    }
});

/**
 * POST /api/postgresql/tasks
 * 
 * Create a new task
 * 
 * PostgreSQL advantage: We can use RETURNING clause to get the inserted
 * row in a single query, which is more efficient than MySQL's approach
 * of INSERT followed by SELECT
 */
router.post('/tasks', async (req, res) => {
    try {
        const { title, description, status } = req.body;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Validate status if provided
        const validStatuses = ['pending', 'in_progress', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Insert and return the new row in a single query using RETURNING
        // This is a PostgreSQL-specific feature that MySQL doesn't have
        // The * after RETURNING means "return all columns"
        const result = await pool.query(
            `INSERT INTO tasks (title, description, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [title, description || null, status || 'pending']
        );

        // The inserted row is in result.rows[0]
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error('Error creating task in PostgreSQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

/**
 * PUT /api/postgresql/tasks/:id
 * 
 * Update an existing task
 * 
 * Again, we use RETURNING to get the updated row in one query
 */
router.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        // Validate status if provided
        const validStatuses = ['pending', 'in_progress', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let parameterIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${parameterIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${parameterIndex++}`);
            values.push(description);
        }
        if (status !== undefined) {
            updates.push(`status = $${parameterIndex++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        // Add ID as the last parameter
        values.push(id);

        // Execute UPDATE with RETURNING clause
        const result = await pool.query(
            `UPDATE tasks 
       SET ${updates.join(', ')} 
       WHERE id = $${parameterIndex}
       RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Task updated successfully'
        });
    } catch (error) {
        console.error('Error updating task in PostgreSQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            message: error.message
        });
    }
});

/**
 * DELETE /api/postgresql/tasks/:id
 * 
 * Delete a task
 * 
 * We can optionally use RETURNING here too if we want to return
 * the deleted task data to the client
 */
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Using RETURNING to confirm what was deleted
        // This is optional - you could omit RETURNING if you don't need the data
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully',
            // Optionally include the deleted task data
            deletedTask: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting task from PostgreSQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            message: error.message
        });
    }
});

// Export the router
module.exports = router;
