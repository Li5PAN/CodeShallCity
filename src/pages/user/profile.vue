<template>
  <div class="profile-page">
    <!-- 顶部个人信息卡片 -->
    <div class="profile-hero">
      <div class="profile-hero-left">
        <a-avatar :size="80" style="background-color: #52c41a; font-size: 32px; flex-shrink: 0">{{ username[0] }}</a-avatar>
        <div class="profile-hero-info">
          <div class="profile-name">{{ username }}</div>
          <div class="profile-bio">{{ bio }}</div>
          <div class="profile-tags">
            <a-tag color="green">Lv.{{ level }}</a-tag>
            <a-tag color="blue">{{ role }}</a-tag>
            <a-tag v-if="certified" color="gold">认证服务商</a-tag>
          </div>
        </div>
      </div>
      <div class="profile-hero-right">
        <div class="profile-stat" v-for="s in stats" :key="s.label">
          <div class="profile-stat-num">{{ s.value }}</div>
          <div class="profile-stat-label">{{ s.label }}</div>
        </div>
        <a-button type="primary" ghost size="small" @click="editVisible = true">编辑资料</a-button>
      </div>
    </div>

    <div class="profile-body">
      <!-- 左侧主内容 -->
      <div class="profile-main">
        <!-- 数据概览 -->
        <div class="profile-card">
          <div class="card-title">数据概览</div>
          <div class="overview-grid">
            <div class="overview-item" v-for="item in overview" :key="item.label">
              <component :is="item.icon" class="overview-icon" :style="{ color: item.color }" />
              <div class="overview-num">{{ item.value }}</div>
              <div class="overview-label">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <!-- 我的内容 tabs -->
        <div class="profile-card">
          <a-tabs v-model:activeKey="contentTab">
            <a-tab-pane key="article" tab="我的文章">
              <div class="content-list">
                <div class="content-item" v-for="item in myArticles" :key="item.id" @click="goForumDetail(item.id)">
                  <div class="content-item-info">
                    <div class="content-item-title">{{ item.title }}</div>
                    <div class="content-item-meta">
                      <span><EyeOutlined /> {{ item.readCount }}</span>
                      <span><LikeOutlined /> {{ item.likeCount }}</span>
                      <span><MessageOutlined /> {{ item.commentCount }}</span>
                      <span class="content-item-time">{{ item.publishTime }}</span>
                    </div>
                  </div>
                  <a-tag :color="item.status === '已发布' ? 'green' : 'orange'" size="small">{{ item.status }}</a-tag>
                </div>
                <div v-if="myArticles.length === 0" class="empty-state">暂无文章，去创作中心写一篇吧</div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="service" tab="我的服务">
              <div class="content-list">
                <div class="content-item" v-for="item in myServices" :key="item.id" @click="goServiceDetail(item.id)">
                  <img :src="item.cover" class="content-item-cover" />
                  <div class="content-item-info">
                    <div class="content-item-title">{{ item.title }}</div>
                    <div class="content-item-meta">
                      <span>订单 {{ item.orders }}</span>
                      <span>评分 {{ item.rating }}</span>
                      <span class="content-item-time">{{ item.updateTime }}</span>
                    </div>
                  </div>
                  <div class="content-item-price">¥ {{ item.price }}</div>
                </div>
                <div v-if="myServices.length === 0" class="empty-state">暂无服务，去创作中心发布吧</div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="demand" tab="我的悬赏">
              <div class="content-list">
                <div class="content-item" v-for="item in myDemands" :key="item.id" @click="goDemandDetail(item.id)">
                  <div class="content-item-info">
                    <div class="content-item-title">{{ item.title }}</div>
                    <div class="content-item-meta">
                      <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                      <span>报名 {{ item.applyCount }} 人</span>
                      <span class="content-item-time">{{ item.publishTime }}</span>
                    </div>
                  </div>
                  <div class="content-item-price">¥ {{ item.budget }}</div>
                </div>
                <div v-if="myDemands.length === 0" class="empty-state">暂无悬赏需求</div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="profile-side">
        <!-- 账户资产 -->
        <div class="profile-card">
          <div class="card-title">账户资产</div>
          <div class="asset-list">
            <div class="asset-item" v-for="a in assets" :key="a.label">
              <div class="asset-left">
                <component :is="a.icon" :style="{ color: a.color, fontSize: '18px' }" />
                <span class="asset-label">{{ a.label }}</span>
              </div>
              <span class="asset-value" :style="{ color: a.color }">{{ a.value }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷入口 -->
        <div class="profile-card">
          <div class="card-title">快捷入口</div>
          <div class="shortcut-grid">
            <div class="shortcut-item" v-for="s in shortcuts" :key="s.label" @click="s.action()">
              <component :is="s.icon" class="shortcut-icon" :style="{ color: s.color }" />
              <span>{{ s.label }}</span>
            </div>
          </div>
        </div>


      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <a-modal v-model:open="editVisible" title="编辑资料" @ok="saveProfile" ok-text="保存" cancel-text="取消">
      <a-form layout="vertical" style="margin-top: 8px">
        <a-form-item label="昵称">
          <a-input v-model:value="editForm.username" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea v-model:value="editForm.bio" :rows="3" placeholder="介绍一下自己" :maxlength="100" show-count />
        </a-form-item>
        <a-form-item label="身份标签">
          <a-select v-model:value="editForm.role" style="width: 100%">
            <a-select-option value="开发者">开发者</a-select-option>
            <a-select-option value="设计师">设计师</a-select-option>
            <a-select-option value="产品经理">产品经理</a-select-option>
            <a-select-option value="学生">学生</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  EyeOutlined, LikeOutlined, MessageOutlined,
  FileTextOutlined, ShopOutlined, TrophyOutlined,
  ShoppingCartOutlined, HeartOutlined, HistoryOutlined,
  EditOutlined, WalletOutlined, StarOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const username = ref(localStorage.getItem('username') || '用户')
const bio = ref('热爱技术，专注于全栈开发与AI应用探索')
const level = ref(5)
const role = ref('开发者')
const certified = ref(true)
const editVisible = ref(false)
const contentTab = ref('article')

const editForm = reactive({
  username: username.value,
  bio: bio.value,
  role: role.value
})

const saveProfile = () => {
  username.value = editForm.username
  bio.value = editForm.bio
  role.value = editForm.role
  editVisible.value = false
}

const stats = ref([
  { label: '粉丝', value: '1.2k' },
  { label: '关注', value: 141 },
  { label: '获赞', value: '3.8k' },
  { label: '文章', value: 28 }
])

const overview = ref([
  { label: '总阅读量', value: '12.5k', color: '#1890ff', icon: EyeOutlined },
  { label: '总获赞', value: '3.8k', color: '#ff4d4f', icon: LikeOutlined },
  { label: '总评论', value: 286, color: '#52c41a', icon: MessageOutlined },
  { label: '发布文章', value: 28, color: '#722ed1', icon: FileTextOutlined },
  { label: '上架服务', value: 5, color: '#fa8c16', icon: ShopOutlined },
  { label: '悬赏需求', value: 3, color: '#13c2c2', icon: TrophyOutlined }
])

const assets = ref([
  { label: '账户余额', value: '¥ 1,280.00', color: '#ff4d4f', icon: WalletOutlined }
])

const shortcuts = [
  { label: '我的订单', icon: ShoppingCartOutlined, color: '#1890ff', action: () => router.push('/user/orders') },
  { label: '我的收藏', icon: HeartOutlined, color: '#ff4d4f', action: () => router.push('/user/favorites') },
  { label: '浏览历史', icon: HistoryOutlined, color: '#fa8c16', action: () => router.push('/user/history') },
  { label: '我的关注', icon: StarOutlined, color: '#52c41a', action: () => router.push('/user/following') },
  { label: '创作中心', icon: EditOutlined, color: '#722ed1', action: () => router.push('/user/creator-center') },
  { label: '服务市场', icon: ShopOutlined, color: '#13c2c2', action: () => router.push('/user/service-market') }
]



const myArticles = ref([
  { id: 1, title: '深入解析CPU调度：操作系统的核心资源分配机制', readCount: '1.5k', likeCount: 34, commentCount: 12, publishTime: '2026-02-27', status: '已发布' },
  { id: 2, title: 'Vue3 Composition API 最佳实践总结', readCount: '2.3k', likeCount: 67, commentCount: 23, publishTime: '2026-02-20', status: '已发布' },
  { id: 3, title: 'Docker容器化部署实战指南', readCount: '890', likeCount: 21, commentCount: 8, publishTime: '2026-02-15', status: '草稿' }
])

const myServices = ref([
  { id: 1, title: 'Java大厂面试课，一套搞定offer', price: 399, orders: 128, rating: '4.9', cover: 'https://placehold.co/60x45/FFD700/000000?text=Java', updateTime: '2026-02-25' },
  { id: 2, title: 'Vue3 + TypeScript 企业级实战', price: 299, orders: 86, rating: '4.8', cover: 'https://placehold.co/60x45/42b883/FFFFFF?text=Vue3', updateTime: '2026-02-18' }
])

const myDemands = ref([
  { id: 1, title: 'MiniMax-M2.1 智能客服系统开发', budget: '3800.00', type: '人工智能', applyCount: 12, publishTime: '2026-03-03' },
  { id: 2, title: 'React Native 跨平台移动端应用', budget: '12000.00', type: '移动开发', applyCount: 7, publishTime: '2026-02-28' }
])

const goForumDetail = (id) => router.push({ name: 'ForumDetail', params: { id } })
const goServiceDetail = (id) => router.push({ name: 'ServiceDetail', params: { id } })
const goDemandDetail = (id) => router.push({ name: 'DemandDetail', params: { id } })
</script>

<style scoped>
.profile-page { width: 100%; }

/* Hero */
.profile-hero { background: #fff; border-radius: 8px; padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.profile-hero-left { display: flex; align-items: center; gap: 20px; }
.profile-hero-info { display: flex; flex-direction: column; gap: 8px; }
.profile-name { font-size: 22px; font-weight: 700; color: #333; }
.profile-bio { font-size: 13px; color: #888; max-width: 400px; }
.profile-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.profile-hero-right { display: flex; align-items: center; gap: 28px; }
.profile-stat { text-align: center; cursor: pointer; }
.profile-stat-num { font-size: 20px; font-weight: 700; color: #333; }
.profile-stat-label { font-size: 12px; color: #999; margin-top: 2px; }

/* Layout */
.profile-body { display: flex; gap: 16px; }
.profile-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.profile-side { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

/* Card */
.profile-card { background: #fff; border-radius: 8px; padding: 16px 20px; }
.card-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 16px; }

/* Overview */
.overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.overview-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; background: #fafafa; border-radius: 8px; }
.overview-icon { font-size: 22px; }
.overview-num { font-size: 18px; font-weight: 700; color: #333; }
.overview-label { font-size: 12px; color: #999; }

/* Content list */
.content-list { display: flex; flex-direction: column; }
.empty-state { padding: 32px; text-align: center; color: #ccc; font-size: 14px; }
.content-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.content-item:last-child { border-bottom: none; }
.content-item:hover .content-item-title { color: #1890ff; }
.content-item-cover { width: 60px; height: 45px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
.content-item-info { flex: 1; min-width: 0; }
.content-item-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.content-item-meta { display: flex; align-items: center; gap: 14px; font-size: 12px; color: #bbb; }
.content-item-time { margin-left: auto; }
.content-item-price { font-size: 15px; font-weight: 700; color: #ff4d4f; flex-shrink: 0; }

/* Assets */
.asset-list { display: flex; flex-direction: column; gap: 12px; }
.asset-item { display: flex; justify-content: space-between; align-items: center; }
.asset-left { display: flex; align-items: center; gap: 8px; }
.asset-label { font-size: 13px; color: #555; }
.asset-value { font-size: 14px; font-weight: 600; }

/* Shortcuts */
.shortcut-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.shortcut-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; background: #fafafa; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 12px; color: #555; }
.shortcut-item:hover { background: #e6f7ff; color: #1890ff; }
.shortcut-icon { font-size: 20px; }


</style>
