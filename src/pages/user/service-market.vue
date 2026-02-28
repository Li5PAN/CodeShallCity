<template>
  <div class="service-market-page">
    <h3>服务市场</h3>
    <a-tabs
      v-model:activeKey="activeCategory"
      type="card"
      size="middle"
      @change="handleCategoryChange"
      class="category-tabs"
    >
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane key="big-data" tab="大数云计"/>
      <a-tab-pane key="algorithm" tab="算法与数据" />
      <a-tab-pane key="data-science" tab="数据科学" />
      <a-tab-pane key="iot" tab="物联网" />
      <a-tab-pane key="project-management" tab="项目管理与协作工" />
      <a-tab-pane key="blockchain" tab="区块链技" />
      <a-tab-pane key="ai" tab="人工智能" />
      <a-tab-pane key="more" tab="更多 >" />
    </a-tabs>
    <a-row :gutter="[16, 16]" class="service-list">
      <a-col :xs="24" :sm="12" :md="6" v-for="item in serviceList" :key="item.id">
        <a-card :bordered="false" class="service-card" @click="openDetail('service', { id: item.id })" style="cursor: pointer">
          <div class="card-cover" :style="{ backgroundImage: `url(${item.cover})` }"></div>
          <div class="card-content">
            <h4 class="card-title">{{ item.title }}</h4>
            <p class="card-desc">{{ item.desc }}</p>
            <div class="card-tags">
              <a-tag v-for="tag in item.tags" :key="tag" :color="tag === '平台保障' ? 'green' : 'blue'" size="small">{{ tag }}</a-tag>
            </div>
            <div class="card-footer">
              <span class="price">¥ {{ item.price }}</span>
              <span class="stats">好评�?00% 成交�?1000+</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <div class="platform-guarantee">
      <div class="guarantee-list">
        <div class="guarantee-item" v-for="item in guaranteeList" :key="item.key">
          <component :is="item.icon" class="guarantee-icon" :style="{ color: item.color }" />
          <div class="guarantee-text">
            <div class="guarantee-title">{{ item.title }}</div>
            <div class="guarantee-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { CheckCircleOutlined, SafetyOutlined, AuditOutlined, MoneyCollectOutlined } from '@ant-design/icons-vue'

const openDetail = inject('openDetail')

const activeCategory = ref('all')
const serviceList = reactive([
  { id: 1, title: 'Java大厂面试�?一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模', price: 399, cover: 'https://placehold.co/240x120/FFD700/000000?text=Java', tags: ['平台保障', '商家认证', '7天无理由'] },
  { id: 2, title: '10天精通MySQL 讲的特别深入的那', desc: '从底层原理到实战优化，涵盖索引、事务、锁机制、分库分', price: 399, cover: 'https://placehold.co/240x120/FF6600/FFFFFF?text=MySQL', tags: ['平台保障', '官方认证', '售后答疑'] },
  { id: 3, title: '颠覆你认知的八股盛宴', desc: '打破传统八股文，结合实战场景讲解，让面试官眼前一', price: 399, cover: 'https://via.placeholder.com/240x120/FF4444/FFFFFF?text=八股', tags: ['平台保障', '一对一辅导', '终身更新'] },
  { id: 4, title: 'RabbitMQ 2天入门到实战', desc: '从安装部署到高可用架构，结合电商场景实现消息队列实战', price: 399, cover: 'https://placehold.co/240x120/0099FF/FFFFFF?text=RabbitMQ', tags: ['平台保障', '项目实战', '源码解析'] }
])
const guaranteeList = reactive([
  { key: 'platform', title: '平台保障', desc: '爽约必赔', icon: CheckCircleOutlined, color: '#52c41a' },
  { key: 'merchant', title: '商家认证', desc: '服务�?00%实名认证', icon: SafetyOutlined, color: '#1890ff' },
  { key: 'standard', title: '服务有标', desc: '资料验收 交付有保', icon: AuditOutlined, color: '#faad14' },
  { key: 'fund', title: '资金更安', desc: '平台担保交易 验收后付', icon: MoneyCollectOutlined, color: '#fa8c16' },
  { key: 'compensation', title: '爽约必有', desc: '交付/离席/爽约有保', icon: CheckCircleOutlined, color: '#eb2f96' }
])
const handleCategoryChange = (key) => { console.log('切换到分�?', key) }
</script>

<style scoped>
.service-market-page { width: 100%; min-height: 100%; display: flex; flex-direction: column; }
.service-list { flex: 1; }
.category-tabs { margin-bottom: 20px; }
.category-tabs :deep(.ant-tabs-nav::before) { border-bottom: none !important; }
.category-tabs :deep(.ant-tabs-nav) { background: transparent !important; }
.category-tabs :deep(.ant-tabs-tab) { border: none !important; background: transparent !important; margin: 0 16px !important; padding: 8px 0 !important; }
.category-tabs :deep(.ant-tabs-tab-active) { color: #1890ff !important; border: none !important; }
.category-tabs :deep(.ant-tabs-ink-bar) { display: none !important; }
.category-tabs :deep(.ant-tabs-content-holder) { border: none !important; }
.category-tabs :deep(.ant-tabs-tab:hover) { background: transparent !important; color: #1890ff !important; }
.service-card { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.card-cover { height: 120px; background-size: cover; background-position: center; }
.card-content { padding: 12px; }
.card-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-desc { font-size: 12px; color: #666; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.card-tags { margin-bottom: 10px; display: flex; gap: 4px; flex-wrap: wrap; }
.card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding-top: 8px; border-top: 1px solid #f5f5f5; }
.price { color: #ff4d4f; font-weight: 600; font-size: 14px; }
.stats { color: #999; }
.platform-guarantee { margin-top: auto; padding: 20px 0; border-top: 1px solid #f0f0f0; background: #fafafa; }
.guarantee-list { display: flex; gap: 32px; justify-content: space-around; flex-wrap: nowrap; }
.guarantee-item { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.guarantee-icon { font-size: 20px; }
.guarantee-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
.guarantee-desc { font-size: 12px; color: #999; }
</style>
