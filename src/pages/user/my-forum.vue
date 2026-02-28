<template>
  <div class="my-forum-page">
    <div class="page-header">
      <h2 class="page-title">我的论坛</h2>
      <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="router.push('/user/write-article')">
        <PlusOutlined /> 写文章
      </a-button>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-num" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <a-tabs v-model:activeKey="statusFilter" class="status-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="published" tab="已发布" />
        <a-tab-pane key="draft" tab="草稿" />
        <a-tab-pane key="review" tab="审核中" />
      </a-tabs>
      <div style="display:flex;align-items:center;gap:8px">
        <a-select v-model:value="sortBy" style="width:110px" size="small">
          <a-select-option value="time">最新发布</a-select-option>
          <a-select-option value="read">阅读最多</a-select-option>
          <a-select-option value="like">获赞最多</a-select-option>
        </a-select>
        <a-input-search v-model:value="searchKeyword" placeholder="搜索文章" style="width:200px" />
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div v-if="filteredList.length === 0" class="empty-state">
        <EditOutlined style="font-size:48px;color:#e0e0e0" />
        <p>暂无文章，去写一篇吧</p>
      </div>

      <div class="article-item" v-for="item in filteredList" :key="item.id">
        <img v-if="item.cover" :src="item.cover" class="article-cover" />
        <div class="article-info">
          <div class="article-title">{{ item.title }}</div>
          <div class="article-desc">{{ item.desc }}</div>
          <div class="article-meta">
            <a-tag size="small" color="blue">{{ item.category }}</a-tag>
            <span><EyeOutlined /> {{ item.readCount }}</span>
            <span><LikeOutlined /> {{ item.likeCount }}</span>
            <span><MessageOutlined /> {{ item.commentCount }}</span>
            <span class="article-time">{{ item.publishTime }}</span>
          </div>
        </div>
        <div class="article-right">
          <a-tag :color="statusMap[item.status].color" size="small">{{ statusMap[item.status].text }}</a-tag>
          <div class="article-actions">
            <a-button size="small" @click="router.push('/user/write-article')">编辑</a-button>
            <a-popconfirm title="确认删除该文章？" ok-text="删除" cancel-text="取消" @confirm="deleteItem(item.id)">
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const statusFilter = ref('all')
const searchKeyword = ref('')
const sortBy = ref('time')

const statusMap = {
  published: { text: '已发布', color: 'green' },
  draft:     { text: '草稿',   color: 'default' },
  review:    { text: '审核中', color: 'orange' }
}

const statCards = ref([
  { label: '文章总数', value: 6, color: '#1890ff' },
  { label: '总阅读量', value: '12.5k', color: '#52c41a' },
  { label: '总获赞', value: '3.8k', color: '#ff4d4f' },
  { label: '总评论', value: 286, color: '#722ed1' }
])

const articles = ref([
  { id: 1, title: '深入解析CPU调度：操作系统的核心资源分配机制', desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法...', category: '操作系统', cover: 'https://placehold.co/100x70/1890ff/FFFFFF?text=OS', status: 'published', readCount: '1.5k', likeCount: 34, commentCount: 12, publishTime: '2026-02-27' },
  { id: 2, title: 'Vue3 Composition API 最佳实践总结', desc: '深入讲解 Vue3 组合式 API 的使用技巧，包括 setup、响应式、生命周期等核心概念...', category: 'Vue', cover: 'https://placehold.co/100x70/42b883/FFFFFF?text=Vue3', status: 'published', readCount: '2.3k', likeCount: 67, commentCount: 23, publishTime: '2026-02-20' },
  { id: 3, title: 'Docker容器化部署实战指南', desc: '从Docker基础到生产环境部署，手把手带你完成容器化改造...', category: '运维', cover: 'https://placehold.co/100x70/0db7ed/FFFFFF?text=Docker', status: 'draft', readCount: 0, likeCount: 0, commentCount: 0, publishTime: '2026-02-15' },
  { id: 4, title: 'AI大模型大师秘籍：2025AI技术全景揭秘', desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段循序渐进...', category: '人工智能', cover: 'https://placehold.co/100x70/52c41a/FFFFFF?text=AI', status: 'published', readCount: '2.1k', likeCount: 47, commentCount: 18, publishTime: '2026-02-10' },
  { id: 5, title: 'Spring Boot 3.x 新特性全解析', desc: 'Spring Boot 3.x 带来了众多重磅更新，包括虚拟线程、原生镜像等...', category: 'Java', cover: 'https://placehold.co/100x70/ff4d4f/FFFFFF?text=Java', status: 'review', readCount: 0, likeCount: 0, commentCount: 0, publishTime: '2026-03-01' },
  { id: 6, title: 'MySQL 索引优化实战：从慢查询到毫秒响应', desc: '通过真实案例讲解MySQL索引设计原则，EXPLAIN分析，慢查询优化...', category: '数据库', cover: 'https://placehold.co/100x70/FF6600/FFFFFF?text=MySQL', status: 'published', readCount: '3.2k', likeCount: 156, commentCount: 42, publishTime: '2026-01-25' }
])

const filteredList = computed(() => {
  let list = articles.value
  if (statusFilter.value !== 'all') list = list.filter(a => a.status === statusFilter.value)
  if (searchKeyword.value.trim()) list = list.filter(a => a.title.includes(searchKeyword.value.trim()))
  return list
})

const deleteItem = (id) => {
  articles.value = articles.value.filter(a => a.id !== id)
  statCards.value[0].value = articles.value.length
  message.success('已删除')
}
</script>

<style scoped>
.my-forum-page { width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0; }

.stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-card { flex: 1; background: #fff; border-radius: 8px; padding: 16px 20px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: #999; }

.filter-bar { background: #fff; border-radius: 8px 8px 0 0; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.status-tabs :deep(.ant-tabs-nav) { margin: 0; }
.status-tabs :deep(.ant-tabs-nav::before) { border: none; }
.status-tabs :deep(.ant-tabs-nav-operations) { display: none !important; }

.article-list { background: #fff; border-radius: 0 0 8px 8px; }
.empty-state { padding: 60px; text-align: center; color: #ccc; display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 14px; }

.article-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; }
.article-item:last-child { border-bottom: none; }
.article-cover { width: 100px; height: 70px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.article-info { flex: 1; min-width: 0; }
.article-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.article-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.article-meta { display: flex; align-items: center; gap: 14px; font-size: 12px; color: #bbb; }
.article-time { margin-left: auto; }

.article-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.article-actions { display: flex; gap: 6px; }
</style>
