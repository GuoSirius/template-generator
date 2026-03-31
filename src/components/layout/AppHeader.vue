<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo" @click="$router.push('/')">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </div>
      <h1 class="app-title">Template Generator</h1>
    </div>
    <div class="header-right">
      <div class="theme-switcher">
        <button
          v-for="mode in themeModes"
          :key="mode.value"
          class="theme-btn"
          :class="{ active: themeMode === mode.value }"
          @click="setTheme(mode.value)"
          :title="mode.label"
        >
          <component :is="mode.icon" :size="18" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme } from '@/composables/use-theme'

const { themeMode, setTheme } = useTheme()

const themeModes = [
  { value: 'light' as const, label: '亮色', icon: Sun },
  { value: 'dark' as const, label: '暗色', icon: Moon },
  { value: 'system' as const, label: '跟随系统', icon: Monitor },
]
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(30, 41, 59, 0.85);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.logo:hover {
  transform: scale(1.1);
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), #22C55E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-switcher {
  display: flex;
  gap: 4px;
  background: var(--bg-tertiary);
  padding: 3px;
  border-radius: 10px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.theme-btn.active {
  color: #FFFFFF;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.4);
}
</style>
