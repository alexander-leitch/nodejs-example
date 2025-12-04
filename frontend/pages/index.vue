<!--
  Index Page (Home Page)
  
  This is the landing page for the application.
  In Nuxt, pages/index.vue becomes the route "/"
  
  This page provides navigation to the MySQL and PostgreSQL examples
-->

<template>
  <div class="container">
    <main class="main-content">
      <!-- Header Section -->
      <header class="header">
        <h1>Node.js Database Example</h1>
        <p class="text-muted">
          A comprehensive example demonstrating Node.js with Express API, 
          Nuxt frontend, and dual database support (MySQL & PostgreSQL)
        </p>
      </header>

      <!-- Database Selection Cards -->
      <div class="grid grid-cols-2 gap-lg mt-lg">
        <!-- MySQL Card -->
        <NuxtLink to="/mysql" class="card db-card">
          <div class="db-icon mysql-icon">
            <!-- MySQL icon representation -->
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <h2>MySQL Example</h2>
          <p class="text-muted">
            Explore task management with MySQL. See how to perform CRUD operations
            using the mysql2 library with connection pooling.
          </p>
          <div class="card-arrow">→</div>
        </NuxtLink>

        <!-- PostgreSQL Card -->
        <NuxtLink to="/postgresql" class="card db-card">
          <div class="db-icon postgres-icon">
            <!-- PostgreSQL icon representation -->
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h2>PostgreSQL Example</h2>
          <p class="text-muted">
            Explore task management with PostgreSQL. Learn about PostgreSQL-specific
            features like the RETURNING clause and $1 parameterization.
          </p>
          <div class="card-arrow">→</div>
        </NuxtLink>
      </div>

      <!-- Features Section -->
      <section class="features mt-2xl">
        <h2 class="text-center">What You'll Learn</h2>
        <div class="grid grid-cols-2 gap-lg mt-lg">
          <div class="feature-card card">
            <h3>🔄 RESTful API</h3>
            <p class="text-muted text-sm">
              Full CRUD operations (Create, Read, Update, Delete) following REST conventions
            </p>
          </div>
          <div class="feature-card card">
            <h3>🗄️ Database Integration</h3>
            <p class="text-muted text-sm">
              Connection pooling, prepared statements, and transaction management
            </p>
          </div>
          <div class="feature-card card">
            <h3>🐳 Docker Compose</h3>
            <p class="text-muted text-sm">
              Multi-container setup with MySQL, PostgreSQL, API, and frontend
            </p>
          </div>
          <div class="feature-card card">
            <h3>📝 Extensive Comments</h3>
            <p class="text-muted text-sm">
              Every file includes detailed explanations to help you learn
            </p>
          </div>
        </div>
      </section>

      <!-- Documentation Link -->
      <footer class="footer text-center mt-2xl">
        <p class="text-muted">
          📚 See the README.md for complete documentation and setup instructions
        </p>
      </footer>
    </main>
  </div>
</template>

<script setup>
/**
 * Index Page Script
 * 
 * This page is purely presentational and doesn't need any logic.
 * We're using <script setup> which is Vue 3's recommended approach.
 * 
 * Nuxt auto-imports components like NuxtLink, so no imports needed!
 */

// Set page metadata using Nuxt's useHead composable
// This sets the page title and meta description for SEO
useHead({
  title: 'Home - Node.js Database Example',
  meta: [
    {
      name: 'description',
      content: 'Learn Node.js with practical examples using MySQL and PostgreSQL databases'
    }
  ]
});
</script>

<style scoped>
/**
 * Scoped Styles
 * 
 * Styles defined here only apply to this component
 * This prevents style conflicts between components
 */

.main-content {
  padding: var(--space-2xl) 0;
}

.header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.header h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

/* Database Selection Cards */
.db-card {
  position: relative;
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
}

.db-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.db-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.mysql-icon {
  color: hsl(206, 100%, 45%);
  background: hsla(206, 100%, 45%, 0.1);
}

.postgres-icon {
  color: hsl(207, 71%, 45%);
  background: hsla(207, 71%, 45%, 0.1);
}

.db-card h2 {
  margin-bottom: var(--space-sm);
}

.card-arrow {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  transition: transform var(--transition-base);
}

.db-card:hover .card-arrow {
  transform: translateX(4px);
}

/* Features Section */
.features h2 {
  margin-bottom: var(--space-lg);
}

.feature-card {
  text-align: center;
}

.feature-card h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-sm);
}

.footer {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header h1 {
    font-size: var(--font-size-xl);
  }
  
  .db-icon {
    width: 48px;
    height: 48px;
  }
  
  .db-icon svg {
    width: 32px;
    height: 32px;
  }
}
</style>
