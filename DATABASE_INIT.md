# Database Initialization for Render PostgreSQL

The Render PostgreSQL database needs to be initialized with the tasks table schema.

## Quick Setup

Connect to your Render PostgreSQL database and run this SQL:

```sql
-- Create tasks table for PostgreSQL
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sample data (optional)
INSERT INTO tasks (title, description, status) VALUES
    ('Welcome to PostgreSQL', 'This is your first task in the deployed database!', 'pending'),
    ('Test the API', 'Try creating, updating, and deleting tasks', 'pending'),
    ('Deploy Complete', 'Your full-stack app is now live!', 'completed');
```

## How to Run This

### Option 1: Using Render Dashboard
1. Go to https://render.com/dashboard
2. Find your `nodejs-example-db` database
3. Click "Connect" and choose "Psql"
4. Copy and paste the SQL above
5. Press Enter

### Option 2: Using psql Locally
1. Get the database connection string from Render dashboard
2. Run:
```bash
psql "postgresql://user:password@host/database" -c "CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
```

### Option 3: Add to package.json script
Add this to api/package.json:
```json
"scripts": {
  "db:init": "node -e \"require('pg').Pool({connectionString:process.env.DATABASE_URL}).query('CREATE TABLE IF NOT EXISTS tasks...')\""
}
```

## Verification

After running the SQL, test the API:
```bash
curl https://nodejs-example-api.onrender.com/api/postgresql/tasks
```

You should see the sample tasks returned!
