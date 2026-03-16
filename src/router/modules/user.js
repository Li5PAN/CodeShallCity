export default [
  {
    path: "/user",
    name: "User",
    component: () => import("../../pages/user/index.vue"),
    redirect: "/user/home",
    meta: {
      requiresAuth: true,
      role: "user",
    },
    children: [
      {
        path: "home",
        name: "UserHome",
        component: () => import("../../pages/user/home.vue"),
        meta: {
          title: "首页",
          icon: "HomeOutlined",
        },
      },
      {
        path: "service-market",
        name: "ServiceMarket",
        component: () => import("../../pages/user/service-market.vue"),
        meta: {
          title: "服务市场",
          icon: "ShopOutlined",
        },
      },
      {
        path: "service-detail/:id",
        name: "ServiceDetail",
        component: () => import("../../pages/user/service-detail.vue"),
        meta: {
          title: "服务详情",
          icon: "ShopOutlined",
        },
      },
      {
        path: "demand-detail/:id",
        name: "DemandDetail",
        component: () => import("../../pages/user/demand-detail.vue"),
        meta: { title: "需求详情" },
      },
      {
        path: "demand-bounty",
        name: "DemandBounty",
        component: () => import("../../pages/user/demand-bounty.vue"),
        meta: {
          title: "需求悬赏",
          icon: "TrophyOutlined",
        },
      },
      {
        path: "forum-detail/:id",
        name: "ForumDetail",
        component: () => import("../../pages/user/forum-detail.vue"),
        meta: { title: "文章详情" },
      },
      {
        path: "my-forum-detail/:id",
        name: "MyForumDetail",
        component: () => import("../../pages/user/my-forum-detail.vue"),
        meta: { title: "我的文章详情" },
      },
      {
        path: "tech-forum",
        name: "TechForum",
        component: () => import("../../pages/user/tech-forum.vue"),
        meta: {
          title: "技术论坛",
          icon: "CommentOutlined",
        },
      },
      {
        path: "orders",
        name: "Orders",
        component: () => import("../../pages/user/orders.vue"),
        meta: {
          title: "订单",
          icon: "ShoppingCartOutlined",
        },
      },
      {
        path: "following",
        name: "Following",
        component: () => import("../../pages/user/following.vue"),
        meta: {
          title: "关注",
          icon: "StarOutlined",
        },
      },
      {
        path: "favorites",
        name: "Favorites",
        component: () => import("../../pages/user/favorites.vue"),
        meta: {
          title: "收藏",
          icon: "HeartOutlined",
        },
      },
      {
        path: "history",
        name: "History",
        component: () => import("../../pages/user/history.vue"),
        meta: {
          title: "历史",
          icon: "ClockCircleOutlined",
        },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("../../pages/user/profile.vue"),
        meta: {
          title: "个人中心",
          icon: "UserOutlined",
        },
      },
      {
        path: "creator-center",
        name: "CreatorCenter",
        component: () => import("../../pages/user/creator-center.vue"),
        meta: {
          title: "创作中心",
          icon: "EditOutlined",
        },
      },
      {
        path: "write-article",
        name: "WriteArticle",
        component: () => import("../../pages/user/write-article.vue"),
        meta: { title: "写文章", icon: "EditOutlined" },
      },
      {
        path: "my-services",
        name: "MyServices",
        component: () => import("../../pages/user/my-services.vue"),
        meta: { title: "我的服务", icon: "ShopOutlined" },
      },
      {
        path: "my-demands",
        name: "MyDemands",
        component: () => import("../../pages/user/my-demands.vue"),
        meta: { title: "我的需求", icon: "TrophyOutlined" },
      },
      {
        path: "my-demand-detail/:id",
        name: "MyDemandDetail",
        component: () => import("../../pages/user/my-demand-detail.vue"),
        meta: { title: "我的需求详情" },
      },
      {
        path: "my-forum",
        name: "MyForum",
        component: () => import("../../pages/user/my-forum.vue"),
        meta: { title: "我的论坛", icon: "CommentOutlined" },
      },
      {
        path: "order-detail/:id",
        name: "OrderDetail",
        component: () => import("../../pages/user/order-detail.vue"),
        meta: { title: "订单详情", icon: "ShoppingCartOutlined" },
      },
      {
        path: "order-manage",
        name: "OrderManage",
        component: () => import("../../pages/user/order-manage.vue"),
        meta: { title: "订单管理", icon: "ShoppingCartOutlined" },
      },
      {
        path: "messages",
        name: "Messages",
        component: () => import("../../pages/user/messages.vue"),
        meta: { title: "消息", icon: "MessageOutlined" },
      },
    ],
  },
];
