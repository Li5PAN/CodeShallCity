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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { EyeOutlined, LikeOutlined, StarOutlined, UserOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const activeTab = ref('service')

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

// 服务市场浏览历史 - 10条
const serviceItems = ref([
  { id: 1, title: 'Java大厂面试题 一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟，助你轻松拿下大厂offer', price: 399, sales: 1200, cover: 'https://placehold.co/120x90/FFD700/000000?text=Java', tags: ['平台保障', '商家认证', '7天无理由'], sellerName: '码上拿offer', sellerOrders: 3200, sellerColor: '#1890ff', viewTime: '今天 14:32' },
  { id: 2, title: '10天精通MySQL 讲的特别深入的那种', desc: '从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表', price: 399, sales: 860, cover: 'https://placehold.co/120x90/FF6600/FFFFFF?text=MySQL', tags: ['平台保障', '官方认证', '终身更新'], sellerName: 'DB技术专家', sellerOrders: 1800, sellerColor: '#52c41a', viewTime: '今天 11:20' },
  { id: 3, title: 'Vue3 + TypeScript 企业级实战', desc: '从零搭建企业级前端项目，涵盖架构设计、性能优化、工程化实践', price: 299, sales: 560, cover: 'https://placehold.co/120x90/42b883/FFFFFF?text=Vue3', tags: ['平台保障', 'TS认证'], sellerName: '前端架构师', sellerOrders: 960, sellerColor: '#eb2f96', viewTime: '今天 10:15' },
  { id: 4, title: 'Docker + K8s 容器化部署实战', desc: '从Docker基础到Kubernetes集群管理，企业级DevOps实践', price: 499, sales: 320, cover: 'https://placehold.co/120x90/0db7ed/FFFFFF?text=Docker', tags: ['平台保障', 'DevOps认证'], sellerName: '运维架构师', sellerOrders: 680, sellerColor: '#1890ff', viewTime: '今天 09:30' },
  { id: 5, title: 'Spring Cloud 微服务架构实战', desc: '从Spring Boot到Cloud全套实战，含Nacos、Sentinel、Seata等主流技术栈', price: 599, sales: 480, cover: 'https://placehold.co/120x90/52c41a/FFFFFF?text=Spring', tags: ['平台保障', '微服务认证'], sellerName: 'Java架构师老王', sellerOrders: 1500, sellerColor: '#fa8c16', viewTime: '昨天 20:45' },
  { id: 6, title: 'React18 + Redux Toolkit 企业级实战', desc: 'React18新特性、RTK状态管理、性能优化、大型项目架构设计', price: 349, sales: 290, cover: 'https://placehold.co/120x90/61dafb/000000?text=React', tags: ['平台保障', 'TS认证'], sellerName: 'React技术专家', sellerOrders: 720, sellerColor: '#722ed1', viewTime: '昨天 18:20' },
  { id: 7, title: 'Python数据分析与可视化实战', desc: 'Pandas、NumPy、Matplotlib、ECharts，从数据处理到可视化呈现', price: 299, sales: 650, cover: 'https://placehold.co/120x90/ff4d4f/FFFFFF?text=Python', tags: ['平台保障', '数据分析认证'], sellerName: '数据分析师小李', sellerOrders: 1100, sellerColor: '#13c2c2', viewTime: '昨天 15:30' },
  { id: 8, title: 'Go语言微服务开发实战', desc: 'gRPC、K8s、Gin框架、Prometheus监控，打造高性能微服务', price: 449, sales: 180, cover: 'https://placehold.co/120x90/1890ff/FFFFFF?text=Go', tags: ['平台保障', 'Go语言认证'], sellerName: 'Go语言布道师', sellerOrders: 540, sellerColor: '#52c41a', viewTime: '昨天 11:00' },
  { id: 9, title: '机器学习算法工程师培养计划', desc: '西瓜书+李航书+ Kaggle竞赛，系统培养算法能力', price: 899, sales: 420, cover: 'https://placehold.co/120x90/f5222d/FFFFFF?text=ML', tags: ['平台保障', 'AI认证'], sellerName: '算法工坊', sellerOrders: 890, sellerColor: '#f5222d', viewTime: '前天 22:15' },
  { id: 10, title: '区块链智能合约开发从入门到精通', desc: 'Solidity、Web3.js、Truffle框架，开发以太坊DApp', price: 599, sales: 260, cover: 'https://placehold.co/120x90/722ed1/FFFFFF?text=ETH', tags: ['平台保障', '区块链认证'], sellerName: 'Web3开发者', sellerOrders: 620, sellerColor: '#722ed1', viewTime: '前天 16:40' }
])

// 需求悬赏浏览历史 - 7条
const demandItems = ref([
  { id: 1, title: 'MiniMax-M2.1 智能客服系统开发', desc: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别和知识库问答功能', budgetMin: 3000, budgetMax: 5000, type: '人工智能', urgency: '紧急', applyCount: 12, publishTime: '2026-03-03', deadline: '2026-03-31', viewTime: '今天 16:20' },
  { id: 2, title: 'React Native 跨平台移动端应用', desc: '开发一款电商类App，需要支持iOS和Android双端，包含商品浏览、购物车、订单管理等功能', budgetMin: 10000, budgetMax: 15000, type: '移动开发', urgency: '一般', applyCount: 7, publishTime: '2026-02-28', deadline: '2026-04-15', viewTime: '今天 14:50' },
  { id: 3, title: 'MySQL 数据库性能优化咨询', desc: '现有系统查询慢，需要专业DBA对数据库进行诊断和优化', budgetMin: 1500, budgetMax: 2500, type: '数据库', urgency: '一般', applyCount: 5, publishTime: '2026-02-10', deadline: '2026-02-28', viewTime: '昨天 11:45' },
  { id: 4, title: 'Vue3 后台管理系统开发', desc: '基于Vue3+Element Plus开发一套通用后台管理系统', budgetMin: 6000, budgetMax: 10000, type: 'Vue/React', urgency: '紧急', applyCount: 9, publishTime: '2026-03-01', deadline: '2026-04-01', viewTime: '昨天 09:30' },
  { id: 5, title: 'Spring Cloud 微服务架构改造', desc: '将现有单体应用拆分为微服务架构，包含用户服务、订单服务、支付服务等模块', budgetMin: 20000, budgetMax: 30000, type: 'Java', urgency: '紧急', applyCount: 15, publishTime: '2026-02-20', deadline: '2026-05-01', viewTime: '昨天 08:15' },
  { id: 6, title: 'Python 数据分析报告自动生成工具', desc: '开发一套数据分析工具，能够自动读取Excel/CSV数据并生成可视化报告', budgetMin: 2000, budgetMax: 4000, type: 'Python', urgency: '常规', applyCount: 4, publishTime: '2026-02-15', deadline: '2026-03-20', viewTime: '前天 19:20' },
  { id: 7, title: 'Docker 容器化部署与K8s集群搭建', desc: '将现有项目Docker容器化并部署到Kubernetes集群', budgetMin: 5000, budgetMax: 8000, type: '运维部署', urgency: '一般', applyCount: 6, publishTime: '2026-01-10', deadline: '2026-02-10', viewTime: '前天 14:00' }
])

// 技术论坛浏览历史 - 5条
const forumItems = ref([
  { id: 1, author: 'bkspiderx', authorColor: '#1890ff', title: '深入解析CPU调度：操作系统的核心资源分配机制', desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法，包括FCFS、SJF、优先级调度和时间片轮转...', category: '操作系统', tagColor: 'blue', publishTime: '2026-02-20', readCount: '1.5k', likeCount: 34, collectCount: 11, cover: 'https://placehold.co/100x80/1890ff/FFFFFF?text=OS', viewTime: '今天 15:10' },
  { id: 2, author: 'Agent学习路线', authorColor: '#52c41a', title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南', desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段重点学数学、统计和机器学习基础...', category: '人工智能', tagColor: 'green', publishTime: '2026-02-25', readCount: '2.1k', likeCount: 47, collectCount: 14, cover: 'https://placehold.co/100x80/52c41a/FFFFFF?text=AI', viewTime: '今天 12:30' },
  { id: 4, author: 'Java架构师', authorColor: '#ff4d4f', title: 'Spring Boot 3.x 新特性全解析：从虚拟线程到原生镜像', desc: 'Spring Boot 3.x 带来了众多重磅更新，包括对Java 21虚拟线程的支持、GraalVM原生镜像编译优化...', category: 'Java', tagColor: 'red', publishTime: '2026-02-24', readCount: '3.2k', likeCount: 156, collectCount: 42, cover: 'https://placehold.co/100x80/ff4d4f/FFFFFF?text=Java', viewTime: '昨天 22:18' },
  { id: 7, author: '前端观察', authorColor: '#eb2f96', title: 'Vue3 Composition API 最佳实践：从入门到精通', desc: 'Vue3的Composition API彻底改变了我们组织组件逻辑的方式，本文分享在实际项目中使用Vue3的最佳实践...', category: 'Vue', tagColor: 'magenta', publishTime: '2026-02-21', readCount: '4.5k', likeCount: 234, collectCount: 67, cover: 'https://placehold.co/100x80/eb2f96/FFFFFF?text=Vue3', viewTime: '昨天 18:45' },
  { id: 10, author: 'DeepSeek官方', authorColor: '#fa8c16', title: 'DeepSeek-R1技术报告：推理能力与训练方法揭秘', desc: 'DeepSeek团队发布R1模型技术报告，详细介绍了长思维链推理能力的训练方法和模型架构创新...', category: 'DeepSeek', tagColor: 'orange', publishTime: '2026-02-17', readCount: '8.7k', likeCount: 567, collectCount: 189, cover: 'https://placehold.co/100x80/fa8c16/FFFFFF?text=DeepSeek', viewTime: '前天 20:00' }
])
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
