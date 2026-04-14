<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>

    <a-tabs v-model:activeKey="activeTab" class="fav-tabs">
      <!-- 服务市场 -->
      <a-tab-pane key="service" tab="服务市场">
        <div class="fav-list">
          <div v-if="paginatedServiceItems.length === 0" class="empty-state">暂无收藏的服务</div>
          <div
            class="fav-item"
            v-for="item in paginatedServiceItems"
            :key="item.id"
            @click="openDetail('service', { id: item.id, from: 'favorites' })"
          >
            <img :src="item.cover" class="fav-cover" />
            <div class="fav-info">
              <div class="fav-title">{{ item.title }}</div>
              <div class="fav-desc">{{ item.desc }}</div>
              <div class="fav-meta">
                <a-tag v-for="tag in item.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
              </div>
              <div class="fav-seller">
                <a-avatar :size="16" :style="{ backgroundColor: item.sellerColor }">{{ item.sellerName[0] }}</a-avatar>
                <span class="seller-name">{{ item.sellerName }}</span>
                <span class="seller-orders">{{ item.sellerOrders }}单已完成</span>
              </div>
            </div>
            <div class="fav-right">
              <div class="fav-price">¥ {{ item.price }}</div>
              <div class="fav-sales">{{ item.sales }}+ 成交</div>
              <a-button size="small" danger @click.stop="removeItem(serviceItems, item.id)">取消收藏</a-button>
            </div>
          </div>
        </div>
        <div class="pagination-wrapper" v-if="serviceItems.length > 0">
          <a-pagination
            v-model:current="serviceCurrentPage"
            v-model:pageSize="servicePageSize"
            :total="serviceItems.length"
            show-size-changer
            :page-size-options="['5', '8', '10']"
            :default-page-size="8"
          />
        </div>
      </a-tab-pane>

      <!-- 需求悬赏 -->
      <a-tab-pane key="demand" tab="需求悬赏">
        <div class="fav-list">
          <div v-if="paginatedDemandItems.length === 0" class="empty-state">暂无收藏的需求</div>
          <div
            class="fav-item"
            v-for="item in paginatedDemandItems"
            :key="item.id"
            @click="openDetail('demand', { id: item.id, from: 'favorites' })"
          >
            <div class="fav-info">
              <div class="fav-title">{{ item.title }}</div>
              <div class="fav-desc">{{ item.desc }}</div>
              <div class="fav-meta">
                <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                <a-tag size="small" :color="getUrgencyColor(item.urgency)">{{ item.urgency }}</a-tag>
              </div>
              <div class="fav-demand-meta">
                <span class="fav-time">截止时间：{{ item.deadline }}</span>
                <span class="fav-stat"><UserOutlined /> {{ item.applyCount }}人报名</span>
              </div>
            </div>
            <div class="fav-right">
              <div class="fav-price">¥ {{ item.budgetMin }} ~ {{ item.budgetMax }}</div>
              <a-button size="small" danger @click.stop="removeItem(demandItems, item.id)">取消收藏</a-button>
            </div>
          </div>
        </div>
        <div class="pagination-wrapper" v-if="demandItems.length > 0">
          <a-pagination
            v-model:current="demandCurrentPage"
            v-model:pageSize="demandPageSize"
            :total="demandItems.length"
            show-size-changer
            :page-size-options="['5', '10']"
            :default-page-size="5"
          />
        </div>
      </a-tab-pane>

      <!-- 技术论坛 -->
      <a-tab-pane key="forum" tab="技术论坛">
        <div class="fav-list">
          <div v-if="paginatedForumItems.length === 0" class="empty-state">暂无收藏的文章</div>
          <div
            class="fav-item"
            v-for="item in paginatedForumItems"
            :key="item.id"
            @click="openDetail('forum', { id: item.id, from: 'favorites' })"
          >
            <img v-if="item.cover" :src="item.cover" class="fav-cover" />
            <div class="fav-info">
              <div class="fav-author-row">
                <a-avatar :size="20" :style="{ backgroundColor: item.authorColor }">{{ item.author[0] }}</a-avatar>
                <span class="fav-author">{{ item.author }}</span>
                <span class="fav-time">{{ item.publishTime }}</span>
              </div>
              <div class="fav-title">{{ item.title }}</div>
              <div class="fav-desc">{{ item.desc }}</div>
              <div class="fav-meta">
                <a-tag size="small" :color="item.tagColor">{{ item.category }}</a-tag>
                <span class="fav-stat"><EyeOutlined /> {{ item.readCount }}</span>
                <span class="fav-stat"><LikeOutlined /> {{ item.likeCount }}</span>
                <span class="fav-stat"><StarOutlined /> {{ item.collectCount }}</span>
              </div>
            </div>
            <div class="fav-right">
              <a-button size="small" danger @click.stop="removeItem(forumItems, item.id)">取消收藏</a-button>
            </div>
          </div>
        </div>
        <div class="pagination-wrapper" v-if="forumItems.length > 0">
          <a-pagination
            v-model:current="forumCurrentPage"
            v-model:pageSize="forumPageSize"
            :total="forumItems.length"
            show-size-changer
            :page-size-options="['5', '7', '10']"
            :default-page-size="7"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { EyeOutlined, LikeOutlined, StarOutlined, UserOutlined } from '@ant-design/icons-vue'
