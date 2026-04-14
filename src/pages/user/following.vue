<template>
  <div class="following-page">
    <div class="page-header">
      <h2 class="page-title">关注订阅文章</h2>
      <span class="page-subtitle">最近一周关注的人发布的最新内容</span>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <SmileOutlined class="empty-icon" />
        <p>暂无最新动</p>
      </div>

      <div
        class="article-card"
        v-for="article in filteredArticles"
        :key="article.id"
        @click="openDetail('forum', { id: article.id, from: 'following' })"
      >
        <div class="article-left">
          <div class="author-row">
            <a-avatar v-if="article.authorAvatar" :size="28" :src="article.authorAvatar">{{ article.author[0] }}</a-avatar>
            <a-avatar v-else :size="28" :style="{ backgroundColor: getAvatarColor(article.authorId) }">{{ article.author ? article.author[0] : '?' }}</a-avatar>
            <span class="author-name">{{ article.author }}</span>
            <a-tag v-if="article.isNew" color="red" size="small">NEW</a-tag>
          </div>
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-desc">{{ article.desc }}</p>
        </div>
      </div>
    </div>
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalFollowing"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { SmileOutlined } from '@ant-design/icons-vue'
import { getFollowingPosts } from '@/service/user/ufollowing'

const openDetail = inject('openDetail')

const currentPage = ref(1)
const pageSize = ref(10)
const totalFollowing = ref(0)
const filteredArticles = ref([])
const loading = ref(false)

const fetchFollowingPosts = async () => {
  loading.value = true
  try {
    const res = await getFollowingPosts({
      pageNo: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.code === 0 && res.data) {
      filteredArticles.value = res.data.map(item => ({
        id: item.id,
        authorId: item.followingId,
        author: item.followingName,
        authorAvatar: item.followingAvatar,
        title: item.postTitle,
        desc: item.postContent,
        cover: item.coverImage,
        createTime: item.createTime,
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        collectCount: item.collectCount,
        isNew: isNewArticle(item.createTime)
      }))
    }
  } catch (error) {
    console.error('获取关注文章失败:', error)
  } finally {
    loading.value = false
  }
}

const isNewArticle = (createTime) => {
  if (!createTime) return false
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return new Date(createTime) >= oneWeekAgo
}

const handlePageChange = (page, size) => {
  currentPage.value = page
  pageSize.value = size
  fetchFollowingPosts()
}

onMounted(() => {
  fetchFollowingPosts()
})

const avatarColors = ['#1890ff', '#52c41a', '#faad14', '#9c27b0', '#ff4d4f', '#13c2c2', '#722ed1']
const getAvatarColor = (id) => {
  return avatarColors[id % avatarColors.length]
}
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
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 20px 0; }
</style>
