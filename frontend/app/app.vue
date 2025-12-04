<!--
  App.vue - Root Application Component
  
  This is the root component of the Nuxt application.
  NuxtPage is where page components from the pages/ directory are rendered.
  
  In Nuxt, you don't need to manually set up routing - it's file-based.
  Each .vue file in pages/ becomes a route automatically.
-->

<template>
  <div id="app">
    <!-- NuxtPage renders the current page based on the route -->
    <NuxtPage />
  </div>
</template>

<script setup>
/**
 * App Setup
 * 
 * Using Vue 3 Composition API with <script setup>
 * This is the recommended way to write Vue components in Nuxt 3
 * 
 * We don't need much here since Nuxt handles most of the app setup
 */
</script>

<style>
/* 
 * Global styles are imported via nuxt.config.ts
 * Any additional global styles can go here
 */

#app {
  min-height: 100vh;
}
</style>
