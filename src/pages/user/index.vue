<template>
  <div class="user-layout">
    <a-layout style="height: 100%; width: 100%">
      <!-- 左侧导航栏 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        width="200"
        class="sidebar"
        theme="light"
      >
        <div class="sidebar-content">
            <div class="sidebar-header">
              <MenuOutlined class="collapse-icon" @click="collapsed = !collapsed" />
              <span v-if="!collapsed" class="sidebar-title">图标logo</span>
            </div>
            <a-menu mode="inline" theme="light" :selected-keys="selectedKeys" class="sidebar-menu">
              <a-menu-item key="home" @click="onMenuClick('home', 'home')">
                <template #icon><HomeOutlined /></template>
                <span>首页</span>
              </a-menu-item>
              <a-menu-item key="service" @click="onMenuClick('service-market', 'service')">
                <template #icon><ShopOutlined /></template>
                <span>服务市场</span>
              </a-menu-item>
              <a-menu-item key="reward" @click="onMenuClick('demand-bounty', 'reward')">
                <template #icon><MoneyCollectOutlined /></template>
                <span>需求悬赏</span>
              </a-menu-item>
              <a-menu-item key="forum" @click="onMenuClick('tech-forum', 'forum')">
                <template #icon><CommentOutlined /></template>
                <span>技术论坛</span>
              </a-menu-item>
            </a-menu>
            <div class="sidebar-bottom">
              <a-menu mode="inline" theme="light" :selected-keys="selectedKeys" class="sidebar-menu">
                <a-menu-item key="subscribe" @click="onMenuClick('orders', 'subscribe')">
                  <template #icon><ShoppingCartOutlined /></template>
                  <span>订购</span>
                </a-menu-item>
                <a-menu-item key="follow" @click="onMenuClick('following', 'follow')">
                  <template #icon><StarOutlined /></template>
                  <span>关注</span>
                </a-menu-item>
                <a-menu-item key="collect" @click="onMenuClick('favorites', 'collect')">
                  <template #icon><HeartOutlined /></template>
                  <span>收藏</span>
                </a-menu-item>
                <a-menu-item key="history" @click="onMenuClick('history', 'history')">
                  <template #icon><HistoryOutlined /></template>
                  <span>历史</span>
                </a-menu-item>
                <a-menu-item key="profile" @click="onMenuClick('profile', 'profile')">
                  <template #icon><UserOutlined /></template>
                  <span>个人中心</span>
                </a-menu-item>
                <a-menu-item key="create" @click="onMenuClick('creator-center', 'create')">
                  <template #icon><EditOutlined /></template>
                  <span>创作中心</span>
                </a-menu-item>
              </a-menu>
            </div>
        </div>
      </a-layout-sider>

      <!-- 右侧主内容区域 -->
      <a-layout>
        <!-- 顶部导航栏 -->
        <a-layout-header class="header">
          <div class="header-left">
            <a-input-search
              v-model:value="searchValue"
              placeholder="小李想知道最新下载"
              style="width: 300px"
            />
            <div class="search-tags">
              <a-button :type="searchType === 'article' ? 'primary' : 'default'" size="small" @click="searchType = 'article'">搜索文章</a-button>
              <a-button :type="searchType === 'service' ? 'primary' : 'default'" size="small" @click="searchType = 'service'">搜索服务</a-button>
              <a-button :type="searchType === 'task' ? 'primary' : 'default'" size="small" @click="searchType = 'task'">发布任务</a-button>
            </div>
          </div>
          <div class="header-right">
            <a-popover placement="bottomRight" trigger="hover">
              <template #content>
                <div class="avatar-popup">
                  <div class="avatar-popup-header">
                    <a-avatar :size="48" style="background-color: #87d068">{{ username }}</a-avatar>
                    <div class="avatar-popup-info">
                      <div class="avatar-popup-name">{{ username }}</div>
                      <div class="avatar-popup-stats">
                        <span>粉丝 --</span>
                        <span>关注 141</span>
                        <span>获赞 --</span>
                      </div>
                    </div>
                  </div>
                  <div class="avatar-popup-menu">
                    <div class="avatar-popup-item" @click="onMenuClick('profile', 'profile')">
                      <EditOutlined /> 我的主页
                    </div>
                    <div class="avatar-popup-item" @click="onMenuClick('profile', 'profile')">
                      <UserOutlined /> 个人中心
                    </div>
                    <div class="avatar-popup-item"><SettingOutlined /> 内容管理</div>
                    <div class="avatar-popup-item"><WalletOutlined /> 会员中心</div>
                    <div class="avatar-popup-item"><SkinOutlined /> 已购内容</div>
                    <div class="avatar-popup-item"><FileTextOutlined /> 我的订单</div>
                    <div class="avatar-popup-item"><SettingOutlined /> 我的钱包</div>
                    <div class="avatar-popup-item" @click="handleLogout"><LogoutOutlined /> 退出</div>
                  </div>
                </div>
              </template>
              <a-avatar :size="36" style="background-color: #87d068; cursor: pointer">{{ username }}</a-avatar>
            </a-popover>
            <span class="header-username">个人中心</span>
            <span class="header-link" @click="handleLogout">消息</span>
            <a-popover placement="bottomRight" trigger="click" v-model:open="createPopoverVisible">
              <template #content>
                <div class="create-popup">
                  <div class="create-popup-title">创作下拉框</div>
                  <div class="create-box">
                    <div class="create-box-icons">
                      <div class="create-box-item" @click="createPopoverVisible = false; router.push('/user/write-article')"><EditOutlined class="create-box-icon" /><span>写文章</span></div>
                      <div class="create-box-item" @click="createPopoverVisible = false; router.push('/user/my-services')"><CodeOutlined class="create-box-icon" /><span>我的服务</span></div>
                      <div class="create-box-item" @click="createPopoverVisible = false; router.push('/user/my-demands')"><FileTextOutlined class="create-box-icon" /><span>我的悬赏</span></div>
                      <div class="create-box-item" @click="createPopoverVisible = false; router.push('/user/my-forum')"><CommentOutlined class="create-box-icon" /><span>我的论坛</span></div>
                      <div class="create-box-item" @click="createPopoverVisible = false; router.push('/user/order-manage')"><LockOutlined class="create-box-icon" /><span>订单管理</span></div>
                    </div>
                    <div class="create-box-footer" @click="createPopoverVisible = false; onMenuClick('creator-center', 'create')">
                      <BulbOutlined /> 进入创作中心 >
                    </div>
                  </div>
                </div>
              </template>
              <a-button type="primary" class="create-btn"><PlusOutlined /> 创作</a-button>
            </a-popover>
          </div>
        </a-layout-header>

        <!-- 子页面内容区 -->
        <a-layout-content class="main-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>

    <!-- 详情全屏覆盖层 -->
    <div v-if="detailVisible" class="detail-overlay">
      <div class="detail-overlay-header">
        <CloseOutlined class="detail-close-btn" @click="closeDetail" />
      </div>
      <div class="detail-overlay-body">
        <component :is="detailComponent" v-bind="detailProps" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide, shallowRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HomeOutlined, ShopOutlined, MoneyCollectOutlined, CommentOutlined,
  QuestionCircleOutlined, ShoppingCartOutlined, StarOutlined, HeartOutlined,
  HistoryOutlined, UserOutlined, EditOutlined, PlusOutlined,
  LogoutOutlined, SettingOutlined, WalletOutlined, SkinOutlined, FileTextOutlined,
  MenuOutlined, CodeOutlined, LockOutlined, BulbOutlined, CloseOutlined
} from '@ant-design/icons-vue'
import ServiceDetail from './service-detail.vue'
import DemandDetail from './demand-detail.vue'
import ForumDetail from './forum-detail.vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const searchValue = ref('')
const searchType = ref('article')
const selectedKeys = ref(['home'])
const createPopoverVisible = ref(false)
const username = ref('')

