<template>
  <div class="orders-page">
    <h2 class="page-title">我的订购</h2>

    <div class="order-list">
      <div v-if="completedOrders.length === 0" class="empty-state">
        <InboxOutlined class="empty-icon" />
        <p>暂无订单记录</p>
      </div>

      <div class="order-card" v-for="order in completedOrders" :key="order.id">
        <div class="order-card-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createTime }}</span>
          <a-tag color="green" class="order-status">已完成</a-tag>
        </div>
        <div class="order-card-body">
          <div class="service-cover">
            <img :src="order.cover" :alt="order.serviceName" />
          </div>
          <div class="service-info">
            <div class="service-name">{{ order.serviceName }}</div>
            <div class="service-desc">{{ order.serviceDesc }}</div>
            <div class="service-tags">
              <a-tag v-for="tag in order.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
            </div>
            <div class="seller-row">
              <a-avatar :size="20" :style="{ backgroundColor: order.sellerColor }">{{ order.seller[0] }}</a-avatar>
              <span class="seller-name">{{ order.seller }}</span>
            </div>
          </div>
          <div class="order-right">
            <div class="order-price">¥ {{ order.price }}</div>
            <div class="order-qty">x {{ order.quantity }}</div>
            <div class="order-total">合计：<span>¥ {{ (order.price * order.quantity).toFixed(2) }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="order-summary">
      <div class="summary-item">
        <div class="summary-num">{{ completedOrders.length }}</div>
        <div class="summary-label">已完成订单</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">¥ {{ totalSpent }}</div>
        <div class="summary-label">累计消费</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, StarOutlined } from '@ant-design/icons-vue'

const orders = ref([
  {
    id: 5, orderNo: 'SVC20260210005', createTime: '2026-02-10 11:20:00',
    serviceName: 'Java大厂面试题 一套搞定offer',
    serviceDesc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟',
    cover: 'https://via.placeholder.com/80x60/FFD700/000000?text=Java',
    tags: ['平台保障', '商家认证'], seller: '码上拿offer', sellerColor: '#1890ff',
    price: 399, quantity: 1
  },
  {
    id: 6, orderNo: 'SVC20260205006', createTime: '2026-02-05 08:55:00',
    serviceName: '10天精通MySQL 讲的特别深入的那种',
    serviceDesc: '从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表',
    cover: 'https://via.placeholder.com/80x60/FF6600/FFFFFF?text=MySQL',
    tags: ['平台保障', '官方认证'], seller: 'DB技术专家', sellerColor: '#52c41a',
    price: 399, quantity: 1
  }
])

const completedOrders = computed(() => orders.value)

const totalSpent = computed(() =>
  orders.value.reduce((sum, o) => sum + o.price * o.quantity, 0).toFixed(2)
)

const handleReview = (order) => message.info(`评价订单：${order.orderNo}`)
</script>

<style scoped>
.orders-page { width: 100%; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 16px; }

.order-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }

.empty-state { background: #fff; border-radius: 8px; padding: 60px; text-align: center; color: #ccc; }
.empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

.order-card { background: #fff; border-radius: 8px; overflow: hidden; }
.order-card-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #fafafa; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.order-no { color: #666; }
.order-time { color: #999; }
.order-status { margin-left: auto; }

.order-card-body { display: flex; gap: 16px; padding: 16px 20px; align-items: flex-start; }
.service-cover img { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; }
.service-info { flex: 1; min-width: 0; }
.service-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; }
.service-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.service-tags { display: flex; gap: 6px; margin-bottom: 8px; }
.seller-row { display: flex; align-items: center; gap: 6px; }
.seller-name { font-size: 12px; color: #666; }

.order-right { text-align: right; flex-shrink: 0; min-width: 120px; }
.order-price { font-size: 18px; font-weight: 700; color: #ff4d4f; }
.order-qty { font-size: 13px; color: #999; margin: 4px 0; }
.order-total { font-size: 13px; color: #666; }
.order-total span { color: #ff4d4f; font-weight: 600; }

.order-summary { background: #fff; border-radius: 8px; padding: 20px 24px; display: flex; gap: 40px; justify-content: center; }
.summary-item { text-align: center; }
.summary-num { font-size: 24px; font-weight: 700; color: #333; }
.summary-label { font-size: 13px; color: #999; margin-top: 4px; }
</style>
