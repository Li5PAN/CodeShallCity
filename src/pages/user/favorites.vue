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
import { ref, computed, inject } from 'vue'
import { EyeOutlined, LikeOutlined, StarOutlined, UserOutlined } from '@ant-design/icons-vue'

const openDetail = inject('openDetail')

const activeTab = ref('service')

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

// 服务市场收藏数据 - 8条
const serviceItems = ref([
  {
    id: 1,
    title: 'Java大厂面试题 一套搞定offer',
    desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟，助你轻松拿下大厂offer',
    price: 399,
    sales: 1200,
    cover: 'https://placehold.co/120x90/FFD700/000000?text=Java',
    tags: ['平台保障', '商家认证', '7天无理由'],
    sellerName: '码上拿offer',
    sellerOrders: 3200,
    sellerColor: '#1890ff'
  },
  {
    id: 2,
    title: '10天精通MySQL 讲的特别深入的那种',
    desc: '从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表',
    price: 399,
    sales: 860,
    cover: 'https://placehold.co/120x90/FF6600/FFFFFF?text=MySQL',
    tags: ['平台保障', '官方认证', '终身更新'],
    sellerName: 'DB技术专家',
    sellerOrders: 1800,
    sellerColor: '#52c41a'
  },
  {
    id: 3,
    title: 'Vue3 + TypeScript 企业级实战',
    desc: '从零搭建企业级前端项目，涵盖架构设计、性能优化、工程化实践',
    price: 299,
    sales: 560,
    cover: 'https://placehold.co/120x90/42b883/FFFFFF?text=Vue3',
    tags: ['平台保障', '项目实战', '源码解析'],
    sellerName: '前端架构师',
    sellerOrders: 960,
    sellerColor: '#eb2f96'
  },
  {
    id: 4,
    title: 'Docker + K8s 容器化部署实战',
    desc: '从Docker基础到Kubernetes集群管理，企业级DevOps实践',
    price: 499,
    sales: 320,
    cover: 'https://placehold.co/120x90/0db7ed/FFFFFF?text=Docker',
    tags: ['平台保障', 'DevOps认证'],
    sellerName: '运维架构师',
    sellerOrders: 680,
    sellerColor: '#1890ff'
  },
  {
    id: 5,
    title: 'Spring Cloud 微服务架构实战',
    desc: '从Spring Boot到Cloud全套实战，含Nacos、Sentinel、Seata等主流技术栈',
    price: 599,
    sales: 480,
    cover: 'https://placehold.co/120x90/52c41a/FFFFFF?text=Spring',
    tags: ['平台保障', '微服务认证', '7天无理由'],
    sellerName: 'Java架构师老王',
    sellerOrders: 1500,
    sellerColor: '#fa8c16'
  },
  {
    id: 6,
    title: 'React18 + Redux Toolkit 企业级实战',
    desc: 'React18新特性、RTK状态管理、性能优化、大型项目架构设计',
    price: 349,
    sales: 290,
    cover: 'https://placehold.co/120x90/61dafb/000000?text=React',
    tags: ['平台保障', 'TS认证'],
    sellerName: 'React技术专家',
    sellerOrders: 720,
    sellerColor: '#722ed1'
  },
  {
    id: 7,
    title: 'Python数据分析与可视化实战',
    desc: 'Pandas、NumPy、Matplotlib、ECharts，从数据处理到可视化呈现',
    price: 299,
    sales: 650,
    cover: 'https://placehold.co/120x90/ff4d4f/FFFFFF?text=Python',
    tags: ['平台保障', '数据分析认证'],
    sellerName: '数据分析师小李',
    sellerOrders: 1100,
    sellerColor: '#13c2c2'
  },
  {
    id: 8,
    title: 'Go语言微服务开发实战',
    desc: 'gRPC、K8s、Gin框架、Prometheus监控，打造高性能微服务',
    price: 449,
    sales: 180,
    cover: 'https://placehold.co/120x90/1890ff/FFFFFF?text=Go',
    tags: ['平台保障', 'Go语言认证'],
    sellerName: 'Go语言布道师',
    sellerOrders: 540,
    sellerColor: '#52c41a'
  }
])

