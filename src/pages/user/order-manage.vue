<template>
  <div class="order-manage-page">
    <h2 class="page-title">订单管理</h2>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-num" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <a-tabs v-model:activeKey="activeTab" class="status-tabs">
        <a-tab-pane key="sell" tab="我卖出的" />
        <a-tab-pane key="buy" tab="我买入的" />
      </a-tabs>
      <div style="display:flex;align-items:center;gap:8px">
        <a-select v-model:value="statusFilter" style="width:110px" size="small">
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="pending">待确认</a-select-option>
          <a-select-option value="progress">进行中</a-select-option>
          <a-select-option value="done">已完成</a-select-option>
          <a-select-option value="refund">已退款</a-select-option>
        </a-select>
        <a-input-search v-model:value="searchKeyword" placeholder="搜索订单号/服务名" style="width:220px" />
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <InboxOutlined style="font-size:48px;color:#e0e0e0" />
        <p>暂无订单记录</p>
      </div>

      <div class="order-card" v-for="order in filteredOrders" :key="order.id">
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createTime }}</span>
          <span class="order-type-tag">
            <a-tag size="small" :color="order.type === 'service' ? 'blue' : 'orange'">
              {{ order.type === 'service' ? '服务订单' : '悬赏订单' }}
            </a-tag>
          </span>
          <a-badge :status="statusMap[order.status].badge" :text="statusMap[order.status].text" style="margin-left:auto" />
        </div>
        <div class="order-body">
          <img :src="order.cover" class="order-cover" />
          <div class="order-info">
            <div class="order-title">{{ order.title }}</div>
            <div class="order-desc">{{ order.desc }}</div>
            <div class="order-party">
              <span v-if="activeTab === 'sell'">买家：<strong>{{ order.buyer }}</strong></span>
              <span v-else>卖家：<strong>{{ order.seller }}</strong></span>
              <span class="order-deadline" v-if="order.deadline">交付截止：{{ order.deadline }}</span>
            </div>
          </div>
          <div class="order-amount">
            <div class="amount-num">¥ {{ order.amount }}</div>
            <div class="amount-label">订单金额</div>
            <div class="order-actions">
              <a-button v-if="order.status === 'progress' && activeTab === 'sell'" size="small" type="primary" style="background:#52c41a;border-color:#52c41a" @click="confirmDelivery(order)">确认交付</a-button>
              <a-button v-if="order.status === 'progress' && activeTab === 'buy'" size="small" type="primary" @click="confirmReceive(order)">确认收货</a-button>
              <a-button v-if="order.status === 'done' && activeTab === 'buy' && !order.reviewed" size="small" @click="openReview(order)">评价</a-button>
              <a-button v-if="order.status === 'pending'" size="small" danger @click="cancelOrder(order)">取消</a-button>
              <a-button size="small" @click="viewDetail(order)">详情</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价弹窗 -->
    <a-modal v-model:open="reviewVisible" title="评价订单" @ok="submitReview" ok-text="提交评价" cancel-text="取消">
      <div style="margin-top:8px">
        <div style="margin-bottom:12px;font-size:14px;color:#666">服务评分</div>
        <a-rate v-model:value="reviewForm.rating" allow-half />
        <a-textarea v-model:value="reviewForm.content" :rows="4" placeholder="分享你的使用体验..." style="margin-top:12px" :maxlength="300" show-count />
      </div>
    </a-modal>

    <!-- 订单详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="订单详情"
      width="640px"
      :footer="null"
    >
      <div v-if="detailOrder" class="detail-modal">
        <!-- 订单状态横幅 -->
        <div class="detail-status-bar" :class="detailOrder.status">
          <a-badge :status="statusMap[detailOrder.status].badge" />
          <span class="detail-status-text">{{ statusMap[detailOrder.status].text }}</span>
          <span class="detail-order-no">订单号：{{ detailOrder.orderNo }}</span>
        </div>

        <!-- 服务信息 -->
        <div class="detail-section">
          <div class="detail-section-title">服务信息</div>
          <div class="detail-service-row">
            <img :src="detailOrder.cover" class="detail-cover" />
            <div class="detail-service-info">
              <div class="detail-service-title">{{ detailOrder.title }}</div>
              <div class="detail-service-desc">{{ detailOrder.desc }}</div>
              <a-tag size="small" :color="detailOrder.type === 'service' ? 'blue' : 'orange'">
                {{ detailOrder.type === 'service' ? '服务订单' : '悬赏订单' }}
              </a-tag>
            </div>
            <div class="detail-service-price">¥ {{ detailOrder.amount }}</div>
          </div>
        </div>

        <!-- 交易信息表格 -->
        <div class="detail-section">
          <div class="detail-section-title">交易信息</div>
          <table class="detail-table">
            <tr>
              <td class="detail-td-label">订单金额</td>
              <td class="detail-td-value price-red">¥ {{ detailOrder.amount }}</td>
              <td class="detail-td-label">支付方式</td>
              <td class="detail-td-value">平台余额</td>
            </tr>
            <tr>
              <td class="detail-td-label">买家</td>
              <td class="detail-td-value">{{ detailOrder.buyer || '—' }}</td>
              <td class="detail-td-label">卖家</td>
              <td class="detail-td-value">{{ detailOrder.seller || '—' }}</td>
            </tr>
            <tr>
              <td class="detail-td-label">下单时间</td>
              <td class="detail-td-value">{{ detailOrder.createTime }}</td>
              <td class="detail-td-label">交付截止</td>
              <td class="detail-td-value" :class="{ 'price-orange': detailOrder.deadline }">
                {{ detailOrder.deadline || '无限制' }}
              </td>
            </tr>
            <tr>
              <td class="detail-td-label">平台保障</td>
              <td class="detail-td-value"><a-tag color="green" size="small">爽约必赔</a-tag></td>
              <td class="detail-td-label">是否评价</td>
              <td class="detail-td-value">{{ detailOrder.reviewed ? '已评价' : '未评价' }}</td>
            </tr>
          </table>
        </div>

        <!-- 订单进度时间轴 -->
        <div class="detail-section">
          <div class="detail-section-title">订单进度</div>
          <a-timeline>
            <a-timeline-item color="green">
              <div class="timeline-item">
                <span class="timeline-label">订单创建</span>
                <span class="timeline-time">{{ detailOrder.createTime }}</span>
              </div>
              <div class="timeline-desc">买家提交订单，等待卖家确认</div>
            </a-timeline-item>
            <a-timeline-item :color="detailOrder.status !== 'pending' ? 'green' : 'gray'">
              <div class="timeline-item">
                <span class="timeline-label">订单确认</span>
                <span class="timeline-time" v-if="detailOrder.status !== 'pending'">{{ detailOrder.createTime }}</span>
              </div>
              <div class="timeline-desc">卖家确认接单，开始服务</div>
            </a-timeline-item>
            <a-timeline-item :color="detailOrder.status === 'done' || detailOrder.status === 'refund' ? 'green' : 'gray'">
              <div class="timeline-item">
                <span class="timeline-label">服务交付</span>
                <span class="timeline-time" v-if="detailOrder.status === 'done'">{{ detailOrder.deadline || '—' }}</span>
              </div>
              <div class="timeline-desc">卖家完成交付，买家确认收货</div>
            </a-timeline-item>
            <a-timeline-item :color="detailOrder.status === 'done' ? 'green' : detailOrder.status === 'refund' ? 'red' : 'gray'">
              <div class="timeline-item">
                <span class="timeline-label">{{ detailOrder.status === 'refund' ? '订单退款' : '订单完成' }}</span>
              </div>
              <div class="timeline-desc">
                {{ detailOrder.status === 'refund' ? '订单已退款，资金原路返回' : '交易完成，资金已结算给卖家' }}
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'

