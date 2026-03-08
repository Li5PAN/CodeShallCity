<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">⚙</span>
        <span class="logo-text">后台管理</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="nav-item--active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧主体 -->
    <div class="admin-main">
      <!-- 顶部导航 -->
      <header class="admin-header">
        <span class="header-title">{{ currentTitle }}</span>
        <div class="header-actions">
          <span class="admin-name">管理员</span>
          <router-link to="/logout" class="logout-btn">退出登录</router-link>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="admin-content">
        <router-view style="flex: 1; display: flex; flex-direction: column;" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/admin/home', label: '数据概览', icon: '📊' },
  { path: '/admin/user-management', label: '用户与商品管理', icon: '👥' },
  { path: '/admin/content-management', label: '内容管理', icon: '📝' },
  { path: '/admin/order-appeal', label: '订单申诉', icon: '⚖️' },
  { path: '/admin/system-management', label: '系统管理', icon: '🔧' }
]

const currentTitle = computed(() => route.meta?.title || '后台管理')
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

.admin-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.logo-icon { font-size: 22px; }
.logo-text { color: #1a1a2e; font-size: 16px; font-weight: 600; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #1a1a2e;
  background: #f5f5f5;
}

.nav-item--active {
  color: #4f46e5;
  background: #ede9fe;
  font-weight: 600;
}

.nav-icon { font-size: 16px; width: 20px; text-align: center; }

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.header-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name { font-size: 14px; color: #555; }

.logout-btn {
  font-size: 13px;
  color: #ef4444;
  text-decoration: none;
  padding: 4px 12px;
  border: 1px solid #ef4444;
  border-radius: 4px;
  transition: all 0.2s;
}

.logout-btn:hover { background: #ef4444; color: #fff; }

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}
</style>
