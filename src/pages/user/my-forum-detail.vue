<template>
  <div class="forum-detail-page">
    <div class="detail-layout">
      <!-- 左侧文章主体 -->
      <div class="article-main">
        <!-- 标题区 -->
        <div class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <a-avatar :size="32" style="background-color: #1890ff">{{ article.author[0] }}</a-avatar>
            <span class="author-name">{{ article.author }}</span>
            <span class="meta-divider">·</span>
            <span class="publish-time">{{ article.publishTime }}</span>
            <span class="meta-divider">·</span>
            <a-tag color="blue">{{ article.category }}</a-tag>
          </div>
          <div class="article-stats">
            <span><EyeOutlined /> {{ article.readCount }} 阅读</span>
            <span><LikeOutlined /> {{ article.likeCount }} 点赞</span>
            <span><StarOutlined /> {{ article.collectCount }} 收藏</span>
            <span><MessageOutlined /> {{ article.commentCount }} 评论</span>
          </div>
          <div class="article-forum-info">
            <span class="forum-label">论坛分类</span>
            <span class="forum-detail">{{ article.forumName }} {{ article.forumArticleCount }}篇文章</span>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="article-body">
          <div v-for="(block, idx) in article.content" :key="idx">
            <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
            <h3 v-else-if="block.type === 'h3'">{{ block.text }}</h3>
            <p v-else-if="block.type === 'p'">{{ block.text }}</p>
            <pre v-else-if="block.type === 'code'" class="code-block"><code>{{ block.text }}</code></pre>
            <ul v-else-if="block.type === 'ul'">
              <li v-for="(li, i) in block.items" :key="i">{{ li }}</li>
            </ul>
            <div v-else-if="block.type === 'img'" class="article-img-wrap">
              <img :src="block.src" :alt="block.alt" />
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="article-actions">
          <a-button :type="liked ? 'primary' : 'default'" size="large" @click="liked = !liked; article.likeCount += liked ? 1 : -1">
            <LikeOutlined /> {{ liked ? '已点赞' : '点赞' }} {{ article.likeCount }}
          </a-button>
          <a-button :type="collected ? 'primary' : 'default'" size="large" @click="collected = !collected; article.collectCount += collected ? 1 : -1">
            <StarOutlined /> {{ collected ? '已收藏' : '收藏' }} {{ article.collectCount }}
          </a-button>
          <a-button size="large">
            <ShareAltOutlined /> 分享
          </a-button>
        </div>

        <!-- 评论区 -->
        <div class="comment-section">
          <h3 class="comment-title">评论 <span class="comment-count">{{ article.commentCount }}</span></h3>
          <div class="comment-input-area">
            <a-avatar :size="36" style="background-color: #87d068">我</a-avatar>
            <a-textarea v-model:value="commentText" placeholder="写下你的评论..." :rows="3" class="comment-input" />
            <a-button type="primary" @click="submitComment">发布</a-button>
          </div>
          <div class="comment-list">
            <div class="comment-item" v-for="c in comments" :key="c.id">
              <a-avatar :size="36" :style="{ backgroundColor: c.color }">{{ c.user[0] }}</a-avatar>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-user">{{ c.user }}</span>
                  <span class="comment-time">{{ c.time }}</span>
                </div>
                <p class="comment-content">{{ c.content }}</p>
                <div class="comment-footer">
                  <span class="comment-like" @click="c.likes++"><LikeOutlined /> {{ c.likes }}</span>
                  <span class="comment-reply">回复</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="article-sidebar">
        <!-- 审核信息 -->
        <div class="sidebar-card review-card">
          <div class="review-info">
            <div class="review-item">
              <span class="review-label">审核状态：</span>
              <a-tag :color="reviewStatusMap[article.reviewStatus].color">
                {{ reviewStatusMap[article.reviewStatus].text }}
              </a-tag>
            </div>
            <div class="review-item" v-if="article.reviewRemark">
              <span class="review-label">审核备注：</span>
              <span class="review-value">{{ article.reviewRemark }}</span>
            </div>
            <div class="review-item" v-if="article.reviewTime">
              <span class="review-label">审核时间：</span>
              <span class="review-value">{{ article.reviewTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeOutlined, LikeOutlined, StarOutlined, MessageOutlined, ShareAltOutlined } from '@ant-design/icons-vue'

const props = defineProps({ 
  id: { type: Number, default: 1 }
})

const articleId = computed(() => props.id || 1)
const liked = ref(false)
const collected = ref(false)
const commentText = ref('')

const reviewStatusMap = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '审核通过', color: 'green' },
  rejected: { text: '审核未通过', color: 'red' },
  draft: { text: '草稿', color: 'default' }
}