const activeTab = ref('sell')
const statusFilter = ref('all')
const searchKeyword = ref('')
const reviewVisible = ref(false)
const reviewingOrder = ref(null)
const reviewForm = ref({ rating: 5, content: '' })

const statusMap = {
  pending:  { badge: 'warning',    text: '待确认' },
  progress: { badge: 'processing', text: '进行中' },
  done:     { badge: 'success',    text: '已完成' },
  refund:   { badge: 'error',      text: '已退款' }
}

const statCards = ref([
  { label: '卖出订单', value: 5, color: '#1890ff' },
  { label: '买入订单', value: 3, color: '#52c41a' },
  { label: '累计收入', value: '¥ 12,480', color: '#ff4d4f' },
  { label: '累计支出', value: '¥ 1,197', color: '#fa8c16' }
])

const sellOrders = ref([
  { id: 1, orderNo: 'SVC20260301001', createTime: '2026-03-01 10:20', title: 'Java大厂面试课，一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点', cover: 'https://placehold.co/80x60/FFD700/000000?text=Java', type: 'service', status: 'progress', buyer: '张同学', amount: '399.00', deadline: '2026-03-15', reviewed: false },
  { id: 2, orderNo: 'SVC20260228002', createTime: '2026-02-28 14:35', title: 'Vue3 + TypeScript 企业级实战', desc: '从零搭建企业级前端项目，涵盖架构设计', cover: 'https://placehold.co/80x60/42b883/FFFFFF?text=Vue3', type: 'service', status: 'done', buyer: '李工程师', amount: '299.00', deadline: null, reviewed: true },
  { id: 3, orderNo: 'SVC20260225003', createTime: '2026-02-25 09:10', title: 'MySQL 性能优化深度实战', desc: '从底层原理到实战优化，涵盖索引、事务', cover: 'https://placehold.co/80x60/FF6600/FFFFFF?text=MySQL', type: 'service', status: 'done', buyer: '王架构师', amount: '349.00', deadline: null, reviewed: true },
  { id: 4, orderNo: 'DMD20260220004', createTime: '2026-02-20 16:00', title: 'React Native 跨平台移动端应用开发', desc: '开发一款电商类App，支持iOS和Android双端', cover: 'https://placehold.co/80x60/61dafb/000000?text=RN', type: 'demand', status: 'pending', buyer: '陈产品', amount: '12000.00', deadline: '2026-04-15', reviewed: false },
  { id: 5, orderNo: 'SVC20260210005', createTime: '2026-02-10 11:20', title: 'Python 数据分析实战项目', desc: '基于真实业务数据，完成数据清洗、分析、可视化', cover: 'https://placehold.co/80x60/3776AB/FFFFFF?text=Python', type: 'service', status: 'refund', buyer: '刘同学', amount: '199.00', deadline: null, reviewed: false }
])

