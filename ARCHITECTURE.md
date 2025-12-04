# Project Architecture

This document provides a deep dive into the technical architecture of the Node.js Database Example project.

## 🏗️ System Overview

The project follows a three-tier architecture:

1. **Presentation Layer** - Nuxt.js frontend (Vue 3)
2. **Application Layer** - Express.js REST API
3. **Data Layer** - MySQL and PostgreSQL databases

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Client                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Nuxt.js Frontend (SSR/CSR)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages: index.vue, mysql.vue, postgresql.vue     │  │
│  │  Components: Auto-imported Vue components        │  │
│  │  Assets: Global CSS, Design System               │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│                Express.js API Server                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware: CORS, JSON parser, Logger           │  │
│  │  Routes: mysql.routes.js, postgresql.routes.js   │  │
│  │  Config: Database connection pools               │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬──────────────────┬─────────────────────┘
                 │                  │
                 ▼                  ▼
       ┌─────────────────┐  ┌──────────────────┐
       │  MySQL Database │  │ PostgreSQL       │
       │  (Port 3306)    │  │ Database         │
       │  - mysql2 lib   │  │ (Port 5432)      │
       │  - Connection   │  │ - pg library     │
       │    pooling      │  │ - Connection     │
       └─────────────────┘  │   pooling        │
                            └──────────────────┘
```

## 🔧 Technology Stack

### Backend

#### Express.js
- **Why chosen:** Minimal, flexible, and most popular Node.js web framework
- **Key features used:**
  - Middleware pipeline for request processing
  - Route handlers for API endpoints
  - JSON body parsing
  - Error handling middleware

#### Database Drivers

**mysql2**
- Promise-based MySQL client for Node.js
- Connection pooling for performance
- Parameterized queries using `?` placeholders
- Binary protocol for faster data transfer

**pg (node-postgres)**
- PostgreSQL client for Node.js
- Connection pooling
- Parameterized queries using `$1, $2` syntax
- Promises and async/await support

### Frontend

#### Nuxt.js 3
- **Why chosen:** Vue 3 framework with SSR, auto-routing, and excellent DX
- **Key features used:**
  - File-based routing (`pages/` directory)
  - Auto-imports for components and composables
  - Server-side rendering capability
  - Vite for fast development
  - Built-in proxy for API calls

#### Vue 3 Composition API
- **Why chosen:** More flexible and better TypeScript support than Options API
- **Patterns used:**
  - `<script setup>` for conciseness
  - `ref()` for reactive state
  - `onMounted()` lifecycle hook
  - `useHead()` for meta tags

### Infrastructure

#### Docker & Docker Compose
- **Why chosen:** Consistent development environment across platforms
- **Benefits:**
  - No local database installation needed
  - Reproducible environments
  - Easy service orchestration
  - Production-like setup locally

## 🗃️ Data Architecture

### Database Design Rationale

**Why Two Databases?**

This project intentionally includes both MySQL and PostgreSQL to:
1. Demonstrate how to work with different SQL databases
2. Show syntax differences and unique features
3. Allow learning by comparison
4. Prepare developers for real-world scenarios with multiple databases

### Schema Design

The `tasks` table is intentionally simple to focus on learning CRUD operations and database integration rather than complex data modeling.

**Fields:**
- `id` - Primary key, demonstrates auto-increment in both databases
- `title` - Required field, shows validation
- `description` - Optional field, demonstrates NULL handling
- `status` - ENUM type, shows custom types and constraints
- `created_at` - Timestamp, shows automatic value setting
- `updated_at` - Timestamp, shows automatic updates (different approaches)

### MySQL vs PostgreSQL: Key Differences

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| **Parameterization** | `?` placeholders | `$1, $2, $3` numbered |
| **Auto-increment** | `AUTO_INCREMENT` | `SERIAL` type |
| **ENUM** | Built-in `ENUM('a', 'b')` | Custom types |
| **Updated timestamp** | `ON UPDATE CURRENT_TIMESTAMP` | Triggers required |
| **Return inserted data** | Requires separate SELECT | `RETURNING *` clause |
| **Driver** | mysql2 | pg |
| **Connection result** | `[rows, fields]` array | `{rows, fields}` object |

## 🔄 Request Flow

### Example: Creating a Task

1. **User Action:** User fills form and clicks "Create Task"

2. **Frontend Processing:**
   ```javascript
   // pages/mysql.vue
   async function createTask() {
     const response = await fetch(`${apiBase}/api/mysql/tasks`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(newTask.value)
     });
   }
   ```

3. **HTTP Request:** `POST http://localhost:3001/api/mysql/tasks`
   ```json
   {
     "title": "New Task",
     "description": "Description",
     "status": "pending"
   }
   ```

