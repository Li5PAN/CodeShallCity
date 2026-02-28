export default [
  {
    path: '/user',
    name: 'User',
    component: () => import('../../pages/user/index.vue'),
    redirect: '/user/home',
    meta: {
      requiresAuth: true,
      role: 'user'
    },
    children: [
      {
        path: 'home',
        name: 'UserHome',
        component: () => import('../../pages/user/home.vue'),
        meta: {
          title: '首页',
          icon: 'HomeOutlined'
        }
      },
      {
        path: 'service-market',
        name: 'ServiceMarket',
        component: () => import('../../pages/user/service-market.vue'),
        meta: {
          title: '服务市场',
          icon: 'ShopOutlined'
        }
      },
      {
        path: 'service-detail/:id',
        name: 'ServiceDetail',
        component: () => import('../../pages/user/service-detail.vue'),
        meta: {
          title: '服务详情',
          icon: 'ShopOutlined'
        }
      },
      {
        path: 'demand-detail/:id',
        name: 'DemandDetail',
        component: () => import('../../pages/user/demand-detail.vue'),
        meta: { title: '需求详情' }
      },
      {
        path: 'demand-bounty',
        name: 'DemandBounty',
        component: () => import('../../pages/user/demand-bounty.vue'),
        meta: {
          title: '需求悬赏',
          icon: 'TrophyOutlined'
        }
      },
      {
        path: 'tech-forum',
        name: 'TechForum',
        component: () => import('../../pages/user/tech-forum.vue'),
        meta: {
          title: '技术论坛',
          icon: 'CommentOutlined'
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../../pages/user/orders.vue'),
        meta: {
          title: '订购',
          icon: 'ShoppingCartOutlined'
        }
      },
      {
        path: 'following',
        name: 'Following',
        component: () => import('../../pages/user/following.vue'),
        meta: {
          title: '关注',
          icon: 'StarOutlined'
        }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('../../pages/user/favorites.vue'),
        meta: {
          title: '收藏',
          icon: 'HeartOutlined'
        }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('../../pages/user/history.vue'),
        meta: {
          title: '历史',
          icon: 'ClockCircleOutlined'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../../pages/user/profile.vue'),
        meta: {
          title: '个人中心',
          icon: 'UserOutlined'
        }
      },
      {
        path: 'creator-center',
        name: 'CreatorCenter',
        component: () => import('../../pages/user/creator-center.vue'),
        meta: {
          title: '创作中心',
          icon: 'EditOutlined'
        }
      }
    ]
  }
]