const buyOrders = ref([
  { id: 6, orderNo: 'SVC20260210006', createTime: '2026-02-10 11:20', title: 'Java大厂面试课，一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点', cover: 'https://placehold.co/80x60/FFD700/000000?text=Java', type: 'service', status: 'done', seller: '码上拿offer', amount: '399.00', deadline: null, reviewed: false },
  { id: 7, orderNo: 'SVC20260205007', createTime: '2026-02-05 08:55', title: '10天精通MySQL', desc: '从底层原理到实战优化，涵盖索引、事务、锁机制', cover: 'https://placehold.co/80x60/FF6600/FFFFFF?text=MySQL', type: 'service', status: 'done', seller: 'DB技术专家', amount: '399.00', deadline: null, reviewed: true },
  { id: 8, orderNo: 'SVC20260301008', createTime: '2026-03-01 15:30', title: 'Docker + K8s 容器化部署实战', desc: '从Docker基础到Kubernetes集群管理', cover: 'https://placehold.co/80x60/0db7ed/FFFFFF?text=Docker', type: 'service', status: 'progress', seller: 'DevOps专家', amount: '499.00', deadline: '2026-03-20', reviewed: false }
])

const currentOrders = computed(() => activeTab.value === 'sell' ? sellOrders.value : buyOrders.value)

const filteredOrders = computed(() => {
  let list = currentOrders.value
  if (statusFilter.value !== 'all') list = list.filter(o => o.status === statusFilter.value)
  if (searchKeyword.value.trim()) list = list.filter(o => o.orderNo.includes(searchKeyword.value) || o.title.includes(searchKeyword.value))
  return list
})

