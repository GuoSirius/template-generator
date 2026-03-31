<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  display: flex;
  flex: 1;
  padding-top: var(--header-height);
}

.app-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 24px;
  transition: margin-left var(--transition-duration) ease;
  min-height: calc(100vh - var(--header-height));
  overflow-y: auto;
}

.app-main.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}
</style>
