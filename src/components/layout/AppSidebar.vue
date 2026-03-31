<template>
  <aside class="app-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-toggle" @click="appStore.toggleSidebar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </div>

    <nav class="sidebar-nav">
      <div
        v-for="item in menuItems"
        :key="item.path || item.action"
        class="nav-item"
        :class="{ active: isActive(item) }"
        @click="handleMenuClick(item)"
      >
        <el-tooltip
          :content="item.label"
          :placement="'right'"
          :disabled="!appStore.sidebarCollapsed"
          :show-after="300"
          effect="customized"
          :offset="8"
          popper-class="sidebar-tooltip"
        >
          <div class="nav-item-inner">
            <span class="nav-icon">
              <component :is="item.icon" :size="20" />
            </span>
            <span v-show="!appStore.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </div>
        </el-tooltip>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { LayoutGrid, PlusCircle } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const menuItems = [
  { path: '/', label: '我的模板', icon: LayoutGrid },
  { action: 'create', label: '创建模板', icon: PlusCircle },
]

const isActive = (item: typeof menuItems[0]) => {
  if ('path' in item) {
    if (item.path === '/') return route.path === '/'
    return route.path.startsWith(item.path!)
  }
  // action 项的活跃判断
  if (item.action === 'create') {
    return route.path.startsWith('/create')
  }
  return false
}

async function handleMenuClick(item: typeof menuItems[0]) {
  if ('path' in item) {
    router.push(item.path!)
  } else if (item.action === 'create') {
    router.push('/create')
  }
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-duration) ease;
  z-index: 90;
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: color 0.2s;
}

.sidebar-toggle:hover {
  color: var(--primary);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
}

.nav-item-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover .nav-item-inner {
  background: rgba(56, 189, 248, 0.08);
}

.nav-item.active .nav-item-inner {
  background: rgba(56, 189, 248, 0.15);
  box-shadow: inset 3px 0 0 var(--primary);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
  min-width: 20px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item.active .nav-label {
  color: var(--primary);
}
</style>

<style>
/* 自定义侧边栏提示框样式 */
.sidebar-tooltip {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

/* 深色模式增强 */
[data-theme="dark"] .sidebar-tooltip {
  background: rgba(30, 41, 59, 0.95) !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* 浅色模式增强 */
[data-theme="light"] .sidebar-tooltip {
  background: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(56, 189, 248, 0.2) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 箭头颜色适配 */
.sidebar-tooltip .el-popper__arrow::before {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-color) !important;
}

[data-theme="dark"] .sidebar-tooltip .el-popper__arrow::before {
  background: rgba(30, 41, 59, 0.95) !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
}

[data-theme="light"] .sidebar-tooltip .el-popper__arrow::before {
  background: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(56, 189, 248, 0.2) !important;
}

</style>