const articleMap = {
  1: {
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    author: 'bkspiderx', 
    authorArticles: 42, 
    authorFans: 1280, 
    authorLikes: 3600,
    publishTime: '2026-02-20 10:30', 
    category: '操作系统',
    readCount: 1500, 
    likeCount: 34, 
    collectCount: 11, 
    commentCount: 8,
    forumName: '操作系统技术交流', forumArticleCount: 8,
    reviewStatus: 'approved',
    reviewRemark: '内容质量优秀，技术深度到位',
    reviewTime: '2026-02-20 09:15',
    content: [
      { type: 'h2', text: '一、什么是CPU调度？' },
      { type: 'p', text: 'CPU调度是操作系统的核心功能之一，负责决定哪个进程在何时使用CPU资源。在多任务操作系统中，多个进程同时竞争CPU，调度器需要在它们之间合理分配CPU时间，以达到最优的系统性能。' },
      { type: 'h2', text: '二、为什么需要CPU调度？' },
      { type: 'p', text: '现代计算机系统中，CPU是最宝贵的资源之一。如果没有合理的调度机制，某些进程可能会长期占用CPU，导致其他进程无法得到执行，系统响应变慢甚至死锁。' },
      { type: 'ul', items: ['提高CPU利用率', '保证系统响应时间', '实现多任务并发', '防止进程饥饿'] },
      { type: 'h2', text: '三、经典调度算法' },
      { type: 'h3', text: '3.1 先来先服务（FCFS）' },
      { type: 'p', text: '最简单的调度算法，按照进程到达的顺序依次执行。优点是实现简单，缺点是可能导致"护航效应"——短进程等待长进程执行完毕。' },
      { type: 'h3', text: '3.2 短作业优先（SJF）' },
      { type: 'p', text: '优先执行预计执行时间最短的进程，能最小化平均等待时间。但需要预知进程执行时间，实际中难以精确获取。' },
      { type: 'h3', text: '3.3 时间片轮转（RR）' },
      { type: 'p', text: '每个进程分配固定的时间片，时间片用完后切换到下一个进程。是现代操作系统最常用的调度算法之一。' },
      { type: 'code', text: `// 时间片轮转伪代码示例
while (ready_queue not empty) {
  process = dequeue(ready_queue)
  run(process, TIME_QUANTUM)
  if (process not finished) {
    enqueue(ready_queue, process)
  }
}` },
      { type: 'h2', text: '四、Linux的CFS调度器' },
      { type: 'p', text: 'Linux内核使用完全公平调度器（CFS），基于红黑树实现，通过虚拟运行时间（vruntime）来保证每个进程获得公平的CPU时间。CFS是目前最先进的调度算法之一，兼顾了公平性和性能。' },
      { type: 'h2', text: '五、总结' },
      { type: 'p', text: 'CPU调度是操作系统设计中的核心问题，不同的调度算法适用于不同的场景。理解调度机制有助于我们编写更高效的程序，也是面试中的高频考点。' }
    ]
  },
  2: {
    title: 'Vue3 Composition API 最佳实践总结',
    author: 'bkspiderx',
    authorBio: '专注前端技术研究',
    authorArticles: 42,
    authorFans: 1280,
    authorLikes: 3600,
    publishTime: '2026-02-25 14:00',
    category: 'Vue',
    readCount: 2300,
    likeCount: 67,
    collectCount: 23,
    commentCount: 15,
    forumName: 'Vue前端技术论坛', forumArticleCount: 12,
    reviewStatus: 'approved',
    reviewRemark: '实践案例丰富，对开发者很有帮助',
    reviewTime: '2026-02-25 10:20',
    content: [
      { type: 'h2', text: '一、为什么使用 Composition API？' },
      { type: 'p', text: 'Vue3 的 Composition API 提供了更灵活的代码组织方式，解决了 Options API 在大型项目中的局限性。' },
      { type: 'h2', text: '二、核心概念' },
      { type: 'ul', items: ['setup 函数', 'ref 和 reactive', 'computed 和 watch', '生命周期钩子'] },
      { type: 'h2', text: '三、最佳实践' },
      { type: 'p', text: '合理使用组合式函数（Composables）来复用逻辑，保持代码的可维护性和可测试性。' }
    ]
  },
  3: {
    title: 'Spring Boot 3.x 新特性全解析',
    author: 'bkspiderx',
    authorBio: '专注后端技术研究',
    authorArticles: 42,
    authorFans: 1280,
    authorLikes: 3600,
    publishTime: '2026-03-01 16:00',
    category: 'Java',
    readCount: 0,
    likeCount: 0,
    collectCount: 0,
    commentCount: 0,
    forumName: 'Java后端技术论坛', forumArticleCount: 6,
    reviewStatus: 'pending',
    reviewRemark: '',
    reviewTime: '',
    content: [
      { type: 'h2', text: '一、Spring Boot 3.x 概述' },
      { type: 'p', text: 'Spring Boot 3.x 是一个重大版本更新，带来了虚拟线程、原生镜像等众多新特性。' },
      { type: 'h2', text: '二、主要新特性' },
      { type: 'ul', items: ['虚拟线程支持', 'GraalVM 原生镜像', 'Java 17 基线', 'Observability 改进'] },
      { type: 'h2', text: '三、迁移指南' },
      { type: 'p', text: '从 Spring Boot 2.x 迁移到 3.x 需要注意依赖版本、配置变更等问题。' }
    ]
  },
  4: {
    title: 'Docker容器化部署实战指南',
    author: 'bkspiderx',
    authorBio: '专注运维技术研究',
    authorArticles: 42,
    authorFans: 1280,
    authorLikes: 3600,
    publishTime: '2026-02-15 11:00',
    category: '运维',
    readCount: 0,
    likeCount: 0,
    collectCount: 0,
    commentCount: 0,
    forumName: '运维技术论坛', forumArticleCount: 10,
    reviewStatus: 'rejected',
    reviewRemark: '部分技术细节描述不够准确，建议补充实际案例和最佳实践',
    reviewTime: '2026-02-16 14:30',
    content: [
      { type: 'h2', text: '一、Docker 基础' },
      { type: 'p', text: 'Docker 是一个开源的容器化平台，可以将应用及其依赖打包成标准化的容器。' },
      { type: 'h2', text: '二、容器化部署流程' },
      { type: 'ul', items: ['编写 Dockerfile', '构建镜像', '运行容器', '编排服务'] },
      { type: 'h2', text: '三、生产环境最佳实践' },
      { type: 'p', text: '在生产环境中使用 Docker 需要注意安全性、资源限制、日志管理等问题。' }
    ]
  }
}

