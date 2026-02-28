<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>

    <a-tabs v-model:activeKey="activeTab" class="fav-tabs">
      <!-- 服务市场 -->
      <a-tab-pane key="service" tab="服务市场">
        <div class="fav-list">
          <div v-if="serviceItems.length === 0" class="empty-state">暂无收藏的服务</div>
          <div
            class="fav-item"
            v-for="item in serviceItems"
            :key="item.id"
            @click="$router.push({ path: '/user/service-detail/' + item.id, query: { from: 'favorites' } })"
          >
            <img :src="item.cover" class="fav-cover" />
            <div class="fav-info">
              <div class="fav-title">{{ item.title }}</div>
              <div class="fav-desc">{{ item.desc }}</div>
              <div class="fav-meta">
                <a-tag v-for="tag in item.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
              </div>
            </div>
            <div class="fav-right">
              <div class="fav-price">¥ {{ item.price }}</div>
              <a-button size="small" danger @click.stop="removeItem(serviceItems, item.id)">取消收藏</a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 需求悬赏 -->
      <a-tab-pane key="demand" tab="需求悬赏">
        <div class="fav-list">
          <div v-if="demandItems.length === 0" class="empty-state">暂无收藏的需求</div>
          <div
            class="fav-item"
            v-for="item in demandItems"
            :key="item.id"
            @click="$router.push({ path: '/user/demand-detail/' + item.id, query: { from: 'favorites' } })"
          >
            <div class="fav-info">
              <div class="fav-title">{{ item.title }}</div>
              <div class="fav-desc">{{ item.desc }}</div>
              <div class="fav-meta">
                <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                <span class="fav-time">{{ item.publishTime }}</span>
              </div>
            </div>
            <div class="fav-right">
              <div class="fav-price">¥ {{ item.budget }}</div>
              <a-button size="small" danger @click.stop="removeItem(demandItems, item.id)">取消收藏</a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 技术论坛 -->
      <a-tab-pane key="forum" tab="技术论坛">
        <div class="fav-list">
          <div v-if="forumItems.length === 0" class="empty-state">暂无收藏的文章</div>
          <div
            class="fav-item"
            v-for="item in forumItems"
            :key="item.id"
            @click="$router.push({ path: '/user/forum-detail/' + item.id, query: { from: 'favorites' } })"
          >
            <div class="fav-info">
              <div class="fav-author-row">
                <a-avatar :size="20" :style="{ backgroundColor: item.authorColor }">{{ item.author[0] }}</a-avatar>
                <span class="fav-author">{{ item.author }}</span>
                <span class="fav-time">{{ item.publishTime }}</span>
              </div>
              <div class="fav-title">{{ item.title }}</div>
              <div class="fav-desc">{{ item.desc }}</div>
              <div class="fav-meta">
                <a-tag size="small">{{ item.category }}</a-tag>
                <span class="fav-stat"><EyeOutlined /> {{ item.readCount }}</span>
                <span class="fav-stat"><LikeOutlined /> {{ item.likeCount }}</span>
              </div>
            </div>
            <div class="fav-right">
              <a-button size="small" danger @click.stop="removeItem(forumItems, item.id)">取消收藏</a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { EyeOutlined, LikeOutlined } from '@ant-design/icons-vue'

const activeTab = ref('service')

const serviceItems = ref([
  { id: 1, title: 'Java大厂面试题 一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟', price: 399, cover: 'https://via.placeholder.com/80x60/FFD700/000000?text=Java', tags: ['平台保障', '商家认证'] },
  { id: 3, title: '颠覆你认知的八股盛宴', desc: '打破传统八股文，结合实战场景讲解，让面试官眼前一亮', price: 399, cover: 'https://via.placeholder.com/80x60/FF4444/FFFFFF?text=八股文', tags: ['平台保障', '一对一辅导'] }
])

const demandItems = ref([
  { id: 1, title: 'MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发', desc: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别', budget: '3800.00', type: '人工智能', publishTime: '2026-03-03' },
  { id: 2, title: 'PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率', desc: '基于PaddleOCR开发文档智能识别系统，支持表格、印章、手写体等多种场景', budget: '3800.00', type: 'Python', publishTime: '2026-03-02' }
])

const forumItems = ref([
  { id: 1, author: 'bkspiderx', authorColor: '#1890ff', title: '深入解析CPU调度：操作系统的核心资源分配机制', desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法...', category: '操作系统', publishTime: '2026-02-27', readCount: '1.5k', likeCount: 34 },
  { id: 3, author: 'Agent学习路线', authorColor: '#52c41a', title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南！', desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段...', category: '人工智能', publishTime: '2026-02-25', readCount: '2.1k', likeCount: 47 }
])

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

.fav-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.fav-item:last-child { border-bottom: none; }
.fav-item:hover { background: #fafafa; }

.fav-cover { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.fav-info { flex: 1; min-width: 0; }
.fav-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-item:hover .fav-title { color: #1890ff; }
.fav-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-meta { display: flex; align-items: center; gap: 10px; }
.fav-time { font-size: 12px; color: #ccc; }
.fav-stat { font-size: 12px; color: #bbb; display: flex; align-items: center; gap: 3px; }

.fav-author-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.fav-author { font-size: 13px; font-weight: 600; color: #555; }

.fav-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.fav-price { font-size: 16px; font-weight: 700; color: #ff4d4f; }
</style>
