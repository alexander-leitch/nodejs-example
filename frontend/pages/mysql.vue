<!--
  MySQL Tasks Page
  
  This page demonstrates how to interact with a MySQL database through the API.
  It shows all CRUD operations (Create, Read, Update, Delete) with a real-time UI.
  
  Key concepts demonstrated:
  - Vue 3 Composition API with <script setup>
  - Reactive state management with ref()
  - API calls using fetch()
  - Form handling and validation
  - Error handling and loading states
  - Dynamic UI updates
-->

<template>
  <div class="container">
    <div class="page-header">
      <!-- Back button -->
      <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
      
      <h1>MySQL Task Manager</h1>
      <p class="text-muted">
        This example uses <strong>MySQL</strong> database. Notice how we use the <code>mysql2</code> library
        with <code>?</code> placeholders for parameterized queries.
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
    </div>
  </div>
</template>

<script setup>
/**
 * Vue 3 Composition API Setup
 * 
 * The Composition API provides better code organization and reusability.
 * ref() creates reactive references - when the value changes, Vue re-renders the component.
 */

// Import ref for reactive state
// Nuxt auto-imports common Vue utilities, so we don't need explicit imports
const { ref } = Vue || { ref: () => {} }; // Fallback for TypeScript

/**
 * Reactive State
 * 
 * Each ref() creates a reactive variable. Access the value with .value in script,
 * but Vue automatically unwraps refs in the template.
 */

// Task list from the database
const tasks = ref([]);

// Loading and error states for better UX
const loading = ref(false);
const error = ref(null);

// Form state for creating new tasks
const newTask = ref({
  title: '',
  description: '',
  status: 'pending'
});

// State for tracking which task is being edited
const editingId = ref(null);
const editForm = ref({});

// Loading state for create operation
const creating = ref(false);

/**
 * API Base URL
 * 
 * Get the API base URL from runtime config
 * This is set in nuxt.config.ts and can be overridden with environment variables
 */
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

/**
 * API Functions
 * 
 * These functions handle all communication with the backend API
 * They use the Fetch API which is built into modern browsers
 */

/**
 * Load all tasks from the database
 */
async function loadTasks() {
  loading.value = true;
  error.value = null;
  
  try {
    // Make GET request to the API
    // The /api prefix is proxied to the backend in development
    const response = await fetch(`${apiBase}/api/mysql/tasks`);
    
    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    const result = await response.json();
    
    // Update the tasks array
    // The .value is needed to access/modify ref values in script
    tasks.value = result.data || [];
  } catch (err) {
    console.error('Error loading tasks:', err);
    error.value = 'Failed to load tasks. Make sure the API server is running.';
  } finally {
    loading.value = false;
  }
}

/**
 * Create a new task
 */
async function createTask() {
  // Validate the form
  if (!newTask.value.title.trim()) {
    alert('Please enter a task title');
    return;
  }
  
  creating.value = true;
  error.value = null;
  
  try {
    // Make POST request with JSON body
    const response = await fetch(`${apiBase}/api/mysql/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Convert the JavaScript object to JSON string
      body: JSON.stringify(newTask.value)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Add the new task to the beginning of the list
    tasks.value.unshift(result.data);
    
    // Reset the form
    newTask.value = {
      title: '',
      description: '',
      status: 'pending'
    };
    
    // Show success feedback
    alert('Task created successfully!');
  } catch (err) {
    console.error('Error creating task:', err);
    error.value = 'Failed to create task';
  } finally {
    creating.value = false;
  }
}

/**
 * Start editing a task
 * This populates the edit form and shows it
 */
function startEdit(task) {
  editingId.value = task.id;
  // Create a copy of the task for editing
  // This prevents modifying the original until we save
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
 * Update an existing task
 */
async function updateTask(id) {
  try {
    // Make PUT request to update the task
    const response = await fetch(`${apiBase}/api/mysql/tasks/${id}`, {
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
    
    // Update the task in the local array
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value[index] = result.data;
    }
    
    // Close the edit form
    cancelEdit();
    
    alert('Task updated successfully!');
  } catch (err) {
    console.error('Error updating task:', err);
    error.value = 'Failed to update task';
  }
}

/**
 * Delete a task
 */
async function deleteTask(id) {
  // Confirm before deleting
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    // Make DELETE request
    const response = await fetch(`${apiBase}/api/mysql/tasks/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Remove the task from the local array
    // filter() creates a new array without the deleted task
    tasks.value = tasks.value.filter(t => t.id !== id);
    
    alert('Task deleted successfully!');
  } catch (err) {
    console.error('Error deleting task:', err);
    error.value = 'Failed to delete task';
  }
}

/**
 * Helper Functions
 * 
 * These functions format data for display
 */

function formatStatus(status) {
  // Convert 'in_progress' to 'In Progress'
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getStatusClass(status) {
  // Return appropriate CSS class for each status
  const classes = {
    'pending': 'badge-warning',
    'in_progress': 'badge-primary',
    'completed': 'badge-success'
  };
  return classes[status] || '';
}

function formatDate(dateString) {
  // Format ISO date string to readable format
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Lifecycle: Load tasks when component mounts
 * 
 * onMounted() is a Vue lifecycle hook that runs after the component is added to the DOM
 */
onMounted(() => {
  loadTasks();
});

// Set page metadata
useHead({
  title: 'MySQL Example - Node.js Database Example'
});
</script>

<style scoped>
/* Page-specific styles */

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

/* Loading and Error States */
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

/* Form Styles */
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

/* Tasks Grid */
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

/* Edit Form */
.edit-form .form-group {
  margin-bottom: var(--space-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
