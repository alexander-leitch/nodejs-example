-- PostgreSQL Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time
-- It creates the database schema and populates it with sample data

-- Note: The database is already created via POSTGRES_DB environment variable
-- So we can directly create tables in the public schema

-- Create a custom type for task status
-- PostgreSQL allows creating custom types which can be reused across tables
-- This is similar to MySQL's ENUM but more flexible
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create the tasks table
-- PostgreSQL syntax is slightly different from MySQL
CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key with SERIAL (auto-incrementing integer)
    -- SERIAL is PostgreSQL's equivalent to MySQL's AUTO_INCREMENT
    id SERIAL PRIMARY KEY,
    
    -- Title of the task (required field)
    -- VARCHAR(255) works the same in PostgreSQL as in MySQL
    title VARCHAR(255) NOT NULL,
    
    -- Detailed description of the task (optional)
    -- TEXT type in PostgreSQL has no practical size limit
    description TEXT,
    
    -- Status field using our custom ENUM type
    -- We use the task_status type we created above
    -- DEFAULT specifies the value if none is provided
    status task_status DEFAULT 'pending',
    
    -- Timestamp when the task was created
    -- TIMESTAMP is a similar data type to MySQL
    -- DEFAULT CURRENT_TIMESTAMP sets it automatically on insert
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamp when the task was last updated
    -- PostgreSQL doesn't have ON UPDATE CURRENT_TIMESTAMP like MySQL
    -- We'll handle updates in the application code or with triggers
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the status column for better query performance
-- When filtering by status frequently, this speeds up SELECT queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create a trigger to automatically update the updated_at timestamp
-- This is PostgreSQL's way of achieving MySQL's ON UPDATE CURRENT_TIMESTAMP

-- First, create a function that updates the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the updated_at to the current time
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Then, create a trigger that calls this function before each UPDATE
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data to demonstrate the schema
-- PostgreSQL INSERT syntax is identical to MySQL for basic cases
INSERT INTO tasks (title, description, status) VALUES
    ('Set up project', 'Initialize Node.js project with Express and database connections', 'completed'),
    ('Create API endpoints', 'Build RESTful API for task management', 'in_progress'),
    ('Build frontend', 'Develop Nuxt.js frontend to consume the API', 'pending'),
    ('Write documentation', 'Create comprehensive README and code comments', 'pending'),
    ('Deploy application', 'Set up Docker containers and deploy to production', 'pending');

-- Display the inserted data for verification
-- Same syntax as MySQL
SELECT * FROM tasks;