const article = computed(() => articleMap[articleId.value] || articleMap[1])

const comments = ref([
  { id: 1, user: '张同学', color: '#1890ff', time: '2026-02-21 09:15', content: '写得非常好！对CPU调度的讲解很清晰，特别是CFS那部分，之前一直没搞懂，看完豁然开朗。', likes: 12 },
  { id: 2, user: '李工程师', color: '#52c41a', time: '2026-02-21 11:30', content: '时间片轮转那个伪代码很直观，建议再补充一下多级反馈队列的内容，那个在面试中也很常见。', likes: 8 },
  { id: 3, user: '王开发', color: '#faad14', time: '2026-02-22 14:20', content: '收藏了！准备面试中，这篇文章帮了大忙。', likes: 5 }
])

const submitComment = () => {
  if (!commentText.value.trim()) return
  comments.value.unshift({
    id: Date.now(), 
    user: '我', 
    color: '#87d068',
    time: new Date().toLocaleString('zh-CN'),
    content: commentText.value, 
    likes: 0
  })
  commentText.value = ''
  article.value.commentCount++
}
</script>

<style scoped>
.forum-detail-page { width: 100%; }
.detail-layout { display: flex; gap: 20px; align-items: flex-start; }

/* 左侧主体 */
.article-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

.article-header { background: #fff; border-radius: 8px; padding: 28px 32px 20px; }
.article-title { font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0; line-height: 1.4; }
.article-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.author-name { font-size: 14px; font-weight: 600; color: #333; }
.meta-divider { color: #ccc; }
.publish-time { font-size: 13px; color: #999; }
.article-stats { display: flex; gap: 20px; font-size: 13px; color: #999; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.article-stats span { display: flex; align-items: center; gap: 4px; }
.article-forum-info { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #666; padding-top: 10px; border-top: 1px solid #f0f0f0; margin-top: 12px; }
.forum-label { color: #1890ff; font-weight: 500; }
.forum-detail { color: #666; }

.article-body { background: #fff; border-radius: 8px; padding: 28px 32px; line-height: 1.9; }
.article-body h2 { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 28px 0 14px; padding-left: 12px; border-left: 4px solid #1890ff; }
.article-body h2:first-child { margin-top: 0; }
.article-body h3 { font-size: 17px; font-weight: 600; color: #333; margin: 20px 0 10px; }
.article-body p { font-size: 15px; color: #444; margin: 0 0 14px; }
.article-body ul { padding-left: 24px; margin: 0 0 14px; }
.article-body li { font-size: 15px; color: #444; line-height: 2; }
.code-block { background: #1e1e1e; color: #d4d4d4; padding: 20px 24px; border-radius: 8px; font-size: 13px; line-height: 1.7; overflow-x: auto; margin: 0 0 14px; white-space: pre; }
.article-img-wrap { margin: 16px 0; text-align: center; }
.article-img-wrap img { max-width: 100%; border-radius: 6px; }

.article-actions { background: #fff; border-radius: 8px; padding: 20px 32px; display: flex; gap: 16px; justify-content: center; }

/* 评论区 */
.comment-section { background: #fff; border-radius: 8px; padding: 28px 32px; }
.comment-title { font-size: 18px; font-weight: 600; color: #333; margin: 0 0 20px; }
.comment-count { font-size: 14px; color: #999; font-weight: 400; }
.comment-input-area { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; }
.comment-input { flex: 1; }
.comment-list { display: flex; flex-direction: column; gap: 0; }
.comment-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
.comment-item:last-child { border-bottom: none; }
.comment-body { flex: 1; }
.comment-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.comment-user { font-size: 14px; font-weight: 600; color: #333; }
.comment-time { font-size: 12px; color: #ccc; }
.comment-content { font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 8px; }
.comment-footer { display: flex; gap: 16px; font-size: 12px; color: #999; }
.comment-like, .comment-reply { cursor: pointer; display: flex; align-items: center; gap: 4px; }
.comment-like:hover, .comment-reply:hover { color: #1890ff; }

/* 右侧边栏 */
.article-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 16px; }
.sidebar-card { background: #fff; border-radius: 8px; padding: 16px; }

/* 审核信息 */
.review-card { text-align: left; }
.review-item { margin-bottom: 10px; font-size: 13px; }
.review-item:last-child { margin-bottom: 0; }
.review-label { color: #666; font-weight: 500; display: inline-block; min-width: 70px; }
.review-value { color: #333; word-break: break-all; }
</style>
