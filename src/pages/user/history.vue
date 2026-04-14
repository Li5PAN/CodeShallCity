<template>
  <div class="history-page">
    <h2 class="page-title">浏览历史</h2>

    <a-tabs v-model:activeKey="activeTab" class="history-tabs">
      <!-- 服务市场 -->
      <a-tab-pane key="service" tab="服务市场">
        <div class="history-list">
          <div v-if="paginatedServiceItems.length === 0" class="empty-state">暂无浏览记录</div>
          <div
            class="history-item"
            v-for="item in paginatedServiceItems"
            :key="item.id"
            @click="goDetail('service', item.id)"
          >
            <img :src="item.cover" class="history-cover" />
            <div class="history-info">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-desc">{{ item.desc }}</div>
              <div class="history-meta">
                <a-tag v-for="tag in item.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
              </div>
              <div class="history-seller">
                <a-avatar :size="14" :style="{ backgroundColor: item.sellerColor }">{{ item.sellerName[0] }}</a-avatar>
                <span class="seller-name">{{ item.sellerName }}</span>
                <span class="seller-orders">{{ item.sellerOrders }}+成交</span>
              </div>
            </div>
            <div class="history-right">
              <div class="history-price">¥ {{ item.price }}</div>
              <div class="history-sales">{{ item.sales }}+ 成交</div>
              <div class="history-time">{{ item.viewTime }}</div>
            </div>
          </div>
        </div>
        <div class="pagination-wrapper" v-if="serviceItems.length > 0">
          <a-pagination
            v-model:current="serviceCurrentPage"
            v-model:pageSize="servicePageSize"
            :total="serviceItems.length"
            show-size-changer
            :page-size-options="['5', '10', '15']"
            :default-page-size="10"
          />
        </div>
      </a-tab-pane>

      <!-- 需求悬赏 -->
      <a-tab-pane key="demand" tab="需求悬赏">
        <div class="history-list">
          <div v-if="paginatedDemandItems.length === 0" class="empty-state">暂无浏览记录</div>
          <div
            class="history-item"
            v-for="item in paginatedDemandItems"
            :key="item.id"
            @click="goDetail('demand', item.id)"
          >
            <div class="history-info">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-desc">{{ item.desc }}</div>
              <div class="history-meta">
                <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                <a-tag size="small" :color="getUrgencyColor(item.urgency)">{{ item.urgency }}</a-tag>
              </div>
              <div class="history-demand-meta">
                <span class="history-time-inline">发布时间：{{ item.publishTime }}</span>
                <span class="history-stat"><UserOutlined /> {{ item.applyCount }}人报名</span>
                <span class="history-time-inline">截止：{{ item.deadline }}</span>
              </div>
            </div>
            <div class="history-right">
              <div class="history-price">¥ {{ item.budgetMin }} ~ {{ item.budgetMax }}</div>
              <div class="history-time">{{ item.viewTime }}</div>
            </div>
          </div>
        </div>
        <div class="pagination-wrapper" v-if="demandItems.length > 0">
          <a-pagination
            v-model:current="demandCurrentPage"
            v-model:pageSize="demandPageSize"
            :total="demandItems.length"
            show-size-changer
            :page-size-options="['5', '7', '10']"
            :default-page-size="7"
          />
        </div>
      </a-tab-pane>

      <!-- 技术论坛 -->
      <a-tab-pane key="forum" tab="技术论坛">
        <div class="history-list">
          <div v-if="paginatedForumItems.length === 0" class="empty-state">暂无浏览记录</div>
          <div
            class="history-item"
            v-for="item in paginatedForumItems"
            :key="item.id"
            @click="goDetail('forum', item.id)"
          >
            <img v-if="item.cover" :src="item.cover" class="history-cover-forum" />
            <div class="history-info">
              <div class="history-author-row">
                <a-avatar :size="20" :style="{ backgroundColor: item.authorColor }">{{ item.author[0] }}</a-avatar>
                <span class="history-author">{{ item.author }}</span>
                <span class="history-time-inline">{{ item.publishTime }}</span>
              </div>
              <div class="history-title">{{ item.title }}</div>
              <div class="history-desc">{{ item.desc }}</div>
              <div class="history-meta">
                <a-tag size="small" :color="item.tagColor">{{ item.category }}</a-tag>
                <span class="history-stat"><EyeOutlined /> {{ item.readCount }}</span>
                <span class="history-stat"><LikeOutlined /> {{ item.likeCount }}</span>
                <span class="history-stat"><StarOutlined /> {{ item.collectCount }}</span>
              </div>
            </div>
            <div class="history-right">
              <div class="history-time">{{ item.viewTime }}</div>
            </div>
          </div>
        </div>
        <div class="pagination-wrapper" v-if="forumItems.length > 0">
          <a-pagination
            v-model:current="forumCurrentPage"
            v-model:pageSize="forumPageSize"
            :total="forumItems.length"
            show-size-changer
            :page-size-options="['5', '10']"
            :default-page-size="5"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EyeOutlined, LikeOutlined, StarOutlined, UserOutlined } from '@ant-design/icons-vue'
import { getHistoryList } from '@/service/user/uhistory'

const router = useRouter()
const activeTab = ref('service')
const loading = ref(false)

// 服务市场分页
const serviceCurrentPage = ref(1)
const servicePageSize = ref(10)
const paginatedServiceItems = computed(() => {
  const start = (serviceCurrentPage.value - 1) * servicePageSize.value
  const end = start + servicePageSize.value
  return serviceItems.value.slice(start, end)
})

