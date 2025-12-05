/**
 * Nuxt Configuration File
 * 
 * This file configures the Nuxt.js application.
 * Nuxt is a framework built on top of Vue.js that provides:
 * - Server-side rendering (SSR)
 * - File-based routing
 * - Auto-imports for components and composables
 * - Built-in development tools
 * 
 * Learn more: https://nuxt.com/docs/api/configuration/nuxt-config
 */

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable compatibility features for Nuxt 4
  compatibilityDate: '2024-11-01',

  // Enable Nuxt DevTools for better development experience
  // This provides a visual interface for debugging and understanding your app
  devtools: { enabled: true },

  /**
   * Runtime Configuration
   * 
   * These values can be overridden with environment variables
   * - public: Available on both server and client
   * - private: Only available on server (not included in the bundle)
   */
  runtimeConfig: {
    // Public config accessible via useRuntimeConfig().public
    public: {
      // API base URL - defaults to the backend API service in Docker
      // In development, this proxies to http://api:3001
      // In production, you'd set this to your actual API URL
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
    }
  },

  /**
   * Development Server Configuration
   */
  devServer: {
    // Port for the Nuxt dev server
    port: 3000,
    // Listen on all interfaces (required for Docker)
    host: '0.0.0.0'
  },

  /**
   * Vite Configuration
   * 
   * Nuxt uses Vite as its build tool
   * We can configure Vite-specific options here
   */
  vite: {
    server: {
      // Proxy API requests to the backend during development
      // This avoids CORS issues when running locally
      proxy: {
        '/api': {
          // Target is the backend API service
          // In Docker, 'api' is the service name
          // Locally, use localhost:3001
          target: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
          // Don't change the origin header
          changeOrigin: true,
          // Optionally rewrite the path (not needed here)
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  },

  /**
   * App Configuration
   */
  app: {
    head: {
      // Default page title
      title: 'Node.js Database Example',
      // Meta tags for SEO and responsiveness
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Example application demonstrating Node.js with MySQL and PostgreSQL'
        }
      ],
      // Link tags (e.g., for fonts or favicons)
      link: [
        // Google Fonts for better typography
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  /**
   * Global CSS
   * 
   * Import global stylesheets here
   * These will be included in every page
   * Use '~/assets/css/filename' to reference files in the assets directory
   */
  css: [
    // Global CSS with design system and utility classes
    // Using relative path for Docker compatibility
    './assets/css/main.css'
  ],
})
