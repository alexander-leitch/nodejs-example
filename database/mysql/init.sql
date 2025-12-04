-- MySQL Database Initialization Script
-- This script runs automatically when the MySQL container starts for the first time
-- It creates the database schema and populates it with sample data

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS example_db;

-- Switch to the database
USE example_db;

-- Create the tasks table
-- This demonstrates a simple entity with common field types
CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key with auto-increment
    -- This is the unique identifier for each task
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Title of the task (required field)
    -- VARCHAR(255) is a common choice for short text fields
    title VARCHAR(255) NOT NULL,
    
    -- Detailed description of the task (optional)
    -- TEXT type can hold much larger amounts of text than VARCHAR
    description TEXT,
    
    -- Status field using ENUM to restrict values to a predefined set
    -- This ensures data consistency and makes queries more reliable
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    
    -- Timestamp when the task was created
    -- DEFAULT CURRENT_TIMESTAMP automatically sets the time when inserted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamp when the task was last updated
    -- ON UPDATE CURRENT_TIMESTAMP automatically updates when the row is modified
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index on status for faster filtering queries
    -- When you frequently query by status, this improves performance
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data to demonstrate the schema
-- This provides immediate data to work with when testing the application
INSERT INTO tasks (title, description, status) VALUES
    ('Set up project', 'Initialize Node.js project with Express and database connections', 'completed'),
    ('Create API endpoints', 'Build RESTful API for task management', 'in_progress'),
    ('Build frontend', 'Develop Nuxt.js frontend to consume the API', 'pending'),
    ('Write documentation', 'Create comprehensive README and code comments', 'pending'),
    ('Deploy application', 'Set up Docker containers and deploy to production', 'pending');

-- Display the inserted data for verification
-- This helps confirm the initialization was successful
SELECT * FROM tasks;
