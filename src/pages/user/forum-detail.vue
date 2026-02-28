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
          <a-button v-if="!fromFavorites" :type="collected ? 'primary' : 'default'" size="large" @click="collected = !collected; article.collectCount += collected ? 1 : -1">
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
        <!-- 作者信息 -->
        <div class="sidebar-card author-card">
          <a-avatar :size="56" style="background-color: #1890ff; display: block; margin: 0 auto 12px">{{ article.author[0] }}</a-avatar>
          <div class="author-name-center">{{ article.author }}</div>
          <div class="author-bio">{{ article.authorBio }}</div>
          <div class="author-stats">
            <div class="author-stat-item">
              <div class="stat-num">{{ article.authorArticles }}</div>
              <div class="stat-label">文章</div>
            </div>
            <div class="author-stat-item">
              <div class="stat-num">{{ article.authorFans }}</div>
              <div class="stat-label">粉丝</div>
            </div>
            <div class="author-stat-item">
              <div class="stat-num">{{ article.authorLikes }}</div>
              <div class="stat-label">获赞</div>
            </div>
          </div>
          <a-button block style="margin-top: 12px" :type="isFollowing ? 'default' : 'primary'" @click="isFollowing = !isFollowing">
            {{ isFollowing ? '✓ 已关注' : '+ 关注' }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeOutlined, LikeOutlined, StarOutlined, MessageOutlined, ShareAltOutlined } from '@ant-design/icons-vue'

const props = defineProps({ id: { type: Number, default: 1 }, from: { type: String, default: '' } })

const articleId = computed(() => props.id || 1)
const liked = ref(false)
const collected = ref(false)
const commentText = ref('')
const isFollowing = ref(props.from === 'following')
const fromFavorites = computed(() => props.from === 'favorites')

const articleMap = {
  1: {
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    author: 'bkspiderx', authorBio: '专注操作系统与底层技术研究', authorArticles: 42, authorFans: 1280, authorLikes: 3600,
    publishTime: '2026-02-20 10:30', category: '操作系统',
    readCount: 1500, likeCount: 34, collectCount: 11, commentCount: 8,
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
  3: {
    title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南！',
    author: 'Agent学习路线', authorBio: 'AI技术布道者，专注大模型应用开发', authorArticles: 88, authorFans: 5600, authorLikes: 12000,
    publishTime: '2026-02-25 14:00', category: '人工智能',
    readCount: 1500, likeCount: 47, collectCount: 14, commentCount: 12,
    content: [
      { type: 'h2', text: '一、为什么要学习AI大模型？' },
      { type: 'p', text: '2025年，AI大模型已经渗透到各行各业。无论是软件开发、内容创作还是数据分析，掌握大模型技术都将成为核心竞争力。' },
      { type: 'h2', text: '二、学习路线规划' },
      { type: 'h3', text: '第一阶段：基础准备（1-2个月）' },
      { type: 'ul', items: ['Python编程基础', '数学基础：线性代数、概率论、微积分', '机器学习基础概念', 'PyTorch/TensorFlow框架入门'] },
      { type: 'h3', text: '第二阶段：深度学习进阶（2-3个月）' },
      { type: 'ul', items: ['神经网络原理与实现', 'Transformer架构深度解析', 'BERT、GPT系列模型原理', '微调技术：LoRA、QLoRA'] },
      { type: 'h3', text: '第三阶段：大模型应用开发（2-3个月）' },
      { type: 'ul', items: ['LangChain框架实战', 'RAG检索增强生成', 'Agent智能体开发', 'Prompt工程技巧'] },
      { type: 'h2', text: '三、推荐学习资源' },
      { type: 'p', text: '学习大模型需要理论与实践并重。建议从官方文档入手，结合实际项目练习，同时关注Hugging Face、Papers With Code等平台的最新进展。' },
      { type: 'h2', text: '四、总结' },
      { type: 'p', text: 'AI大模型的学习是一个持续的过程，技术更新很快。保持学习热情，多动手实践，才能在这个领域持续成长。' }
    ]
  }
}

const article = computed(() => articleMap[articleId.value] || articleMap[1])

const toc = computed(() => {
  return (article.value.content || [])
    .filter(b => b.type === 'h2' || b.type === 'h3')
    .map(b => ({ text: b.text, level: b.type === 'h2' ? 2 : 3 }))
})

const comments = ref([
  { id: 1, user: '张同学', color: '#1890ff', time: '2026-02-21 09:15', content: '写得非常好！对CPU调度的讲解很清晰，特别是CFS那部分，之前一直没搞懂，看完豁然开朗。', likes: 12 },
  { id: 2, user: '李工程师', color: '#52c41a', time: '2026-02-21 11:30', content: '时间片轮转那个伪代码很直观，建议再补充一下多级反馈队列的内容，那个在面试中也很常见。', likes: 8 },
  { id: 3, user: '王开发', color: '#faad14', time: '2026-02-22 14:20', content: '收藏了！准备面试中，这篇文章帮了大忙。', likes: 5 }
])

const submitComment = () => {
  if (!commentText.value.trim()) return
  comments.value.unshift({
    id: Date.now(), user: '我', color: '#87d068',
    time: new Date().toLocaleString('zh-CN'),
    content: commentText.value, likes: 0
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
.sidebar-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }

.author-card { text-align: center; }
.author-name-center { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; }
.author-bio { font-size: 12px; color: #999; margin-bottom: 12px; }
.author-stats { display: flex; justify-content: space-around; padding: 12px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
.author-stat-item { text-align: center; }
.stat-num { font-size: 16px; font-weight: 700; color: #333; }
.stat-label { font-size: 11px; color: #999; }

.toc-item { font-size: 13px; color: #555; padding: 5px 0; cursor: pointer; border-left: 2px solid transparent; padding-left: 8px; line-height: 1.4; }
.toc-item:hover { color: #1890ff; border-left-color: #1890ff; }
.toc-h3 { padding-left: 20px; font-size: 12px; color: #888; }

.related-item { padding: 8px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.related-item:last-child { border-bottom: none; }
.related-item:hover .related-title { color: #1890ff; }
.related-title { font-size: 13px; color: #333; line-height: 1.4; margin-bottom: 4px; }
.related-meta { font-size: 11px; color: #ccc; display: flex; align-items: center; gap: 4px; }
</style>