// 详情覆盖层
const detailVisible = ref(false)
const detailComponent = shallowRef(null)
const detailProps = ref({})

const openDetail = (type, props = {}) => {
  const map = { service: ServiceDetail, demand: DemandDetail, forum: ForumDetail }
  detailComponent.value = map[type]
  detailProps.value = props
  detailVisible.value = true
}
const closeDetail = () => {
  detailVisible.value = false
  detailComponent.value = null
  detailProps.value = {}
}

provide('openDetail', openDetail)
provide('closeDetail', closeDetail)

// 根据当前路由设置选中菜单
const routeKeyMap = {
  'home': 'home',
  'service-market': 'service',
  'demand-bounty': 'reward',
  'tech-forum': 'forum',
  'orders': 'subscribe',
  'following': 'follow',
  'favorites': 'collect',
  'history': 'history',
  'profile': 'profile',
  'creator-center': 'create'
}

watch(() => route.path, (path) => {
  const segment = path.split('/').pop()
  if (routeKeyMap[segment]) {
    selectedKeys.value = [routeKeyMap[segment]]
  }
}, { immediate: true })

onMounted(() => {
  username.value = localStorage.getItem('username') || 'U'
})

const onMenuClick = (path, key) => {
  selectedKeys.value = [key]
  router.push('/user/' + path)
}

const handleLogout = () => {
  router.push('/logout')
}
</script>

<style scoped>
.user-layout {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  height: 100%;
  overflow: hidden;
}

.sidebar :deep(.ant-layout-sider-children) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.collapse-icon { font-size: 18px; cursor: pointer; color: #333; }
.sidebar-title { font-size: 15px; font-weight: 600; color: #333; }
.sidebar-menu { border-right: none; }

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  line-height: 56px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left { display: flex; align-items: center; gap: 8px; }
.search-tags { display: flex; gap: 8px; }
.header-right { display: flex; align-items: center; gap: 16px; }
.header-username { font-size: 13px; color: #666; cursor: pointer; }
.header-link { font-size: 13px; color: #999; cursor: pointer; }

.create-btn {
  background: #52c41a;
  border-color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
}
.create-btn:hover { background: #73d13d; border-color: #73d13d; }

.avatar-popup { width: 200px; }
.avatar-popup-header { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.avatar-popup-info { flex: 1; }
.avatar-popup-name { font-weight: 600; font-size: 14px; color: #333; }
.avatar-popup-stats { display: flex; gap: 12px; font-size: 11px; color: #999; margin-top: 4px; }
.avatar-popup-menu { padding-top: 8px; }
.avatar-popup-item { padding: 8px 0; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.avatar-popup-item:hover { color: #1890ff; }

.create-popup { width: 360px; }
.create-popup-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; }
.create-box { border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; }
.create-box-icons { display: flex; justify-content: space-around; padding: 20px 12px; }
.create-box-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; color: #666; }
.create-box-item:hover { color: #1890ff; }
.create-box-icon { font-size: 22px; }
.create-box-item span { font-size: 12px; }
.create-box-footer { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-top: 1px solid #f0f0f0; font-size: 13px; color: #666; cursor: pointer; }
.create-box-footer:hover { color: #1890ff; background: #fafafa; }

.main-content {
  background: #f5f5f5;
  padding: 16px;
  overflow-y: auto;
  height: calc(100% - 56px);
}

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.detail-overlay-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.detail-close-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.detail-close-btn:hover { color: #333; background: #f0f0f0; }

.detail-overlay-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}
</style>