// 需求悬赏收藏数据 - 5条
const demandItems = ref([
  {
    id: 1,
    title: 'MiniMax-M2.1 智能客服系统开发',
    desc: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别和知识库问答功能',
    budgetMin: 3000,
    budgetMax: 5000,
    type: '人工智能',
    urgency: '紧急',
    applyCount: 12,
    deadline: '2026-03-31'
  },
  {
    id: 2,
    title: 'React Native 跨平台移动端应用',
    desc: '开发一款电商类App，需要支持iOS和Android双端，包含商品浏览、购物车、订单管理等功能',
    budgetMin: 10000,
    budgetMax: 15000,
    type: '移动开发',
    urgency: '一般',
    applyCount: 7,
    deadline: '2026-04-15'
  },
  {
    id: 5,
    title: 'Spring Cloud 微服务架构改造',
    desc: '将现有单体应用拆分为微服务架构，包含用户服务、订单服务、支付服务等模块',
    budgetMin: 20000,
    budgetMax: 30000,
    type: 'Java',
    urgency: '紧急',
    applyCount: 15,
    deadline: '2026-05-01'
  },
  {
    id: 8,
    title: 'iOS 短视频社交App开发',
    desc: '开发一款类似抖音的短视频社交应用，支持拍摄、剪辑、特效等功能',
    budgetMin: 30000,
    budgetMax: 50000,
    type: '移动开发',
    urgency: '紧急',
    applyCount: 20,
    deadline: '2026-06-01'
  },
  {
    id: 13,
    title: 'Go语言高性能API网关开发',
    desc: '使用Go语言开发高性能API网关，支持负载均衡、熔断、限流等功能',
    budgetMin: 15000,
    budgetMax: 22000,
    type: 'Go语言',
    urgency: '紧急',
    applyCount: 9,
    deadline: '2026-05-01'
  }
])

// 技术论坛收藏数据 - 7条
const forumItems = ref([
  {
    id: 1,
    author: 'bkspiderx',
    authorColor: '#1890ff',
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法，包括FCFS、SJF、优先级调度和时间片轮转...',
    category: '操作系统',
    tagColor: 'blue',
    publishTime: '2026-02-20',
    readCount: '1.5k',
    likeCount: 34,
    collectCount: 11,
    cover: 'https://placehold.co/100x80/1890ff/FFFFFF?text=OS'
  },
  {
    id: 2,
    author: 'Agent学习路线',
    authorColor: '#52c41a',
    title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南',
    desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段重点学数学、统计和机器学习基础...',
    category: '人工智能',
    tagColor: 'green',
    publishTime: '2026-02-25',
    readCount: '2.1k',
    likeCount: 47,
    collectCount: 14,
    cover: 'https://placehold.co/100x80/52c41a/FFFFFF?text=AI'
  },
  {
    id: 4,
    author: 'Java架构师',
    authorColor: '#ff4d4f',
    title: 'Spring Boot 3.x 新特性全解析：从虚拟线程到原生镜像',
    desc: 'Spring Boot 3.x 带来了众多重磅更新，包括对Java 21虚拟线程的支持、GraalVM原生镜像编译优化...',
    category: 'Java',
    tagColor: 'red',
    publishTime: '2026-02-24',
    readCount: '3.2k',
    likeCount: 156,
    collectCount: 42,
    cover: 'https://placehold.co/100x80/ff4d4f/FFFFFF?text=Java'
  },
  {
    id: 7,
    author: '前端观察',
    authorColor: '#eb2f96',
    title: 'Vue3 Composition API 最佳实践：从入门到精通',
    desc: 'Vue3的Composition API彻底改变了我们组织组件逻辑的方式，本文分享在实际项目中使用Vue3的最佳实践...',
    category: 'Vue',
    tagColor: 'magenta',
    publishTime: '2026-02-21',
    readCount: '4.5k',
    likeCount: 234,
    collectCount: 67,
    cover: 'https://placehold.co/100x80/eb2f96/FFFFFF?text=Vue3'
  },
  {
    id: 9,
    author: 'MCP开发者',
    authorColor: '#52c41a',
    title: 'MCP协议详解：让AI模型更智能地与外部工具交互',
    desc: 'Model Context Protocol (MCP) 是Anthropic推出的开放协议，本文详细解析MCP的工作原理和应用场景...',
    category: 'MCP',
    tagColor: 'green',
    publishTime: '2026-02-18',
    readCount: '3.1k',
    likeCount: 145,
    collectCount: 52,
    cover: 'https://placehold.co/100x80/52c41a/FFFFFF?text=MCP'
  },
  {
    id: 10,
    author: 'DeepSeek官方',
    authorColor: '#fa8c16',
    title: 'DeepSeek-R1技术报告：推理能力与训练方法揭秘',
    desc: 'DeepSeek团队发布R1模型技术报告，详细介绍了长思维链推理能力的训练方法和模型架构创新...',
    category: 'DeepSeek',
    tagColor: 'orange',
    publishTime: '2026-02-17',
    readCount: '8.7k',
    likeCount: 567,
    collectCount: 189,
    cover: 'https://placehold.co/100x80/fa8c16/FFFFFF?text=DeepSeek'
  },
  {
    id: 30,
    author: 'AI应用开发者',
    authorColor: '#722ed1',
    title: 'LangChain与LLM应用开发：大模型落地方案',
    desc: 'LangChain让基于大模型的应用开发变得简单，本文讲解 Chains、Agents 和 Memory 的使用...',
    category: 'AI应用',
    tagColor: 'purple',
    publishTime: '2026-01-28',
    readCount: '4.2k',
    likeCount: 213,
    collectCount: 72,
    cover: 'https://placehold.co/100x80/722ed1/FFFFFF?text=LangChain'
  }
])
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
