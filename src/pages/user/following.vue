<template>
  <div class="following-page">
    <div class="page-header">
      <h2 class="page-title">关注动态</h2>
      <span class="page-subtitle">最近一周关注的人发布的最新内容</span>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <SmileOutlined class="empty-icon" />
        <p>暂无最新动态</p>
      </div>

      <div
        class="article-card"
        v-for="article in filteredArticles"
        :key="article.id"
        @click="$router.push({ path: '/user/forum-detail/' + article.id, query: { from: 'following' } })"
      >
        <div class="article-left">
          <div class="author-row">
            <a-avatar :size="28" :style="{ backgroundColor: article.authorColor }">{{ article.author[0] }}</a-avatar>
            <span class="author-name">{{ article.author }}</span>
            <a-tag v-if="article.isNew" color="red" size="small">NEW</a-tag>
          </div>
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-desc">{{ article.desc }}</p>
        </div>
        <div class="article-time">{{ article.publishTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { SmileOutlined } from '@ant-design/icons-vue'

// 当前时间基准
const followingUsers = ref([
  { id: 1, name: 'bkspiderx', color: '#1890ff', newCount: 2 },
  { id: 2, name: 'Agent学习路线', color: '#52c41a', newCount: 1 },
  { id: 3, name: 'RR1335', color: '#faad14', newCount: 3 },
  { id: 4, name: 'DB技术专家', color: '#9c27b0', newCount: 0 },
  { id: 5, name: '码上拿offer', color: '#ff4d4f', newCount: 1 }
])

const articles = ref([
  {
    id: 1, authorId: 1, author: 'bkspiderx', authorColor: '#1890ff',
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法。CPU调度通过时间分片和优先级排序实现多任务并发...',
    category: '操作系统', publishTime: '2026-02-27 10:30',
    readCount: '1.5k', likeCount: 34, commentCount: 8,
    cover: '', isNew: true
  },
  {
    id: 2, authorId: 3, author: 'RR1335', authorColor: '#faad14',
    title: 'NASA Artemis IV: Building First Lunar Space Station',
    desc: 'NASA公布推进阿尔忒弥斯IV任务，计划在月球轨道建设首个空间站"门户"。该任务将采用升级版SLS火箭...',
    category: '科技资讯', publishTime: '2026-02-26 14:20',
    readCount: '1.3k', likeCount: 33, commentCount: 12,
    cover: 'https://via.placeholder.com/160x100/1890ff/FFFFFF?text=NASA', isNew: true
  },
  {
    id: 3, authorId: 2, author: 'Agent学习路线', authorColor: '#52c41a',
    title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南！',
    desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段重点内数学、统计和机器学习基础，进阶阶段...',
    category: '人工智能', publishTime: '2026-02-25 09:00',
    readCount: '2.1k', likeCount: 47, commentCount: 15,
    cover: 'https://via.placeholder.com/160x100/52c41a/FFFFFF?text=AI', isNew: true
  },
  {
    id: 4, authorId: 1, author: 'bkspiderx', authorColor: '#1890ff',
    title: '内存管理深度解析：虚拟内存与页面置换算法',
    desc: '虚拟内存是现代操作系统的核心特性之一，通过地址映射让每个进程拥有独立的地址空间，本文深入分析其实现原理...',
    category: '操作系统', publishTime: '2026-02-24 16:45',
    readCount: '980', likeCount: 28, commentCount: 6,
    cover: '', isNew: true
  },
  {
    id: 5, authorId: 5, author: '码上拿offer', authorColor: '#ff4d4f',
    title: '2026年Java面试最新高频题汇总：Spring、JVM、并发一网打尽',
    desc: '整理了2026年最新Java面试高频考点，涵盖Spring框架原理、JVM调优、多线程并发、分布式系统设计等核心模块...',
    category: 'Java', publishTime: '2026-02-23 11:00',
    readCount: '3.2k', likeCount: 156, commentCount: 42,
    cover: 'https://via.placeholder.com/160x100/ff4d4f/FFFFFF?text=Java', isNew: true
  },
  {
    id: 6, authorId: 3, author: 'RR1335', authorColor: '#faad14',
    title: 'WebAssembly 2026：前端性能革命的下一站',
    desc: 'WebAssembly正在改变前端开发的边界，本文探讨WASM在2026年的最新进展、应用场景以及与JavaScript的协作模式...',
    category: '前端', publishTime: '2026-02-22 08:30',
    readCount: '760', likeCount: 19, commentCount: 5,
    cover: '', isNew: true
  },
  {
    id: 7, authorId: 3, author: 'RR1335', authorColor: '#faad14',
    title: 'Rust语言在系统编程中的实践：内存安全与高性能并行',
    desc: 'Rust凭借其独特的所有权系统在系统编程领域崭露头角，本文通过实际案例分析Rust如何在保证内存安全的同时实现高性能...',
    category: '系统编程', publishTime: '2026-02-21 15:10',
    readCount: '1.1k', likeCount: 45, commentCount: 11,
    cover: 'https://via.placeholder.com/160x100/9c27b0/FFFFFF?text=Rust', isNew: true
  },
  // 一周前的文章（不显示 NEW）
  {
    id: 8, authorId: 4, author: 'DB技术专家', authorColor: '#9c27b0',
    title: 'MySQL 8.0 新特性深度解析',
    desc: 'MySQL 8.0带来了众多新特性，包括窗口函数、公用表表达式、不可见索引等，本文逐一深入解析这些特性的使用场景...',
    category: 'MySQL', publishTime: '2026-02-15 10:00',
    readCount: '2.4k', likeCount: 88, commentCount: 23,
    cover: 'https://via.placeholder.com/160x100/FF6600/FFFFFF?text=MySQL', isNew: false
  }
])

const filteredArticles = computed(() => {
  const oneWeekAgo = new Date('2026-02-21T00:00:00')
  return articles.value
    .filter(a => new Date(a.publishTime) >= oneWeekAgo)
    .sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
})
</script>

<style scoped>
.following-page { width: 100%; }

.page-header { margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #999; }

.following-users { display: none; }

.article-list { display: flex; flex-direction: column; gap: 0; background: #fff; border-radius: 8px; overflow: hidden; }

.empty-state { padding: 60px; text-align: center; color: #ccc; }
.empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

.article-card { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding: 16px 24px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.article-card:last-child { border-bottom: none; }
.article-card:hover { background: #fafafa; }

.article-left { flex: 1; min-width: 0; }
.author-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.author-name { font-size: 13px; font-weight: 600; color: #333; }

.article-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0 0 6px; line-height: 1.4; }
.article-card:hover .article-title { color: #1890ff; }
.article-desc { font-size: 13px; color: #888; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.article-time { font-size: 12px; color: #bbb; white-space: nowrap; flex-shrink: 0; padding-top: 2px; }
</style>
