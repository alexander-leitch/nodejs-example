/**
 * MySQL Routes
 * 
 * This file defines RESTful API endpoints for task management using MySQL.
 * 
 * RESTful conventions:
 * - GET /api/mysql/tasks          - Get all tasks
 * - GET /api/mysql/tasks/:id      - Get a single task by ID
 * - POST /api/mysql/tasks         - Create a new task
 * - PUT /api/mysql/tasks/:id      - Update an existing task
 * - DELETE /api/mysql/tasks/:id   - Delete a task
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/mysql');

/**
 * GET /api/mysql/tasks
 * 
 * Retrieve all tasks from the MySQL database
 * 
 * Response: Array of task objects
 * Example: [{ id: 1, title: "...", description: "...", status: "...", ... }]
 */
router.get('/tasks', async (req, res) => {
    try {
        // Execute a SELECT query to get all tasks
        // The [rows] syntax destructures the result - pool.query returns [rows, fields]
        const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');

        // Return the tasks as JSON with 200 OK status
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        // If anything goes wrong, log it and return a 500 error to the client
        console.error('Error fetching tasks from MySQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks',
            message: error.message
        });
    }
});

/**
 * GET /api/mysql/tasks/:id
 * 
 * Retrieve a single task by its ID
 * 
 * Path parameter:
 * - id: The task ID to retrieve
 * 
 * Response: Single task object or 404 if not found
 */
router.get('/tasks/:id', async (req, res) => {
    try {
        // Extract the ID from the URL parameters
        const { id } = req.params;

        // Use parameterized query to prevent SQL injection
        // The ? is a placeholder that gets replaced with the id value safely
        const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

        // Check if a task was found
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        // Return the first (and only) result
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching task from MySQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task',
            message: error.message
        });
    }
});

/**
 * POST /api/mysql/tasks
 * 
 * Create a new task
 * 
 * Request body (JSON):
 * {
 *   "title": "Task title",           // Required
 *   "description": "Description",    // Optional
 *   "status": "pending"              // Optional, defaults to 'pending'
 * }
 * 
 * Response: The newly created task with its generated ID
 */
router.post('/tasks', async (req, res) => {
    try {
        // Extract task data from the request body
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

        // Insert the new task into the database
        // MySQL will auto-generate the ID and timestamps
        const [result] = await pool.query(
            'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
            [title, description || null, status || 'pending']
        );

        // Fetch the newly created task to return it with all fields
        const [newTask] = await pool.query(
            'SELECT * FROM tasks WHERE id = ?',
            [result.insertId]
        );

        // Return the new task with 201 Created status
        res.status(201).json({
            success: true,
            data: newTask[0],
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error('Error creating task in MySQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

/**
 * PUT /api/mysql/tasks/:id
 * 
 * Update an existing task
 * 
 * Path parameter:
 * - id: The task ID to update
 * 
 * Request body (JSON) - all fields are optional:
 * {
 *   "title": "New title",
 *   "description": "New description",
 *   "status": "completed"
 * }
 * 
 * Response: The updated task
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

        // Build the UPDATE query dynamically based on provided fields
        // This allows partial updates (only updating the fields that are provided)
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
        }

        // If no fields to update, return an error
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        // Add the ID to the end of the values array for the WHERE clause
        values.push(id);

        // Execute the UPDATE query
        const [result] = await pool.query(
            `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Check if any row was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        // Fetch and return the updated task
        const [updatedTask] = await pool.query(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            data: updatedTask[0],
            message: 'Task updated successfully'
        });
    } catch (error) {
        console.error('Error updating task in MySQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            message: error.message
        });
    }
});

/**
 * DELETE /api/mysql/tasks/:id
 * 
 * Delete a task
 * 
 * Path parameter:
 * - id: The task ID to delete
 * 
 * Response: Success message
 */
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Execute the DELETE query
        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

        // Check if any row was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task from MySQL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            message: error.message
        });
    }
});

// Export the router to be used in the main app
module.exports = router;
