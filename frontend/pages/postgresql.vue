<!--
  PostgreSQL Tasks Page
  
  This page demonstrates how to interact with a PostgreSQL database through the API.
  It's very similar to the MySQL page, but highlights PostgreSQL-specific differences.
  
  Key PostgreSQL differences:
  - Uses $1, $2 syntax for parameterized queries (vs MySQL's ?)
  - RETURNING clause to get inserted/updated rows in one query
  - Custom ENUM types for status field
  - Triggers for automatic timestamp updates
-->

<template>
  <div class="container">
    <div class="page-header">
      <!-- Back button -->
      <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
      
      <h1>PostgreSQL Task Manager</h1>
      <p class="text-muted">
        This example uses <strong>PostgreSQL</strong> database. Notice how we use the <code>pg</code> library
        with <code>$1, $2</code> placeholders and the <code>RETURNING</code> clause for efficient queries.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- Main Content -->
    <div v-if="!loading" class="content-wrapper">
      <!-- Create New Task Form -->
      <section class="card mb-lg">
        <h2>Create New Task</h2>
        <form @submit.prevent="createTask" class="task-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label" for="title">Title *</label>
              <input
                id="title"
                v-model="newTask.title"
                type="text"
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="status">Status</label>
              <select id="status" v-model="newTask.status">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="description">Description</label>
            <textarea
              id="description"
              v-model="newTask.description"
              rows="3"
              placeholder="Enter task description (optional)"
            ></textarea>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="creating">
            <span v-if="creating" class="spinner"></span>
            {{ creating ? 'Creating...' : 'Create Task' }}
          </button>
        </form>
      </section>

      <!-- Tasks List -->
      <section>
        <div class="flex justify-between items-center mb-md">
          <h2>Tasks ({{ tasks.length }})</h2>
          <button @click="loadTasks" class="btn" :disabled="loading">
            {{ loading ? 'Refreshing...' : '🔄 Refresh' }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="tasks.length === 0" class="empty-state card">
          <p class="text-muted">No tasks yet. Create one above to get started!</p>
        </div>

        <!-- Tasks Grid -->
        <div v-else class="tasks-grid">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-card card"
          >
            <!-- Task Content (View Mode) -->
            <div v-if="editingId !== task.id">
              <div class="task-header">
                <h3>{{ task.title }}</h3>
                <span :class="['badge', getStatusClass(task.status)]">
                  {{ formatStatus(task.status) }}
                </span>
              </div>
              
              <p v-if="task.description" class="task-description text-muted">
                {{ task.description }}
              </p>
              
              <div class="task-meta text-sm text-muted">
                <span>ID: {{ task.id }}</span>
                <span>Created: {{ formatDate(task.created_at) }}</span>
                <span>Updated: {{ formatDate(task.updated_at) }}</span>
              </div>

              <div class="task-actions">
                <button @click="startEdit(task)" class="btn btn-sm">
                  ✏️ Edit
                </button>
                <button @click="deleteTask(task.id)" class="btn btn-sm btn-danger">
                  🗑️ Delete
                </button>
              </div>
            </div>

            <!-- Task Content (Edit Mode) -->
            <form v-else @submit.prevent="updateTask(task.id)" class="edit-form">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input v-model="editForm.title" type="text" required />
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="editForm.description" rows="2"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="editForm.status">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div class="task-actions">
                <button type="submit" class="btn btn-sm btn-success">
                  ✓ Save
                </button>
                <button type="button" @click="cancelEdit" class="btn btn-sm">
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- PostgreSQL-specific Information -->
      <aside class="info-box mt-2xl">
        <h3>💡 PostgreSQL Features Demonstrated</h3>
        <ul>
          <li>
            <strong>Parameterized Queries:</strong> Uses <code>$1</code>, <code>$2</code> syntax instead of <code>?</code>
          </li>
          <li>
            <strong>RETURNING Clause:</strong> Gets inserted/updated rows in a single query, more efficient than MySQL's separate SELECT
          </li>
          <li>
            <strong>Custom ENUM Type:</strong> <code>task_status</code> type defined in the database schema
          </li>
          <li>
            <strong>Triggers:</strong> Automatic <code>updated_at</code> timestamp updates using database triggers
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
/**
 * PostgreSQL Tasks Page Script
 * 
 * This script is nearly identical to the MySQL page,
 * demonstrating that the frontend code doesn't need to change
 * when switching databases - the API abstracts the differences.
 * 
 * The only difference is the API endpoint we call:
 * /api/postgresql/tasks instead of /api/mysql/tasks
 */

// Reactive state - same as MySQL page
const tasks = ref([]);
const loading = ref(false);
const error = ref(null);
const newTask = ref({
  title: '',
  description: '',
  status: 'pending'
});
const editingId = ref(null);
const editForm = ref({});
const creating = ref(false);

// Get API base URL from config
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

/**
 * Load all tasks from PostgreSQL database
 * 
 * Notice this is the exact same logic as the MySQL page,
 * just with a different endpoint URL
 */
async function loadTasks() {
  loading.value = true;
  error.value = null;
  
  try {
    // The ONLY difference: /api/postgresql/tasks instead of /api/mysql/tasks
    const response = await fetch(`${apiBase}/api/postgresql/tasks`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    tasks.value = result.data || [];
  } catch (err) {
    console.error('Error loading tasks:', err);
    error.value = 'Failed to load tasks. Make sure the API server is running.';
  } finally {
    loading.value = false;
  }
}

/**
 * Create a new task in PostgreSQL
 */
async function createTask() {
  if (!newTask.value.title.trim()) {
    alert('Please enter a task title');
    return;
  }
  
  creating.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`${apiBase}/api/postgresql/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask.value)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Add the new task to the list
    tasks.value.unshift(result.data);
    
    // Reset form
    newTask.value = {
      title: '',
      description: '',
      status: 'pending'
    };
    
    alert('Task created successfully!');
  } catch (err) {
    console.error('Error creating task:', err);
    error.value = err.message || 'Failed to create task';
  } finally {
    creating.value = false;
  }
}

/**
 * Start editing a task
 */
function startEdit(task) {
  editingId.value = task.id;
  editForm.value = { ...task };
}

/**
 * Cancel editing
 */
function cancelEdit() {
  editingId.value = null;
  editForm.value = {};
}

/**
 * Update a task in PostgreSQL
 */
async function updateTask(id) {
  try {
    const response = await fetch(`${apiBase}/api/postgresql/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Update the task in the list
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value[index] = result.data;
    }
    
    cancelEdit();
    alert('Task updated successfully!');
  } catch (err) {
    console.error('Error updating task:', err);
    error.value = 'Failed to update task';
  }
}

/**
 * Delete a task from PostgreSQL
 */
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    const response = await fetch(`${apiBase}/api/postgresql/tasks/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Remove from list
    tasks.value = tasks.value.filter(t => t.id !== id);
    
    alert('Task deleted successfully!');
  } catch (err) {
    console.error('Error deleting task:', err);
    error.value = 'Failed to delete task';
  }
}

// Helper functions - same as MySQL page
function formatStatus(status) {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getStatusClass(status) {
  const classes = {
    'pending': 'badge-warning',
    'in_progress': 'badge-primary',
    'completed': 'badge-success'
  };
  return classes[status] || '';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Load tasks on mount
onMounted(() => {
  loadTasks();
});

// Set page metadata
useHead({
  title: 'PostgreSQL Example - Node.js Database Example'
});
</script>

<style scoped>
/* Same styles as MySQL page */

.page-header {
  margin-bottom: var(--space-2xl);
}

.back-link {
  display: inline-block;
  margin-bottom: var(--space-md);
  color: var(--color-primary);
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.back-link:hover {
  transform: translateX(-4px);
}

.page-header h1 {
  margin-bottom: var(--space-sm);
}

.page-header code {
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

.loading-container {
  text-align: center;
  padding: var(--space-2xl);
}

.error-message {
  background: hsla(0, 84%, 60%, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.task-form {
  margin-top: var(--space-md);
}

.form-row {
  display: flex;
  gap: var(--space-md);
}

.flex-1 {
  flex: 1;
}

.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.task-card {
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-sm);
  gap: var(--space-sm);
}

.task-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  flex: 1;
}

.task-description {
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--color-border);
  margin-bottom: var(--space-md);
}

.task-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
}

.task-actions button {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
}

.edit-form .form-group {
  margin-bottom: var(--space-sm);
}

/* PostgreSQL-specific info box */
.info-box {
  background: hsla(207, 71%, 45%, 0.05);
  border: 1px solid hsla(207, 71%, 45%, 0.3);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}

.info-box h3 {
  color: hsl(207, 71%, 45%);
  margin-bottom: var(--space-md);
}

.info-box ul {
  list-style: none;
  padding: 0;
}

.info-box li {
  margin-bottom: var(--space-sm);
  padding-left: var(--space-md);
  position: relative;
}

.info-box li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: hsl(207, 71%, 45%);
}

.info-box code {
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
