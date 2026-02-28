<template>
  <div class="demand-detail-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><a @click="closeDetail">需求悬赏</a></a-breadcrumb-item>
      <a-breadcrumb-item>订单号：{{ demand.orderNo }}</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 主体内容：左侧详情 + 右侧操作栏 -->
    <div class="detail-layout">
      <!-- 左侧主内容 -->
      <div class="detail-main">
        <!-- 需求内容卡片 -->
        <div class="detail-card">
          <h2 class="card-title">需求内容</h2>
          <div class="meta-line">
            <span class="meta-author">购买者：{{ demand.buyer }}</span>
            <span class="meta-time">{{ demand.publishTime }}</span>
            <a-tag :color="demand.status === '进行中' ? 'green' : 'orange'" class="status-tag">{{ demand.status }}</a-tag>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">需求标题</span>
              <span class="info-value">{{ demand.title }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">预算金额</span>
              <span class="info-value price-text">{{ demand.budget }}元</span>
              <span class="info-label" style="margin-left: 40px">预计交付时长</span>
              <span class="info-value">{{ demand.deliveryDays }}天</span>
            </div>
            <div class="info-row">
              <span class="info-label">需求描述</span>
              <span class="info-value">{{ demand.description }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">需求类型</span>
              <span class="info-value">{{ demand.type }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-row">
            <a-button type="primary" size="large" class="join-btn" ghost>参与此需求</a-button>
            <a-button size="large" class="similar-btn">发布类似需求</a-button>
            <a-button v-if="!fromFavorites" size="large" :type="collected ? 'primary' : 'default'" @click="collected = !collected">
              <HeartOutlined /> {{ collected ? '已收藏' : '收藏' }}
            </a-button>
          </div>

          <!-- 查看更多 -->
          <div class="more-link-row">
            <a class="more-link">查看更多类似需求 &gt;</a>
          </div>
        </div>

        <!-- 参与服务商 -->
        <div class="detail-card providers-card">
          <h3 class="providers-title">参与该需求的服务商 <span class="providers-count">({{ providers.length }})</span></h3>
          <div class="providers-list">
            <div class="provider-item" v-for="p in providers" :key="p.id">
              <a-avatar :size="56" :style="{ backgroundColor: p.color }">{{ p.name[0] }}</a-avatar>
              <div class="provider-info">
                <div class="provider-name">{{ p.name }}</div>
                <div class="provider-desc">{{ p.desc }}</div>
                <div class="provider-meta">
                  <a-rate :value="p.star" disabled allow-half :style="{ fontSize: '12px' }" />
                  <span class="provider-orders">{{ p.orders }}单已完成</span>
                </div>
              </div>
              <a-button type="primary" size="small" ghost class="contact-btn">联系TA</a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧操作栏 -->
      <div class="detail-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">发布需求</div>
          <p class="sidebar-desc">描述您的需求，让专业服务商来帮您完成</p>
          <a-button type="primary" block size="large" class="publish-btn">立即发布需求</a-button>
        </div>

        <div class="sidebar-card">
          <div class="sidebar-title">平台保障</div>
          <div class="guarantee-item" v-for="g in guarantees" :key="g.title">
            <component :is="g.icon" class="g-icon" :style="{ color: g.color }" />
            <div>
              <div class="g-title">{{ g.title }}</div>
              <div class="g-desc">{{ g.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { CheckCircleOutlined, SafetyOutlined, MoneyCollectOutlined, AuditOutlined, HeartOutlined } from '@ant-design/icons-vue'

const props = defineProps({ id: { type: Number, default: 1 }, from: { type: String, default: '' } })
const closeDetail = inject('closeDetail', () => {})

const collected = ref(false)
const fromFavorites = computed(() => props.from === 'favorites')
const demandId = computed(() => props.id || 1)

const demandMap = {
  1: {
    orderNo: '100234560',
    buyer: '购买者李**',
    publishTime: '2026-03-03 15:02:06',
    status: '进行中',
    title: 'MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发',
    budget: '3800.00',
    deliveryDays: 15,
    description: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别、知识库问答等功能，需提供完整源码及部署文档。',
    type: '人工智能'
  },
  2: {
    orderNo: '100234561',
    buyer: '购买者王**',
    publishTime: '2026-03-02 10:30:00',
    status: '招募中',
    title: 'PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率',
    budget: '3800.00',
    deliveryDays: 20,
    description: '基于PaddleOCR开发文档智能识别系统，支持表格、印章、手写体等多种场景识别，需要提供API接口及前端展示页面。',
    type: 'Python'
  },
  3: {
    orderNo: '100234562',
    buyer: '购买者张**',
    publishTime: '2026-03-01 09:00:00',
    status: '进行中',
    title: 'CHATERMAI：开启云资源氛围管理新篇章！',
    budget: '3800.00',
    deliveryDays: 30,
    description: '开发一套云资源管理平台，支持多云环境统一管理、资源监控、费用分析、自动扩缩容等功能，技术栈不限。',
    type: '人工智能'
  },
  4: {
    orderNo: '100234563',
    buyer: '购买者赵**',
    publishTime: '2026-02-28 14:20:00',
    status: '已完成',
    title: '欧拉操作系统内核开源，助力开发者获取源码与技术',
    budget: '3800.00',
    deliveryDays: 25,
    description: '基于欧拉操作系统进行内核模块开发，需要熟悉Linux内核开发，提供完整的模块代码、测试报告及技术文档。',
    type: 'C'
  }
}

const demand = computed(() => demandMap[demandId.value] || demandMap[1])

const providers = ref([
  { id: 1, name: 'xxx公司', desc: '专注AI应用开发，10年经验', star: 4.5, orders: 320, color: '#1890ff' },
  { id: 2, name: '技术工作室', desc: '全栈开发团队，快速交付', star: 5, orders: 180, color: '#52c41a' },
  { id: 3, name: '云端科技', desc: '云原生架构专家', star: 4, orders: 95, color: '#faad14' }
])

const guarantees = ref([
  { title: '平台担保交易', desc: '验收后再付款，资金更安全', icon: MoneyCollectOutlined, color: '#52c41a' },
  { title: '服务有标准', desc: '资料验收，交付有保障', icon: AuditOutlined, color: '#1890ff' },
  { title: '爽约必有赔', desc: '交付/离席/爽约有保障', icon: CheckCircleOutlined, color: '#faad14' },
  { title: '商家实名认证', desc: '服务商100%实名认证', icon: SafetyOutlined, color: '#ff4d4f' }
])
</script>

<style scoped>
.demand-detail-page { width: 100%; }
.breadcrumb { margin-bottom: 16px; }

.detail-layout { display: flex; gap: 20px; align-items: flex-start; }
.detail-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.detail-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

.detail-card { background: #fff; border-radius: 8px; padding: 28px 32px; }
.card-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 12px 0; }

.meta-line { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; font-size: 13px; color: #999; }
.meta-author { color: #666; }
.status-tag { margin-left: auto; }

.info-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; margin-bottom: 28px; }
.info-row { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 13px; color: #999; width: 72px; flex-shrink: 0; }
.info-value { font-size: 14px; color: #333; flex: 1; }
.price-text { color: #ff4d4f; font-weight: 600; font-size: 16px; }

.action-row { display: flex; gap: 16px; margin-bottom: 16px; }
.join-btn { border-color: #52c41a; color: #52c41a; min-width: 140px; }
.join-btn:hover { background: #52c41a; color: #fff; }
.similar-btn { min-width: 140px; }
.more-link-row { text-align: right; }
.more-link { font-size: 13px; color: #1890ff; cursor: pointer; }
.more-link:hover { color: #40a9ff; }

.providers-card { }
.providers-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 20px 0; }
.providers-count { font-size: 14px; color: #999; font-weight: 400; }
.providers-list { display: flex; flex-direction: column; gap: 16px; }
.provider-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #fafafa; border-radius: 8px; }
.provider-info { flex: 1; min-width: 0; }
.provider-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
.provider-desc { font-size: 12px; color: #999; margin-bottom: 6px; }
.provider-meta { display: flex; align-items: center; gap: 10px; }
.provider-orders { font-size: 12px; color: #999; }
.contact-btn { border-color: #1890ff; color: #1890ff; }

.sidebar-card { background: #fff; border-radius: 8px; padding: 20px; }
.sidebar-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.sidebar-desc { font-size: 13px; color: #999; margin-bottom: 16px; line-height: 1.6; }
.publish-btn { background: #52c41a; border-color: #52c41a; }
.publish-btn:hover { background: #73d13d; border-color: #73d13d; }

.guarantee-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.guarantee-item:last-child { border-bottom: none; }
.g-icon { font-size: 18px; margin-top: 2px; flex-shrink: 0; }
.g-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 2px; }
.g-desc { font-size: 12px; color: #999; }
</style>
