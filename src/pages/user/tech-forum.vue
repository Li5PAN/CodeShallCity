<template>
  <div class="tech-forum-content">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchValue"
        placeholder="搜索文章"
        style="width: 400px"
        @search="handleSearch"
      />
    </div>
    <!-- 分类标签栏 -->
    <div class="category-tabs">
      <a-tag
        v-for="item in categoryList"
        :key="item.key"
        :class="['category-tag', activeCategory === item.key ? 'active-tag' : '']"
        @click="activeCategory = item.key"
      >
        {{ item.name }}
      </a-tag>
      <span class="more-category">AI开发者构建专区 >></span>
    </div>

    <!-- 主体内容：文章列表 + 右侧推荐 -->
    <div class="main-content">
      <!-- 左侧文章列表 -->
      <div class="article-list">
        <div
          class="article-item"
          v-for="item in articleList"
          :key="item.id"
          style="cursor: pointer"
          @click="openDetail('forum', { id: item.id })"
        >
          <div class="article-header">
            <a-avatar :size="28" :style="{ backgroundColor: item.authorColor }">{{ item.author[0] }}</a-avatar>
            <span class="author-name">{{ item.author }}</span>
            <span class="article-time">{{ item.publishTime }}</span>
          </div>
          <div class="article-body">
            <div class="article-text">
              <h4 class="article-title">{{ item.title }}</h4>
              <p class="article-desc">{{ item.desc }}</p>
              <div class="article-meta">
                <a-tag size="small" :color="item.tagColor">{{ item.category }}</a-tag>
                <span>👁 {{ item.readCount }}</span>
                <span>👍 {{ item.likeCount }}</span>
                <span>⭐ {{ item.collectCount }}</span>
              </div>
            </div>
            <img v-if="item.cover" :src="item.cover" class="article-cover" alt="" />
          </div>
        </div>
        <!-- 无更多内容提示 -->
        <div class="no-more">
          {{ articleList.length === 0 ? '暂无相关文章' : '没有更多了' }}
        </div>
      </div>

      <!-- 右侧推荐社区 -->
      <div class="right-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">推荐社区</div>
          <div class="community-list">
            <div class="community-item" v-for="c in communityList" :key="c.key">
              <img v-if="c.icon" :src="c.icon" class="community-icon" alt="" />
              <div v-else class="community-icon-placeholder"></div>
              <span class="community-name">{{ c.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const openDetail = inject('openDetail')

const searchValue = ref('')

const handleSearch = (value) => {
  console.log('搜索文章:', value)
}

const categoryList = ref([
  { key: 'all', name: '全部' },
  { key: 'news', name: '资讯' },
  { key: 'mcp', name: 'MCP' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'ai', name: '人工智能' },
  { key: 'os', name: '操作系统' },
  { key: 'java', name: 'Java' },
  { key: 'python', name: 'Python' },
  { key: 'database', name: '数据库' }
])

const activeCategory = ref('all')

const articleList = ref([
  {
    id: 1,
    author: 'bkspiderx', authorColor: '#1890ff',
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法，包括FCFS、SJF、优先级调度和时间片轮转...',
    category: '操作系统', tagColor: 'blue',
    publishTime: '2026-02-20', readCount: '1.5k', likeCount: 34, collectCount: 11,
    cover: 'https://placehold.co/100x80/1890ff/FFFFFF?text=OS'
  },
  {
    id: 2,
    author: 'Agent学习路线', authorColor: '#52c41a',
    title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南',
    desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段重点学数学、统计和机器学习基础，进阶阶段...',
    category: '人工智能', tagColor: 'green',
    publishTime: '2026-02-25', readCount: '2.1k', likeCount: 47, collectCount: 14,
    cover: 'https://placehold.co/100x80/52c41a/FFFFFF?text=AI'
  },
  {
    id: 3,
    author: 'NASA技术', authorColor: '#faad14',
    title: 'NASA公布推进阿尔忒弥斯IV任务，计划在月球轨道建设首个空间站',
    desc: 'NASA公布推进阿尔忒弥斯IV任务，计划在月球轨道建设首个空间站"门户"。该任务将采用升级版SLS火箭...',
    category: '科技资讯', tagColor: 'orange',
    publishTime: '2026-02-26', readCount: '1.3k', likeCount: 33, collectCount: 9,
    cover: 'https://placehold.co/100x80/faad14/FFFFFF?text=NASA'
  },
  {
    id: 4,
    author: 'Java架构师', authorColor: '#ff4d4f',
    title: 'Spring Boot 3.x 新特性全解析：从虚拟线程到原生镜像',
    desc: 'Spring Boot 3.x 带来了众多重磅更新，包括对Java 21虚拟线程的支持、GraalVM原生镜像编译优化...',
    category: 'Java', tagColor: 'red',
    publishTime: '2026-02-24', readCount: '3.2k', likeCount: 156, collectCount: 42,
    cover: 'https://placehold.co/100x80/ff4d4f/FFFFFF?text=Java'
  }
])

const communityList = ref([
  { key: 1, name: '高通开发者中文社区', icon: '' },
  { key: 2, name: 'HarmonyOS开发者社区', icon: '' },
  { key: 3, name: '讯飞AI开发者社区', icon: '' },
  { key: 4, name: '英特尔开发人员专区', icon: '' },
  { key: 5, name: 'NVIDIA技术专区', icon: '' },
  { key: 6, name: '葡萄城开发者空间', icon: '' },
  { key: 7, name: 'DAMO开发者矩阵', icon: '' },
  { key: 8, name: '魔乐社区', icon: '' },
  { key: 9, name: 'LAVAL社区', icon: '' }
])
</script>

<style scoped>
.tech-forum-content { width: 100%; }

/* 搜索栏 */
.search-bar { margin-bottom: 16px; }

/* 分类标签栏 */
.category-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; background: #fff; padding: 12px 16px; border-radius: 8px; align-items: center; }
.category-tag { cursor: pointer; border-radius: 4px; font-size: 13px; padding: 4px 12px; border: 1px solid #d9d9d9; background: #fff; color: #666; transition: all 0.2s; }
.category-tag:hover { color: #1890ff; border-color: #1890ff; }
.active-tag { background: #1890ff !important; color: #fff !important; border-color: #1890ff !important; }
.more-category { font-size: 13px; color: #1890ff; cursor: pointer; margin-left: auto; }

/* 主体布局 */
.main-content { display: flex; gap: 16px; align-items: flex-start; }
.article-list { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; background: #fff; border-radius: 8px; overflow: hidden; }

/* 文章条目 */
.article-item { padding: 16px 20px; border-bottom: 1px solid #f5f5f5; transition: background 0.2s; }
.article-item:last-of-type { border-bottom: none; }
.article-item:hover { background: #fafafa; }
.article-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.author-name { font-size: 13px; font-weight: 600; color: #555; }
.article-time { font-size: 12px; color: #ccc; margin-left: auto; }
.article-body { display: flex; gap: 16px; align-items: flex-start; }
.article-text { flex: 1; min-width: 0; }
.article-title { font-size: 15px; font-weight: 600; color: #333; margin: 0 0 6px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.article-item:hover .article-title { color: #1890ff; }
.article-desc { font-size: 13px; color: #999; margin: 0 0 10px 0; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 2; }
.article-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #bbb; }
.article-cover { width: 100px; height: 75px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }

.no-more { text-align: center; padding: 20px; font-size: 13px; color: #ccc; }

/* 右侧栏 */
.right-sidebar { width: 220px; flex-shrink: 0; }
.sidebar-card { background: #fff; border-radius: 8px; padding: 16px; }
.sidebar-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.community-list { display: flex; flex-direction: column; gap: 2px; }
.community-item { display: flex; align-items: center; gap: 8px; padding: 8px 6px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.community-item:hover { background: #f5f5f5; }
.community-icon { width: 20px; height: 20px; border-radius: 4px; }
.community-icon-placeholder { width: 20px; height: 20px; border-radius: 4px; background: #e8e8e8; flex-shrink: 0; }
.community-name { font-size: 13px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
