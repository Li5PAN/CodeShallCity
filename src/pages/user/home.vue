<template>
  <div class="content-wrapper">
    <!-- 左侧主内容 -->
    <div class="content-left">
      <!-- Banner区域 -->
      <div class="banner">
        <h1>找专业人做专业事 多快好省</h1>
        <p>图片logo</p>
      </div>

      <!-- 需求悬赏 -->
      <div class="section">
        <div class="section-header">
          <h3>需求悬赏</h3>
          <a class="section-more" @click="goToDemandBounty">更多需求 ></a>
        </div>
        <a-row :gutter="[16, 16]">
          <a-col :span="8" v-for="item in rewardList" :key="item.id">
            <div class="reward-card" @click="openDetail('demand', { id: item.id })">
              <div class="reward-tag">{{ item.tag }}</div>
              <h4>{{ item.title }}</h4>
              <p class="reward-desc">{{ item.desc }}</p>
              <div class="reward-footer">
                <span>{{ item.author }}</span>
                <span>{{ item.views }}万</span>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 精选文章 -->
      <div class="section">
        <div class="section-header">
          <h3>精选文章</h3>
          <span class="article-tab active">排行榜 🌟</span>
        </div>
        <div class="article-list">
          <div class="article-item" v-for="item in articleList" :key="item.title">
            <div class="article-info">
              <div class="article-meta-top">
                <a-avatar :size="20" style="background-color: #1890ff">{{ item.author[0] }}</a-avatar>
                <span class="article-author">{{ item.author }}</span>
              </div>
              <h4 class="article-title">{{ item.title }}</h4>
              <p class="article-desc">{{ item.desc }}</p>
              <div class="article-meta-bottom">
                <span><EyeOutlined /> {{ item.read }}</span>
                <span><LikeOutlined /> {{ item.like }}</span>
                <span><MessageOutlined /> {{ item.comment }}</span>
              </div>
            </div>
            <div class="article-cover" v-if="item.cover">
              <img :src="item.cover" alt="封面" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧边栏 -->
    <div class="content-right">
      <div class="right-section">
        <div class="right-section-header">
          <h4>论坛推荐</h4>
          <a class="more-link" @click="goToTechForum">更多</a>
        </div>
        <div class="forum-list">
          <div class="forum-item" v-for="item in forumList" :key="item.name">
            <span class="forum-name">{{ item.name }}</span>
            <RightOutlined class="forum-arrow" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { EyeOutlined, LikeOutlined, MessageOutlined, RightOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const openDetail = inject('openDetail')

const rewardList = ref([
  { id: 1, tag: 'CHATERIN AI', title: '开创全新发展新思路和新路线', desc: '人工智能', author: '科技前沿', views: 12 },
  { id: 2, tag: 'MiniMax-M1', title: 'MiniMax-M1开源大模型，刷新重度数据应用开发', desc: 'Python', author: '开发者社区', views: 8 },
  { id: 3, tag: 'PaddleOCR', title: '开源智能图像OCR工具，多语言识别超强开发者工具', desc: 'Python', author: '技术博客', views: 15 }
])

const goToDemandBounty = () => {
  router.push('/user/demand-bounty')
}

const goToTechForum = () => {
  router.push('/user/tech-forum')
}

const articleList = ref([
  { title: '人工智能大模型应用：2025年AI技术发展趋势', desc: '从入门到精通，全面解析AI大模型在各行业的应用场景与技术实现方案', author: 'AI研究员', read: 3589, like: 286, comment: 45, cover: 'https://picsum.photos/160/100?random=1' },
  { title: 'NASA的Artemis IV: Building First Lunar Space Station', desc: '前沿太空技术与开发者社区的深度合作探索', author: '科技前沿', read: 5621, like: 458, comment: 89, cover: 'https://picsum.photos/160/100?random=2' },
  { title: '大模型TPCDS大数据集测试与性能优化实战', desc: '深入分析大数据处理框架的性能瓶颈与优化策略', author: '数据工程师', read: 2987, like: 198, comment: 32, cover: 'https://picsum.photos/160/100?random=3' }
])

const forumList = ref([
  { name: '海洋开发者中文社区' }, { name: 'Harmony OS开发者社区' }, { name: '高飞AI开发者大赛论坛' },
  { name: '深度学习开发者大赛论坛' }, { name: 'NVIDIA AI智能开发论坛' }, { name: '智能制造与物联网论坛' },
  { name: 'DARPA开发者论坛' }, { name: '清华社区' }, { name: 'JAVA社区' }
])
</script>

<style scoped>
.content-wrapper { display: flex; gap: 20px; width: 100%; }
.content-left { flex: 1; min-width: 0; }
.content-right { width: 280px; flex-shrink: 0; }

.banner { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: #fff; padding: 40px 32px; border-radius: 8px; margin-bottom: 20px; }
.banner h1 { font-size: 28px; margin: 0 0 12px 0; color: #fff; font-weight: 700; }
.banner p { font-size: 14px; opacity: 0.8; margin: 0; }

.section { margin-bottom: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 18px; font-weight: 600; margin: 0; color: #333; }
.section-more { font-size: 13px; color: #1890ff; cursor: pointer; }

.reward-card { background: #fff; border-radius: 8px; padding: 16px; height: 100%; cursor: pointer; transition: box-shadow 0.3s; }
.reward-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.reward-tag { font-size: 11px; color: #1890ff; background: #e6f7ff; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
.reward-card h4 { font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: #333; line-height: 1.4; }
.reward-desc { font-size: 12px; color: #999; margin: 0 0 12px 0; }
.reward-footer { display: flex; justify-content: space-between; font-size: 12px; color: #999; }

.article-tab { font-size: 13px; color: #333; font-weight: 600; cursor: pointer; }
.article-list { background: #fff; border-radius: 8px; }
.article-item { display: flex; justify-content: space-between; padding: 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.article-item:hover { background: #fafafa; }
.article-item:last-child { border-bottom: none; }
.article-info { flex: 1; min-width: 0; margin-right: 16px; }
.article-meta-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.article-author { font-size: 12px; color: #999; }
.article-title { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; color: #333; }
.article-desc { font-size: 13px; color: #666; margin: 0 0 12px 0; line-height: 1.5; }
.article-meta-bottom { display: flex; gap: 20px; font-size: 12px; color: #999; }
.article-meta-bottom span { display: flex; align-items: center; gap: 4px; }
.article-cover img { width: 160px; height: 100px; object-fit: cover; border-radius: 6px; }

.right-section { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.right-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.right-section-header h4 { font-size: 15px; font-weight: 600; margin: 0; color: #333; }
.more-link { font-size: 12px; color: #1890ff; cursor: pointer; }
.forum-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.forum-item:last-child { border-bottom: none; }
.forum-item:hover .forum-name { color: #1890ff; }
.forum-name { font-size: 13px; color: #333; }
.forum-arrow { font-size: 10px; color: #ccc; }
</style>
