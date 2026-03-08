export default [
  {
    path: '/admin',
    component: () => import('../../pages/admin/index.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/home',
    children: [
      {
        path: 'home',
        name: 'AdminHome',
        component: () => import('../../pages/admin/home.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'user-management',
        name: 'AdminUserManagement',
        component: () => import('../../pages/admin/user-management.vue'),
        meta: { title: '用户与商品管理' }
      },
      {
        path: 'content-management',
        name: 'AdminContentManagement',
        component: () => import('../../pages/admin/content-management.vue'),
        meta: { title: '内容管理' }
      },
      {
        path: 'order-appeal',
        name: 'AdminOrderAppeal',
        component: () => import('../../pages/admin/order-appeal.vue'),
        meta: { title: '订单申诉' }
      },
      {
        path: 'system-management',
        name: 'AdminSystemManagement',
        component: () => import('../../pages/admin/system-management.vue'),
        meta: { title: '系统管理' }
      }
    ]
  }
]
