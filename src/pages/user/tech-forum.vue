<template>
  <div class="tech-forum-content">
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
      <span class="more-category">AI开发者构建专区>></span>
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
          @click="router.push('/user/forum-detail/' + item.id)"
        >
          <div class="article-header">
            <span class="author">{{ item.author }}</span>
          </div>
          <div class="article-body">
            <h3 class="article-title">{{ item.title }}</h3>
            <p class="article-desc">{{ item.desc }}</p>
            <div class="article-meta">
              <span>👁️ {{ item.readCount }}</span>
              <span>👍 {{ item.likeCount }}</span>
              <span>⭐ {{ item.collectCount }}</span>
            </div>
          </div>
          <div class="article-cover" v-if="item.cover">
            <img :src="item.cover" alt="" />
          </div>
        </div>

        <!-- 无更多内容提示 -->
        <div class="no-more">
          {{ articleList.length === 0 ? '暂无相关文章' : '没有更多了' }}
        </div>
      </div>

      <!-- 右侧论坛推荐 -->
      <div class="forum-recommend">
        <h4 class="recommend-title">论坛推荐</h4>
        <div class="more-btn">更多></div>
        <ul class="recommend-list">
          <li 
            class="recommend-item" 
            v-for="item in recommendList" 
            :key="item.key"
          >
            <img :src="item.icon" alt="" class="item-icon" v-if="item.icon" />
            <span class="item-name">{{ item.name }}</span>
            <span class="arrow">></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 分类标签数据
const categoryList = ref([
  { key: 'all', name: '全部' },
  { key: 'news', name: '资讯' },
  { key: 'mcp', name: 'MCP' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'ops', name: '运维' },
  { key: 'os', name: '操作系统' },
  { key: 'ai', name: '人工智能' }
])

// 当前选中分类
const activeCategory = ref('all')

// 模拟文章列表数据
const articleList = ref([
  {
    id: 1,
    author: 'bkspiderx',
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法。CPU调度通过时间分片和优先级排序实现多任务并发，平衡响应时间...',
    readCount: '1.5k',
    likeCount: '34',
    collectCount: '11',
    cover: ''
  },
  {
    id: 2,
    author: 'bkspiderx',
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法。CPU调度通过时间分片和优先级排序实现多任务并发，平衡响应时间...',
    readCount: '1.5k',
    likeCount: '34',
    collectCount: '11',
    cover: ''
  },
  {
    id: 3,
    author: 'Agent学习路线',
    title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南！',
    desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段(1-2个月) 重点内数学、统计和机器学习基础，进阶阶段(2-...',
    readCount: '1.5k',
    likeCount: '47',
    collectCount: '14',
    cover: 'https://via.placeholder.com/100x80/000000/FFFFFF?text=AI'
  },
  {
    id: 4,
    author: 'RR1335',
    title: '构建太空生存空间 NASA’s Artemis IV: Building First Lunar Space Station',
    desc: 'NASA公布推进阿尔忒弥斯IV任务，计划在月球轨道建设首个空间站"门户"。该任务将采用升级版SLS火箭，运送宇航...',
    readCount: '1.3k',
    likeCount: '33',
    collectCount: '39',
    cover: 'https://via.placeholder.com/100x80/1890ff/FFFFFF?text=NASA'
  },
  {
    id: 5,
    author: 'bkspiderx',
    title: '深入解析CPU调度：操作系统的核心资源分配机制',
    desc: '本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法。CPU调度通过时间分片和优先级排序实现多任务并发，平衡响应时间...',
    readCount: '1.5k',
    likeCount: '34',
    collectCount: '11',
    cover: ''
  },
  {
    id: 6,
    author: 'Agent学习路线',
    title: 'AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南！',
    desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段(1-2个月) 重点内数学、统计和机器学习基础，进阶阶段(2-...',
    readCount: '1.3k',
    likeCount: '47',
    collectCount: '14',
    cover: 'https://via.placeholder.com/100x80/000000/FFFFFF?text=AI'
  },
  {
    id: 7,
    author: 'RR1335',
    title: '构建太空生存空间 NASA’s Artemis IV: Building First Lunar Space Station',
    desc: '本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段(1-2个月) 重点内数学、统计和机器学习基础，进阶阶段(2-...',
    readCount: '1.3k',
    likeCount: '33',
    collectCount: '39',
    cover: 'https://via.placeholder.com/100x80/1890ff/FFFFFF?text=NASA'
  }
])

// 右侧论坛推荐数据
const recommendList = ref([
  { key: 1, name: '高通开发者中文社区', icon: '' },
  { key: 2, name: 'HarmonyOS开发者社区', icon: '' },
  { key: 3, name: '讯飞AI开发者社区', icon: 'https://via.placeholder.com/20x20/1890ff/FFFFFF?text=讯飞' },
  { key: 4, name: '英特尔开发人员专区', icon: 'https://via.placeholder.com/20x20/000000/FFFFFF?text=英特尔' },
  { key: 5, name: 'NVIDIA技术专区', icon: 'https://via.placeholder.com/20x20/76b900/FFFFFF?text=NVIDIA' },
  { key: 6, name: '葡葡城开发者空间', icon: 'https://via.placeholder.com/20x20/9c27b0/FFFFFF?text=葡葡城' },
  { key: 7, name: 'DAMO开发者矩阵', icon: '' },
  { key: 8, name: '魔乐社区', icon: 'https://via.placeholder.com/20x20/ff0000/FFFFFF?text=魔乐' },
  { key: 9, name: 'LAVAL社区', icon: '' }
])
</script>

<style scoped>
/* 核心容器 */
.tech-forum-content {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* 分类标签栏 */
.category-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.category-tag {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
}

.active-tag {
  background: #000;
  color: #fff;
  border-color: #000;
}

.more-category {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

/* 主体内容布局 */
.main-content {
  display: flex;
  gap: 24px;
}

/* 左侧文章列表 */
.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.article-header {
  min-width: 80px;
  padding-right: 12px;
}

.author {
  font-size: 12px;
  color: #666;
}

.article-body {
  flex: 1;
}

.article-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 500;
  cursor: pointer;
}

.article-title:hover {
  color: #1890ff;
}

.article-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.article-cover {
  min-width: 100px;
  margin-left: 12px;
}

.article-cover img {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.no-more {
  text-align: center;
  padding: 20px 0;
  color: red;
  font-size: 14px;
}

/* 右侧论坛推荐 */
.forum-recommend {
  width: 220px;
  border: 1px solid #e8e8e8;
  padding: 12px;
  border-radius: 4px;
}

.recommend-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.more-btn {
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.recommend-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  cursor: pointer;
}

.recommend-item:hover {
  background: #f5f5f5;
}

.item-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.item-name {
  flex: 1;
  color: #333;
}

.arrow {
  font-size: 12px;
  color: #999;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .forum-recommend {
    width: 100%;
  }
  
  .article-item {
    flex-direction: column;
  }
  
  .article-cover {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>