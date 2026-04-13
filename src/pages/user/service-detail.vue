<template>
  <div class="service-detail-page">
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><a @click="closeDetail">服务市场</a></a-breadcrumb-item>
      <a-breadcrumb-item>{{ service.title }}</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="product-section">
      <div class="product-gallery">
        <div class="main-image"><img :src="service.images[currentImage]" alt="商品图" /></div>
        <div class="thumb-list">
          <div v-for="(img, idx) in service.images" :key="idx" class="thumb-item" :class="{ active: currentImage === idx }" @click="currentImage = idx">
            <img :src="img" alt="" />
          </div>
        </div>
      </div>
      <div class="product-info">
        <h1 class="product-title">{{ service.title }}</h1>
        <p class="product-subtitle">{{ service.desc }}</p>
        <div class="price-box">
          <div class="price-row">
            <span class="price-label">价格</span>
            <span class="price-value">¥ {{ service.price }}</span>
          </div>
          <div class="price-row">
            <span class="price-label">销量</span>
            <span class="price-info">{{ service.sales }}+ 笔</span>
          </div>
          <div class="price-row">
            <span class="price-label">好评率</span>
            <span class="price-info" style="color: #52c41a">{{ service.rating }}%</span>
          </div>
        </div>
        <div class="guarantee-tags">
          <span class="price-label">保障</span>
          <div class="tag-list">
            <a-tag v-for="tag in service.tags" :key="tag" color="blue"><CheckCircleOutlined /> {{ tag }}</a-tag>
          </div>
        </div>
        <div class="seller-info">
          <a-avatar :size="40" style="background-color: #1890ff">{{ service.seller.name[0] }}</a-avatar>
          <div class="seller-detail">
            <div class="seller-name">{{ service.seller.name }}</div>
            <div class="seller-meta">
              <span>{{ service.seller.orders }}单已完成</span>
            </div>
          </div>
        </div>
        <div class="quantity-row" v-if="!fromMyServices">
          <span class="price-label">购买数量 X1</span>
          <!-- <div class="quantity-control">
            <a-button @click="quantity > 1 && quantity--">-</a-button>
            <a-input-number v-model:value="quantity" :min="1" :max="99" class="quantity-input" />
            <a-button @click="quantity < 99 && quantity++">+</a-button>
          </div> -->
        </div>
        <div class="action-buttons" v-if="!fromMyServices">
          <a-button type="primary" size="large" danger class="buy-btn" @click="buyModalVisible = true"><ShoppingCartOutlined /> 立即购买</a-button>
          <a-button v-if="!fromFavorites" size="large" :type="collected ? 'primary' : 'default'" @click="collected = !collected">
            <HeartOutlined /> {{ collected ? '已收藏' : '收藏' }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 购买确认弹窗 -->
    <a-modal v-model:open="buyModalVisible" title="确认购买" ok-text="确认下单" cancel-text="取消" @ok="handleBuy" :confirm-loading="buyLoading">
      <div class="buy-modal-content">
        <div class="buy-service-info">
          <img :src="service.images[0]" class="buy-cover" />
          <div>
            <div class="buy-title">{{ service.title }}</div>
            <div class="buy-price">¥ {{ service.price }}</div>
          </div>
        </div>
        <a-form layout="vertical" style="margin-top: 16px">
          <a-form-item label="需求备注（选填）">
            <a-textarea v-model:value="buyRemark" :rows="3" placeholder="请描述您的具体需求，方便服务商更好地为您服务" :maxlength="300" show-count />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <div class="detail-body">
      <div class="detail-left">
        <a-tabs v-model:activeKey="activeTab" class="detail-tabs">
          <a-tab-pane key="detail" tab="服务详情">
            <div class="detail-content">
              <h3>服务介绍</h3>
              <p>{{ service.detailIntro }}</p>
              <h3>服务内容</h3>
              <ul><li v-for="(item, idx) in service.detailItems" :key="idx">{{ item }}</li></ul>
              <h3>交付标准</h3>
              <p>{{ service.deliveryStandard }}</p>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { CheckCircleOutlined, ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons-vue'
import { getGoodsDetail } from '../../service/user/uservice.js'

const props = defineProps({ id: { type: Number, default: 1 }, from: { type: String, default: '' } })
const closeDetail = inject('closeDetail', () => {})
const router = useRouter()

const collected = ref(false)
const fromFavorites = computed(() => props.from === 'favorites')
const fromMyServices = computed(() => props.from === 'my-services')
const serviceId = computed(() => props.id || 1)
const currentImage = ref(0)
const activeTab = ref('detail')
const quantity = ref(1)
const buyModalVisible = ref(false)
const buyLoading = ref(false)
const buyRemark = ref('')
const loading = ref(false)

// 服务数据，映射 API 返回字段
const service = ref({
  title: '',
  desc: '',
  price: 0,
  sales: 0,
  rating: 100,
  tags: [],
  images: [],
  seller: {
    name: '',
    orders: 0
  },
  detailIntro: '',
  detailItems: [],
  deliveryStandard: ''
})

// 加载商品详情
const loadGoodsDetail = async () => {
  loading.value = true
  try {
    const res = await getGoodsDetail(serviceId.value)
    if (res && res.data) {
      const data = res.data
      // 映射 API 字段到页面使用的字段
      service.value = {
        title: data.goodsTitle || '未知商品',
        desc: data.description || '',
        price: data.price || 0,
        sales: data.orderCount || 0,
        rating: 100, // 接口没有返回好评率，默认 100
        tags: ['平台保障', '商家认证', '7天无理由'], // 接口未提供，使用默认标签
        images: data.images && data.images.length > 0 ? data.images : [data.coverImage].filter(Boolean),
        seller: {
          name: data.providerName || '未知商家',
          orders: data.orderCount || 0
        },
        detailIntro: data.content || '',
        detailItems: [], // 接口未提供详细列表，从 content 解析或使用默认
        deliveryStandard: data.deliveryDays ? `交付天数：${data.deliveryDays}天` : ''
      }
      collected.value = data.isCollected || false
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    message.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

// 监听 serviceId 变化，重新加载
watch(serviceId, () => {
  loadGoodsDetail()
})

// 组件挂载时加载
onMounted(() => {
  loadGoodsDetail()
})

const handleBuy = async () => {
  buyLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    message.success('下单成功，等待卖家接单')
    buyModalVisible.value = false
    buyRemark.value = ''
    closeDetail()
    router.push('/user/order-manage')
  } finally {
    buyLoading.value = false
  }
}
</script>

<style scoped>
.service-detail-page { width: 100%; }
.breadcrumb { margin-bottom: 16px; }
.product-section { display: flex; gap: 24px; background: #fff; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
.product-gallery { width: 480px; flex-shrink: 0; }
.main-image { width: 100%; height: 360px; border-radius: 8px; overflow: hidden; background: #f5f5f5; margin-bottom: 12px; }
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.thumb-list { display: flex; gap: 8px; }
.thumb-item { width: 72px; height: 54px; border-radius: 4px; overflow: hidden; cursor: pointer; border: 2px solid transparent; opacity: 0.6; transition: all 0.2s; }
.thumb-item.active { border-color: #1890ff; opacity: 1; }
.thumb-item:hover { opacity: 1; }
.thumb-item img { width: 100%; height: 100%; object-fit: cover; }
.product-info { flex: 1; min-width: 0; }
.product-title { font-size: 22px; font-weight: 700; color: #333; margin: 0 0 8px 0; line-height: 1.4; }
.product-subtitle { font-size: 14px; color: #666; margin: 0 0 16px 0; }
.price-box { background: #fff7f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.price-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.price-row:last-child { margin-bottom: 0; }
.price-label { font-size: 13px; color: #999; width: 50px; flex-shrink: 0; }
.price-value { font-size: 28px; font-weight: 700; color: #ff4d4f; }
.price-original { font-size: 14px; color: #ccc; text-decoration: line-through; }
.price-info { font-size: 14px; color: #333; }
.guarantee-tags { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.tag-list { display: flex; gap: 8px; flex-wrap: wrap; }
.seller-info { display: flex; align-items: center; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 20px; }
.seller-detail { flex: 1; }
.seller-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
.seller-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #999; }
.quantity-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.quantity-control { display: flex; align-items: center; }
.quantity-control .quantity-input { width: 60px; text-align: center; }
.quantity-control :deep(.ant-input-number-handler-wrap) { display: none; }
.quantity-control :deep(.ant-input-number-input) { text-align: center; }
.action-buttons { display: flex; gap: 12px; align-items: center; }
.buy-btn { min-width: 160px; height: 48px; font-size: 16px; }
.chat-btn { min-width: 120px; height: 48px; font-size: 16px; color: #1890ff; border-color: #1890ff; }
.detail-body { width: 100%; }
.detail-left { width: 100%; background: #fff; border-radius: 8px; padding: 24px; }
.buy-modal-content { display: flex; flex-direction: column; }
.buy-service-info { display: flex; gap: 12px; align-items: center; padding: 12px; background: #fafafa; border-radius: 6px; }
.buy-cover { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.buy-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 6px; }
.buy-price { font-size: 20px; font-weight: 700; color: #ff4d4f; }
.detail-content h3 { font-size: 16px; font-weight: 600; color: #333; margin: 20px 0 12px 0; padding-left: 10px; border-left: 3px solid #1890ff; }
.detail-content h3:first-child { margin-top: 0; }
.detail-content p { font-size: 14px; color: #666; line-height: 1.8; margin: 0 0 12px 0; }
.detail-content ul { padding-left: 20px; margin: 0 0 16px 0; }
.detail-content li { font-size: 14px; color: #666; line-height: 2; }
</style>