// 需求悬赏分页
const demandCurrentPage = ref(1)
const demandPageSize = ref(7)
const paginatedDemandItems = computed(() => {
  const start = (demandCurrentPage.value - 1) * demandPageSize.value
  const end = start + demandPageSize.value
  return demandItems.value.slice(start, end)
})

// 技术论坛分页
const forumCurrentPage = ref(1)
const forumPageSize = ref(5)
const paginatedForumItems = computed(() => {
  const start = (forumCurrentPage.value - 1) * forumPageSize.value
  const end = start + forumPageSize.value
  return forumItems.value.slice(start, end)
})

const getUrgencyColor = (urgency) => {
  const colorMap = { '紧急': 'orange', '一般': 'blue', '常规': 'default' }
  return colorMap[urgency] || 'default'
}

const goDetail = (type, id) => {
  const routeMap = {
    service: 'ServiceDetail',
    demand: 'DemandDetail',
    forum: 'ForumDetail'
  }
  router.push({ name: routeMap[type], params: { id } })
}

// 数据列表
const serviceItems = ref([])
const demandItems = ref([])
const forumItems = ref([])

// 格式化时间显示
const formatTime = (dateTimeStr) => {
  const now = new Date()
  const date = new Date(dateTimeStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toISOString().split('T')[0]
}

// 获取浏览历史数据
const fetchHistoryList = async () => {
  loading.value = true
  try {
    // 获取服务市场浏览历史 (GOODS)
    const goodsRes = await getHistoryList({ targetType: 'GOODS', pageNo: 1, pageSize: 100 })
    if (goodsRes.code === 0 && goodsRes.data) {
      serviceItems.value = goodsRes.data.map(item => ({
        id: item.targetId,
        title: item.goodsTitle,
        desc: item.goodsDescription,
        price: item.price || 0,
        sales: 0,
        cover: item.coverImage,
        tags: ['平台保障'],
        sellerName: '商家',
        sellerOrders: 0,
        sellerColor: '#1890ff',
        viewTime: item.createTime ? formatTime(item.createTime) : ''
      }))
    }

    // 获取需求悬赏浏览历史 (DEMAND)
    const demandRes = await getHistoryList({ targetType: 'DEMAND', pageNo: 1, pageSize: 100 })
    if (demandRes.code === 0 && demandRes.data) {
      demandItems.value = demandRes.data.map(item => ({
        id: item.targetId,
        title: item.demandTitle,
        desc: item.demandDescription,
        type: item.categoryName || '其他',
        urgency: '一般',
        budgetMin: item.budgetMin || 0,
        budgetMax: item.budgetMax || 0,
        applyCount: 0,
        deadline: '',
        viewTime: item.createTime ? formatTime(item.createTime) : ''
      }))
    }

    // 获取技术论坛浏览历史 (POST)
    const postRes = await getHistoryList({ targetType: 'POST', pageNo: 1, pageSize: 100 })
    if (postRes.code === 0 && postRes.data) {
      forumItems.value = postRes.data.map(item => ({
        id: item.targetId,
        author: item.userName || '匿名用户',
        authorColor: '#1890ff',
        title: item.postTitle,
        desc: item.postContent,
        category: item.postCategoryName || '未分类',
        tagColor: 'blue',
        publishTime: item.createTime ? item.createTime.split('T')[0] : '',
        readCount: item.viewCount ? String(item.viewCount) : '0',
        likeCount: item.likeCount || 0,
        collectCount: 0,
        cover: item.coverImage || '',
        viewTime: item.createTime ? formatTime(item.createTime) : ''
      }))
    }
  } catch (error) {
    console.error('获取浏览历史失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchHistoryList()
})
</script>

<style scoped>
.history-page { width: 100%; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 16px; }

.history-tabs :deep(.ant-tabs-nav) { background: #fff; border-radius: 8px 8px 0 0; padding: 0 16px; margin-bottom: 0; }
.history-tabs :deep(.ant-tabs-content-holder) { background: #fff; border-radius: 0 0 8px 8px; padding: 0 0 8px; }

.history-list { display: flex; flex-direction: column; }
.empty-state { padding: 48px; text-align: center; color: #ccc; font-size: 14px; }

.history-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.history-item:last-child { border-bottom: none; }
.history-item:hover { background: #fafafa; }

.history-cover { width: 120px; height: 90px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.history-cover-forum { width: 100px; height: 75px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.history-info { flex: 1; min-width: 0; }
.history-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-item:hover .history-title { color: #1890ff; }
.history-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.history-time-inline { font-size: 12px; color: #ccc; }
.history-stat { font-size: 12px; color: #bbb; display: flex; align-items: center; gap: 3px; }

.history-author-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.history-author { font-size: 13px; font-weight: 600; color: #555; }

.history-seller { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #f0f0f0; }
.seller-name { font-size: 12px; color: #555; }
.seller-orders { font-size: 11px; color: #999; margin-left: 8px; }

.history-demand-meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; }

.history-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.history-price { font-size: 18px; font-weight: 700; color: #ff4d4f; }
.history-sales { font-size: 12px; color: #999; }
.history-time { font-size: 12px; color: #bbb; white-space: nowrap; }
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 20px 16px; border-top: 1px solid #f5f5f5; }
</style>
