import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'
import providerRoutes from './modules/provider'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...providerRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  
  // 如果访问的是需要认证的页面（检查当前路由及所有父路由的 meta）
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  const requiredRole = to.matched.find(r => r.meta.role)?.meta.role

  if (requiresAuth) {
    if (!token) {
      next('/login')
      return
    }
    if (requiredRole && requiredRole !== userRole) {
      next('/login')
      return
    }
  }
  
  // 如果已登录，访问登录页，则重定向到对应的首页
  if (to.path === '/login' && token) {
    if (userRole === 'user') {
      next('/user/home')
    } else if (userRole === 'provider') {
      next('/provider')
    } else if (userRole === 'admin') {
      next('/admin')
    } else {
      next()
    }
    return
  }
  
  next()
})

export default router