import { getCollectList } from '@/service/user/ufavorites'

const openDetail = inject('openDetail')

const activeTab = ref('service')

// 原始收藏数据
const serviceItems = ref([])
const demandItems = ref([])
const forumItems = ref([])

// 加载状态
const loading = ref(false)

// 获取收藏列表数据
const fetchCollectList = async () => {
  loading.value = true
  try {
    // 获取服务市场收藏 (GOODS)
    const goodsRes = await getCollectList({ targetType: 'GOODS', pageNo: 1, pageSize: 100 })
    if (goodsRes.code === 0 && goodsRes.data) {
      serviceItems.value = goodsRes.data.map(item => ({
        id: item.id,
        title: item.goodsTitle,
        desc: item.goodsDescription,
        price: item.price,
        sales: 0, // 接口没有返回销量字段
        cover: item.coverImage,
        tags: ['平台保障'], // 接口没有返回tags，使用默认值
        sellerName: '商家', // 接口没有返回卖家信息，使用默认值
        sellerOrders: 0, // 接口没有返回订单数
        sellerColor: '#1890ff'
      }))
    }

    // 获取需求悬赏收藏 (DEMAND)
    const demandRes = await getCollectList({ targetType: 'DEMAND', pageNo: 1, pageSize: 100 })
    if (demandRes.code === 0 && demandRes.data) {
      demandItems.value = demandRes.data.map(item => ({
        id: item.id,
        title: item.demandTitle,
        desc: item.demandDescription,
        type: item.categoryName || '其他',
        urgency: '一般', // 接口没有返回紧急程度，使用默认值
        budgetMin: item.budgetMin,
        budgetMax: item.budgetMax,
        applyCount: 0, // 接口没有返回报名人数
        deadline: '' // 接口没有返回截止时间
      }))
    }

    // 获取技术论坛收藏 (POST)
    const postRes = await getCollectList({ targetType: 'POST', pageNo: 1, pageSize: 100 })
    if (postRes.code === 0 && postRes.data) {
      forumItems.value = postRes.data.map(item => ({
        id: item.id,
        author: item.userName,
        authorColor: '#1890ff',
        title: item.postTitle,
        desc: item.postContent,
        category: item.postCategoryName || '未分类',
        tagColor: 'blue',
        publishTime: item.createTime ? item.createTime.split('T')[0] : '',
        readCount: '0',
        likeCount: item.likeCount || 0,
        collectCount: 0, // 接口没有返回收藏数
        cover: item.coverImage || ''
      }))
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchCollectList()
})

// 服务市场分页
const serviceCurrentPage = ref(1)
const servicePageSize = ref(8)
const paginatedServiceItems = computed(() => {
  const start = (serviceCurrentPage.value - 1) * servicePageSize.value
  const end = start + servicePageSize.value
  return serviceItems.value.slice(start, end)
})

// 需求悬赏分页
const demandCurrentPage = ref(1)
const demandPageSize = ref(5)
const paginatedDemandItems = computed(() => {
  const start = (demandCurrentPage.value - 1) * demandPageSize.value
  const end = start + demandPageSize.value
  return demandItems.value.slice(start, end)
})

// 技术论坛分页
const forumCurrentPage = ref(1)
const forumPageSize = ref(7)
const paginatedForumItems = computed(() => {
  const start = (forumCurrentPage.value - 1) * forumPageSize.value
  const end = start + forumPageSize.value
  return forumItems.value.slice(start, end)
})

const getUrgencyColor = (urgency) => {
  const colorMap = { '紧急': 'orange', '一般': 'blue', '常规': 'default' }
  return colorMap[urgency] || 'default'
}

const removeItem = (list, id) => {
  const idx = list.findIndex(i => i.id === id)
  if (idx !== -1) list.splice(idx, 1)
}
</script>

<style scoped>
.favorites-page { width: 100%; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 16px; }

.fav-tabs :deep(.ant-tabs-nav) { background: #fff; border-radius: 8px 8px 0 0; padding: 0 16px; margin-bottom: 0; }
.fav-tabs :deep(.ant-tabs-content-holder) { background: #fff; border-radius: 0 0 8px 8px; padding: 0 0 8px; }

.fav-list { display: flex; flex-direction: column; }
.empty-state { padding: 48px; text-align: center; color: #ccc; font-size: 14px; }

.fav-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.fav-item:last-child { border-bottom: none; }
.fav-item:hover { background: #fafafa; }

.fav-cover { width: 120px; height: 90px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.fav-info { flex: 1; min-width: 0; }
.fav-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-item:hover .fav-title { color: #1890ff; }
.fav-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.fav-time { font-size: 12px; color: #ccc; }
.fav-stat { font-size: 12px; color: #bbb; display: flex; align-items: center; gap: 3px; }

.fav-author-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.fav-author { font-size: 13px; font-weight: 600; color: #555; }

.fav-seller { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #f0f0f0; }
.seller-name { font-size: 12px; color: #555; }
.seller-orders { font-size: 11px; color: #999; margin-left: 8px; }

.fav-demand-meta { display: flex; align-items: center; gap: 16px; margin-top: 8px; }

.fav-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.fav-price { font-size: 18px; font-weight: 700; color: #ff4d4f; }
.fav-sales { font-size: 12px; color: #999; }
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 20px 16px; border-top: 1px solid #f5f5f5; }
</style>