4. **Express Middleware Pipeline:**
   - CORS middleware allows the request
   - JSON parser reads the body
   - Logger logs the request
   - Route handler is called

5. **Route Handler:**
   ```javascript
   // api/src/routes/mysql.routes.js
   router.post('/tasks', async (req, res) => {
     const { title, description, status } = req.body;
     // Validation...
     const [result] = await pool.query(
       'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
       [title, description, status]
     );
   });
   ```

6. **Database Operation:**
   - Connection acquired from pool
   - Parameterized query executed
   - Auto-increment ID generated
   - Connection returned to pool

7. **Response:**
   ```json
   {
     "success": true,
     "data": {
       "id": 6,
       "title": "New Task",
       "description": "Description",
       "status": "pending",
       "created_at": "2024-01-01T12:00:00Z",
       "updated_at": "2024-01-01T12:00:00Z"
     }
   }
   ```

8. **Frontend Update:**
   - Response parsed
   - New task added to local state
   - UI automatically re-renders
   - Form reset

## 🔐 Security Considerations

### Implemented Security Measures

1. **SQL Injection Prevention**
   - All queries use parameterized statements
   - Never concatenate user input into SQL
   - Example: `pool.query('SELECT * FROM tasks WHERE id = ?', [id])`

2. **CORS Configuration**
   - Restricts which origins can access the API
   - Configured to allow only the frontend URL

3. **Input Validation**
   - Required fields checked
   - Status values validated against allowed enum values
   - Type checking for data fields

4. **Docker Security**
   - Non-root users in containers
   - Minimal base images (Alpine Linux)
   - No sensitive data in images

### Production Recommendations

For production deployment, also implement:

- **Environment Variables:** Never hardcode credentials
- **HTTPS:** Use TLS/SSL certificates
- **Authentication:** Add JWT or session-based auth
- **Rate Limiting:** Prevent API abuse
- **Database Users:** Use separate user accounts with minimal privileges
- **Secrets Management:** Use Docker secrets or cloud secret managers
- **Network Policies:** Restrict database access to API only
- **Regular Updates:** Keep dependencies updated

## 🚀 Performance Optimizations

### Connection Pooling

Both database drivers use connection pools:

**Benefits:**
- Reuses connections instead of creating new ones
- Reduces overhead of establishing connections
- Handles concurrent requests efficiently
- Automatic connection management

**Configuration:**
```javascript
const pool = mysql.createPool({
  connectionLimit: 10,  // Max concurrent connections
  waitForConnections: true,  // Queue requests if pool is full
  queueLimit: 0  // No limit on queue
});
```

### Frontend Optimizations

1. **Nuxt SSR:** Pages can be server-rendered for faster initial load
2. **Code Splitting:** Nuxt automatically splits code by page
3. **Auto-imports:** Only imports what's used, reducing bundle size
4. **Vite:** Fast hot module replacement during development

### Database Query Optimization

1. **Indexes:** Status field indexed for faster filtering
2. **Prepared Statements:** Query plans cached by database
3. **Connection Pooling:** Reuse connections
4. **Select Specific Columns:** In production, avoid `SELECT *`

## 📦 Docker Architecture

### Multi-Stage Builds