const detailVisible = ref(false)
const detailOrder = ref(null)

const confirmDelivery = (order) => { order.status = 'done'; message.success('已确认交付') }
const confirmReceive = (order) => { order.status = 'done'; message.success('已确认收货') }
const cancelOrder = (order) => { order.status = 'refund'; message.success('订单已取消') }
const viewDetail = (order) => { detailOrder.value = order; detailVisible.value = true }

const openReview = (order) => {
  reviewingOrder.value = order
  reviewForm.value = { rating: 5, content: '' }
  reviewVisible.value = true
}
const submitReview = () => {
  if (reviewingOrder.value) reviewingOrder.value.reviewed = true
  reviewVisible.value = false
  message.success('评价提交成功')
}
</script>

<style scoped>
.order-manage-page { width: 100%; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 16px; }

.stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-card { flex: 1; background: #fff; border-radius: 8px; padding: 16px 20px; text-align: center; }
.stat-num { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: #999; }

.filter-bar { background: #fff; border-radius: 8px 8px 0 0; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.status-tabs :deep(.ant-tabs-nav) { margin: 0; }
.status-tabs :deep(.ant-tabs-nav::before) { border: none; }
.status-tabs :deep(.ant-tabs-nav-operations) { display: none !important; }

.order-list { background: #fff; border-radius: 0 0 8px 8px; display: flex; flex-direction: column; }
.empty-state { padding: 60px; text-align: center; color: #ccc; display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 14px; }

.order-card { border-bottom: 1px solid #f5f5f5; }
.order-card:last-child { border-bottom: none; }
.order-header { display: flex; align-items: center; gap: 12px; padding: 10px 20px; background: #fafafa; border-bottom: 1px solid #f5f5f5; font-size: 12px; color: #999; }
.order-no { color: #666; font-weight: 500; }
.order-body { display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
.order-cover { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.order-info { flex: 1; min-width: 0; }
.order-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-party { display: flex; gap: 20px; font-size: 12px; color: #bbb; }
.order-party strong { color: #555; }
.order-deadline { color: #fa8c16; }

.order-amount { flex-shrink: 0; text-align: right; min-width: 130px; }
.amount-num { font-size: 20px; font-weight: 700; color: #ff4d4f; margin-bottom: 4px; }
.amount-label { font-size: 12px; color: #bbb; margin-bottom: 10px; }
.order-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }

/* 订单详情弹窗 */
.detail-modal { padding: 4px 0; }

.detail-status-bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; background: #f6ffed; border: 1px solid #b7eb8f; }
.detail-status-bar.pending { background: #fffbe6; border-color: #ffe58f; }
.detail-status-bar.progress { background: #e6f7ff; border-color: #91d5ff; }
.detail-status-bar.refund { background: #fff2f0; border-color: #ffccc7; }
.detail-status-text { font-size: 15px; font-weight: 600; color: #333; }
.detail-order-no { margin-left: auto; font-size: 12px; color: #999; }

.detail-section { margin-bottom: 20px; }
.detail-section-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #52c41a; }

.detail-service-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fafafa; border-radius: 6px; }
.detail-cover { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.detail-service-info { flex: 1; min-width: 0; }
.detail-service-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; }
.detail-service-desc { font-size: 12px; color: #999; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detail-service-price { font-size: 20px; font-weight: 700; color: #ff4d4f; flex-shrink: 0; }

.detail-table { width: 100%; border-collapse: collapse; }
.detail-table tr { border-bottom: 1px solid #f5f5f5; }
.detail-table tr:last-child { border-bottom: none; }
.detail-td-label { padding: 10px 12px; font-size: 13px; color: #999; width: 80px; background: #fafafa; }
.detail-td-value { padding: 10px 16px; font-size: 13px; color: #333; width: calc(50% - 80px); }
.price-red { color: #ff4d4f; font-weight: 600; }
.price-orange { color: #fa8c16; }

.timeline-item { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.timeline-label { font-size: 13px; font-weight: 600; color: #333; }
.timeline-time { font-size: 12px; color: #bbb; }
.timeline-desc { font-size: 12px; color: #999; }
</style>
