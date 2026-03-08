<template>
  <div class="my-demand-detail-page">
    <div class="page-header">
      <a-button @click="$router.back()" type="text" class="back-btn">
        <LeftOutlined /> 返回我的悬赏
      </a-button>
    </div>

    <!-- 主体内容：左侧详情 + 右侧审核状态 -->
    <div class="detail-layout">
      <!-- 左侧主内容 -->
      <div class="detail-main">
        <!-- 需求内容卡片 -->
        <div class="detail-card">
          <h2 class="card-title">需求内容</h2>
          <div class="meta-line">
            <span class="meta-author">发布者：{{ demand.publisher }}</span>
            <span class="meta-time">创建时间：{{ demand.createTime }}</span>
            <span class="meta-time">截止时间：{{ demand.deadline }}</span>
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
            </div>
            <div class="info-row">
              <span class="info-label">需求描述</span>
              <span class="info-value">{{ demand.description }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">需求类型</span>
              <span class="info-value">{{ demand.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">紧急程度</span>
              <span class="info-value">
                <a-tag :color="getUrgencyColor(demand.urgency)">{{ demand.urgency }}</a-tag>
              </span>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-row">
            <div class="stat-item">
              <EyeOutlined class="stat-icon" />
              <span class="stat-label">浏览量</span>
              <span class="stat-value">{{ demand.views }}</span>
            </div>
            <div class="stat-item">
              <FileTextOutlined class="stat-icon" />
              <span class="stat-label">投标数</span>
              <span class="stat-value">{{ demand.bids }}</span>
            </div>
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

      <!-- 右侧审核状态栏 -->
      <div class="detail-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">审核状态</div>
          <div class="audit-info">
            <div class="audit-status">
              <a-badge :status="demand.auditStatus === 'approved' ? 'success' : 'error'" 
                       :text="demand.auditStatus === 'approved' ? '审核通过' : '审核未通过'" />
            </div>
            <div class="audit-remark-label">审核备注</div>
            <div class="audit-remark-content">{{ demand.auditRemark }}</div>
          </div>
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircleOutlined, SafetyOutlined, MoneyCollectOutlined, AuditOutlined, EyeOutlined, FileTextOutlined, LeftOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const demandId = computed(() => parseInt(route.params.id) || 1)

// 获取紧急程度颜色
const getUrgencyColor = (urgency) => {
  const colorMap = {
    '非常紧急': 'red',
    '紧急': 'orange',
    '一般': 'blue',
    '不紧急': 'default'
  }
  return colorMap[urgency] || 'default'
}

const demandMap = {
  1: {
    publisher: '当前用户',
    createTime: '2026-03-03 15:02:06',
    deadline: '2026-03-31 23:59:59',
    status: '招募中',
    title: 'MiniMax-M2.1 智能客服系统开发',
    budget: '3800.00',
    description: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别、知识库接入',
    type: '人工智能',
    urgency: '紧急',
    views: 1256,
    bids: 12,
    auditStatus: 'approved',
    auditRemark: '-'
  },
  2: {
    publisher: '当前用户',
    createTime: '2026-02-28 10:30:00',
    deadline: '2026-04-15 23:59:59',
    status: '进行中',
    title: 'React Native 跨平台移动端应用开发',
    budget: '12000.00',
    description: '开发一款电商类App，需要支持iOS和Android双端，包含商品浏览、购物车、支付功能',
    type: '移动开发',
    urgency: '一般',
    views: 892,
    bids: 7,
    auditStatus: 'approved',
    auditRemark: '-'
  },
  3: {
    publisher: '当前用户',
    createTime: '2026-02-10 09:00:00',
    deadline: '2026-02-28 23:59:59',
    status: '已完成',
    title: 'MySQL 数据库性能优化咨询',
    budget: '2000.00',
    description: '现有系统查询慢，需要专业DBA对数据库进行诊断和优化，提供优化报告',
    type: '数据库',
    urgency: '一般',
    views: 654,
    bids: 5,
    auditStatus: 'approved',
    auditRemark: '-'
  },
  4: {
    publisher: '当前用户',
    createTime: '2026-03-01 14:20:00',
    deadline: '2026-04-01 23:59:59',
    status: '招募中',
    title: 'Vue3 后台管理系统开发',
    budget: '8000.00',
    description: '基于Vue3+Element Plus开发一套通用后台管理系统，包含权限管理、数据可视化',
    type: 'Vue/React',
    urgency: '紧急',
    views: 1023,
    bids: 9,
    auditStatus: 'rejected',
    auditRemark: '需求描述不够详细，请补充具体的功能模块和技术要求'
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
.my-demand-detail-page { width: 100%; }
.page-header { margin-bottom: 16px; }
.back-btn { font-size: 14px; color: #666; }
.back-btn:hover { color: #1890ff; }

.detail-layout { display: flex; gap: 20px; align-items: flex-start; }
.detail-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.detail-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

.detail-card { background: #fff; border-radius: 8px; padding: 28px 32px; }
.card-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 12px 0; }

.meta-line { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; font-size: 13px; color: #999; flex-wrap: wrap; }
.meta-author { color: #666; font-weight: 500; }
.meta-time { color: #999; }
.status-tag { margin-left: auto; }

.info-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; margin-bottom: 20px; }
.info-row { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 13px; color: #999; width: 72px; flex-shrink: 0; }
.info-value { font-size: 14px; color: #333; flex: 1; }
.price-text { color: #ff4d4f; font-weight: 600; font-size: 16px; }

.stats-row { display: flex; gap: 32px; padding: 16px 20px; background: #fafafa; border-radius: 6px; margin-bottom: 20px; }
.stat-item { display: flex; align-items: center; gap: 8px; }
.stat-icon { font-size: 16px; color: #1890ff; }
.stat-label { font-size: 13px; color: #999; }
.stat-value { font-size: 16px; font-weight: 600; color: #333; }

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

.guarantee-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.guarantee-item:last-child { border-bottom: none; }
.g-icon { font-size: 18px; margin-top: 2px; flex-shrink: 0; }
.g-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 2px; }
.g-desc { font-size: 12px; color: #999; }

.audit-info { padding-top: 8px; }
.audit-status { margin-bottom: 16px; }
.audit-remark-label { font-size: 13px; color: #999; margin-bottom: 8px; }
.audit-remark-content { font-size: 14px; color: #333; line-height: 1.6; padding: 12px; background: #fafafa; border-radius: 4px; min-height: 60px; }
</style>