Both frontend and API use multi-stage builds:

**Benefits:**
- Smaller final images (excludes build tools)
- Faster deployment
- Better security (fewer packages)

**Example (API):**
```dockerfile
FROM node:20-alpine  # Base image (~40MB)
WORKDIR /app
COPY package*.json ./
RUN npm ci --production  # Only prod dependencies
COPY src/ ./src/
CMD ["node", "src/index.js"]
```

### Service Dependencies

Docker Compose orchestrates startup order:

```yaml
api:
  depends_on:
    mysql:
      condition: service_healthy  # Wait for MySQL to be ready
    postgresql:
      condition: service_healthy  # Wait for PostgreSQL
```

### Health Checks

Each service has health checks:
- **Databases:** Check if accepting connections
- **API:** Check `/health` endpoint
- **Frontend:** Check if HTTP server responds

### Volumes

- **Named Volumes:** Persist database data
- **Bind Mounts:** Mount initialization scripts

## 🎨 Frontend Architecture

### Component Organization

```
frontend/
├── app/
│   └── app.vue              # Root component
├── pages/                   # Auto-routed pages
│   ├── index.vue           # Route: /
│   ├── mysql.vue           # Route: /mysql
│   └── postgresql.vue      # Route: /postgresql
├── components/             # Reusable components (none yet)
└── assets/css/
    └── main.css           # Global styles
```

### State Management

Uses Vue 3 Composition API with local state:
- `ref()` for reactive variables
- No global state manager (not needed for this simple app)
- State is component-scoped

**For larger apps, consider:**
- Pinia (recommended Vue state manager)
- Composables for shared logic
- Server state libraries (TanStack Query)

### CSS Architecture

**Design System Approach:**
- CSS Custom Properties (variables) for theming
- Utility classes for common patterns
- Component-scoped styles with `<style scoped>`
- Mobile-first responsive design

## 🔄 Development Workflow

### Hot Module Replacement (HMR)

In development mode:
- Frontend: Vite provides instant HMR
- API: nodemon restarts on file changes
- Docker: Can mount source as volumes for live reload

### Adding New Features

**Example: Add Priority Field**

1. **Database:**
   ```sql
   ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium';
   ```

2. **API Routes:**
   ```javascript
   // Add priority to query
   const { title, description, status, priority } = req.body;
   ```

3. **Frontend:**
   ```vue
   <select v-model="newTask.priority">
     <option value="low">Low</option>
     <option value="medium">Medium</option>
     <option value="high">High</option>
   </select>
   ```

## 📚 Design Patterns Used

1. **Repository Pattern:** Database logic separated into route files
2. **Middleware Pattern:** Express middleware pipeline
3. **Factory Pattern:** Connection pool creation
4. **MVC:** Model (database) - View (Nuxt) - Controller (API routes)
5. **Composition:** Vue Composition API for logic reuse

## 🧪 Testing Strategy (Future Enhancement)

**Recommended Testing Approach:**

1. **Unit Tests:** Test individual functions
   - API routes with mocked database
   - Vue composables
   - Utility functions

2. **Integration Tests:** Test service interactions
   - API with real test database
   - Frontend components with mocked API

3. **E2E Tests:** Test full user flows
   - Playwright or Cypress
   - Test against running Docker containers

## 🔮 Scalability Considerations

**Current Architecture:**
- Suitable for: Learning, small applications, MVPs
- User capacity: Hundreds of concurrent users

**To Scale Further:**

1. **Horizontal Scaling:**
   - Add load balancer (nginx, HAProxy)
   - Run multiple API instances
   - Use read replicas for databases

2. **Caching:**
   - Add Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

3. **Database:**
   - Implement database sharding
   - Use connection pooling tuning
   - Add caching layer

4. **Monitoring:**
   - Add logging (Winston, Pino)
   - Metrics (Prometheus)
   - Tracing (OpenTelemetry)

---

This architecture provides a solid foundation for learning full-stack development while being flexible enough to extend into production-ready applications.
