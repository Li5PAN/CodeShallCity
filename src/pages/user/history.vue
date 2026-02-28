<template>
  <div class="history-page">
    <h2 class="page-title">浏览历史</h2>

    <a-tabs v-model:activeKey="activeTab" class="history-tabs">
      <!-- 服务市场 -->
      <a-tab-pane key="service" tab="服务市场">
        <div class="history-list">
          <div v-if="serviceItems.length === 0" class="empty-state">暂无浏览记录</div>
          <div
            class="history-item"
            v-for="item in serviceItems"
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
            </div>
            <div class="history-right">
              <div class="history-price">¥ {{ item.price }}</div>
              <div class="history-time">{{ item.viewTime }}</div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 需求悬赏 -->
      <a-tab-pane key="demand" tab="需求悬赏">
        <div class="history-list">
          <div v-if="demandItems.length === 0" class="empty-state">暂无浏览记录</div>
          <div
            class="history-item"
            v-for="item in demandItems"
            :key="item.id"
            @click="goDetail('demand', item.id)"
          >
            <div class="history-info">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-desc">{{ item.desc }}</div>
              <div class="history-meta">
                <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                <span class="history-time-inline">{{ item.publishTime }}</span>
              </div>
            </div>
            <div class="history-right">
              <div class="history-price">¥ {{ item.budget }}</div>
              <div class="history-time">{{ item.viewTime }}</div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 技术论坛 -->
      <a-tab-pane key="forum" tab="技术论坛">
        <div class="history-list">
          <div v-if="forumItems.length === 0" class="empty-state">暂无浏览记录</div>
          <div
            class="history-item"
            v-for="item in forumItems"
            :key="item.id"
            @click="goDetail('forum', item.id)"
          >
            <div class="history-info">
              <div class="history-author-row">
                <a-avatar :size="20" :style="{ backgroundColor: item.authorColor }">{{ item.author[0] }}</a-avatar>
                <span class="history-author">{{ item.author }}</span>
                <span class="history-time-inline">{{ item.publishTime }}</span>
              </div>
              <div class="history-title">{{ item.title }}</div>
              <div class="history-desc">{{ item.desc }}</div>
              <div class="history-meta">
                <a-tag size="small">{{ item.category }}</a-tag>
                <span class="history-stat"><EyeOutlined /> {{ item.readCount }}</span>
                <span class="history-stat"><LikeOutlined /> {{ item.likeCount }}</span>
              </div>
            </div>
            <div class="history-right">
              <div class="history-time">{{ item.viewTime }}</div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeOutlined, LikeOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const activeTab = ref('service')

const goDetail = (type, id) => {
  const routeMap = {
    service: 'ServiceDetail',
    demand: 'DemandDetail',
    forum: 'ForumDetail'
  }
  router.push({ name: routeMap[type], params: { id } })
}

const serviceItems = ref([
  { id: 1, title: 'Java大厂面试课，一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟', price: 399, cover: 'https://placehold.co/80x60/FFD700/000000?text=Java', tags: ['平台保障', '商家认证'], viewTime: '今天 14:32' },
  { id: 2, title: 'Vue3 + TypeScript 企业级实战', desc: '从零搭建企业级前端项目，涵盖架构设计、性能优化、工程化实践', price: 299, cover: 'https://placehold.co/80x60/42b883/FFFFFF?text=Vue3', tags: ['平台保障'], viewTime: '今天 10:15' },
  { id: 3, title: '颠覆你认知的八股盛宴', desc: '打破传统八股文，结合实战场景讲解，让面试官眼前一亮', price: 399, cover: 'https://placehold.co/80x60/FF4444/FFFFFF?text=八股', tags: ['平台保障', '一对一辅导'], viewTime: '昨天 20:08' }
])

const demandItems = ref([
  { id: 1, title: 'MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发', desc: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别', budget: '3800.00', type: '人工智能', publishTime: '2026-03-03', viewTime: '今天 16:20' },
  { id: 2, title: 'PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率', desc: '基于PaddleOCR开发文档智能识别系统，支持表格、印章、手写体等多种场景', budget: '3800.00', type: 'Python', publishTime: '2026-03-02', viewTime: '昨天 11:45' },
  { id: 3, title: 'React Native 跨平台移动端应用开发', desc: '开发一款电商类App，需要支持iOS和Android双端，包含商品浏览、购物车、支付', budget: '12000.00', type: '移动开发', publishTime: '2026-02-28', viewTime: '昨天 09:30' }
])

const forumItems = ref([
  { id: 1, author: 'bkspiderx', authorColor: '#1890ff', title: '深入解析CPU调度：操作系统的核心资源分配机制', desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法...', category: '操作系统', publishTime: '2026-02-27', readCount: '1.5k', likeCount: 34, viewTime: '今天 15:10' },
  { id: 2, author: 'devmaster', authorColor: '#722ed1', title: 'Rust 所有权机制深度解析：从入门到真正理解', desc: '通过大量示例讲解Rust所有权、借用、生命周期，彻底搞懂内存安全...', category: 'Rust', publishTime: '2026-02-26', readCount: '3.2k', likeCount: 89, viewTime: '今天 09:05' },
  { id: 3, author: 'Agent学习路线', authorColor: '#52c41a', title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南', desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段循序渐进...', category: '人工智能', publishTime: '2026-02-25', readCount: '2.1k', likeCount: 47, viewTime: '昨天 22:18' }
])
</script>

<style scoped>
.history-page { width: 100%; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 16px; }

.history-tabs :deep(.ant-tabs-nav) { background: #fff; border-radius: 8px 8px 0 0; padding: 0 16px; margin-bottom: 0; }
.history-tabs :deep(.ant-tabs-content-holder) { background: #fff; border-radius: 0 0 8px 8px; padding: 0 0 8px; }

.history-list { display: flex; flex-direction: column; }
.empty-state { padding: 48px; text-align: center; color: #ccc; font-size: 14px; }

.history-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.history-item:last-child { border-bottom: none; }
.history-item:hover { background: #fafafa; }

.history-cover { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.history-info { flex: 1; min-width: 0; }
.history-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-item:hover .history-title { color: #1890ff; }
.history-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-meta { display: flex; align-items: center; gap: 10px; }
.history-time-inline { font-size: 12px; color: #ccc; }
.history-stat { font-size: 12px; color: #bbb; display: flex; align-items: center; gap: 3px; }

.history-author-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.history-author { font-size: 13px; font-weight: 600; color: #555; }

.history-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.history-price { font-size: 16px; font-weight: 700; color: #ff4d4f; }
.history-time { font-size: 12px; color: #bbb; white-space: nowrap; }
</style>
