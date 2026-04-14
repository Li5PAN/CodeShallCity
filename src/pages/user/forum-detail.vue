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
            <span class="forum-detail">{{ article.categoryName }} {{ article.categoryPostCount }}篇文章</span>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="article-body" v-html="article.content"></div>

        <!-- 底部操作栏 -->
        <div class="article-actions">
          <a-button :type="liked ? 'primary' : 'default'" size="large" @click="handleLike">
            <LikeOutlined /> {{ liked ? '已点赞' : '点赞' }} {{ article.likeCount }}
          </a-button>
          <a-button v-if="!fromFavorites" :type="collected ? 'primary' : 'default'" size="large" @click="handleCollect">
            <StarOutlined /> {{ collected ? '已收藏' : '收藏' }} {{ article.collectCount }}
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
              <a-avatar :size="36" :src="c.avatar" :style="{ backgroundColor: c.color }">{{ c.user[0] }}</a-avatar>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-user">{{ c.user }}</span>
                  <span class="comment-time">{{ c.time }}</span>
                </div>
                <p class="comment-content">{{ c.content }}</p>
                <div class="comment-footer">
                  <span class="comment-like" @click="c.likes++"><LikeOutlined /> {{ c.likes }}</span>
                  <span class="comment-reply" @click="handleReply(c)">回复</span>
                </div>
                <!-- 回复输入框 -->
                <div v-if="replyTarget && replyTarget.id === c.id" class="reply-input-area">
                  <div class="reply-to-info">回复 @{{ c.user }}</div>
                  <a-textarea v-model:value="replyText" placeholder="写下你的回复..." :rows="2" class="reply-input" />
                  <div class="reply-actions">
                    <a-button size="small" @click="cancelReply">取消</a-button>
                    <a-button type="primary" size="small" @click="submitReply">发布</a-button>
                  </div>
                </div>
                <!-- 子评论（二级评论） -->
                <div v-if="c.children && c.children.length > 0" class="child-comments">
                  <div class="child-comment-item" v-for="child in c.children" :key="child.id">
                    <a-avatar :size="28" :src="child.userAvatar" :style="{ backgroundColor: '#52c41a' }">{{ child.userName ? child.userName[0] : '' }}</a-avatar>
                    <div class="child-comment-body">
                      <div class="child-comment-header">
                        <span class="child-comment-user">{{ child.userName }}</span>
                        <span v-if="child.replyToUser" class="reply-arrow">回复</span>
                        <span v-if="child.replyToUser" class="child-comment-user child-reply-user">@{{ child.replyToUser }}</span>
                        <span class="comment-time">{{ child.createTime ? new Date(child.createTime).toLocaleString('zh-CN') : '' }}</span>
                      </div>
                      <p class="child-comment-content">{{ child.content }}</p>
                      <div class="comment-footer">
                        <span class="comment-like" @click="child.likeCount = (child.likeCount || 0) + 1"><LikeOutlined /> {{ child.likeCount || 0 }}</span>
                        <span class="comment-reply" @click="handleReply(c)">回复</span>
                      </div>
                    </div>
                  </div>
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
          <a-avatar :size="56" :src="article.authorAvatar" :style="{ backgroundColor: '#1890ff', display: 'block', margin: '0 auto 12px' }">{{ article.author ? article.author[0] : '' }}</a-avatar>
          <div class="author-name-center">{{ article.author }}</div>
          <div class="author-bio">{{ article.authorBio || '' }}</div>
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
import { ref, computed, onMounted } from 'vue'
import { EyeOutlined, LikeOutlined, StarOutlined, MessageOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import { getPostDetail, likePost, unlikePost, collectPost, uncollectPost, getCommentPage, createComment } from '@/service/user/uforum'

const props = defineProps({ id: { type: Number, default: 1 }, from: { type: String, default: '' } })

const articleId = computed(() => props.id || 1)
const liked = ref(false)
const collected = ref(false)
const commentText = ref('')
const isFollowing = ref(props.from === 'following')
const fromFavorites = computed(() => props.from === 'favorites')

// 文章详情数据
const article = ref({
  id: null,
  title: '',
  author: '',
  authorAvatar: '',
  authorBio: '',
  authorArticles: 0,
  authorFans: 0,
  authorLikes: 0,
  publishTime: '',
  category: '',
  categoryId: null,
  categoryName: '',
  categoryPostCount: 0,
  readCount: 0,
  likeCount: 0,
  collectCount: 0,
  commentCount: 0,
  content: '',
  tags: [],
  createTime: ''
})

// 加载文章详情
const loadPostDetail = async () => {
  try {
    const res = await getPostDetail(articleId.value)
    if (res.code === 0 && res.data) {
      const data = res.data
      article.value = {
        id: data.id,
        title: data.title || '',
        author: data.userName || '',
        authorAvatar: data.userAvatar || '',
        authorBio: '',
        authorArticles: 0,
        authorFans: 0,
        authorLikes: 0,
        publishTime: data.createTime ? new Date(data.createTime).toLocaleString('zh-CN') : '',
        category: data.categoryName || '',
        categoryId: data.categoryId,
        categoryName: data.categoryName || '',
        categoryPostCount: data.categoryPostCount || 0,
        readCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        collectCount: data.collectCount || 0,
        commentCount: data.commentCount || 0,
        content: data.content || '',
        tags: data.tags || [],
        createTime: data.createTime || ''
      }
      liked.value = data.isLiked || false
      collected.value = data.isCollected || false
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  }
}

onMounted(() => {
  loadPostDetail()
  loadComments()
})

const toc = computed(() => {
  // 如果content是HTML字符串，暂不处理；后续可考虑解析生成目录
  return []
})

// 评论列表数据
const comments = ref([])
// 回复目标（当前正在回复的评论）
const replyTarget = ref(null)
// 回复输入框内容
const replyText = ref('')

// 加载评论列表
const loadComments = async () => {
  try {
    const res = await getCommentPage({
      postId: articleId.value,
      pageNum: 1,
      pageSize: 50
    })
    if (res.code === 0 && res.data) {
      comments.value = res.data.map(item => ({
        id: item.id,
        user: item.userName || '',
        userId: item.userId,
        avatar: item.userAvatar || '',
        color: '#1890ff',
        time: item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '',
        content: item.content || '',
        likes: item.likeCount || 0,
        parentId: item.parentId,
        children: item.children || []
      }))
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
  }
}

// 提交一级评论
const submitComment = async () => {
  if (!commentText.value.trim()) return
  try {
    const res = await createComment({
      postId: articleId.value,
      parentId: null,
      content: commentText.value.trim()
    })
    if (res.code === 0) {
      commentText.value = ''
      await loadComments()
    }
  } catch (error) {
    console.error('发布评论失败:', error)
  }
}

// 点击回复按钮
const handleReply = (comment) => {
  replyTarget.value = comment
  replyText.value = ''
}

// 取消回复
const cancelReply = () => {
  replyTarget.value = null
  replyText.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyText.value.trim() || !replyTarget.value) return
  try {
    const res = await createComment({
      postId: articleId.value,
      parentId: replyTarget.value.id,
      content: replyText.value.trim()
    })
    if (res.code === 0) {
      replyText.value = ''
      replyTarget.value = null
      await loadComments()
    }
  } catch (error) {
    console.error('发布回复失败:', error)
  }
}

// 点赞/取消点赞
const handleLike = async () => {
  try {
    if (liked.value) {
      await unlikePost(articleId.value)
      liked.value = false
      article.value.likeCount--
    } else {
      await likePost(articleId.value)
      liked.value = true
      article.value.likeCount++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

// 收藏/取消收藏
const handleCollect = async () => {
  try {
    if (collected.value) {
      await uncollectPost(articleId.value)
      collected.value = false
      article.value.collectCount--
    } else {
      await collectPost(articleId.value)
      collected.value = true
      article.value.collectCount++
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
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

/* 回复输入框 */
.reply-input-area { margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 6px; }
.reply-to-info { font-size: 12px; color: #1890ff; margin-bottom: 8px; }
.reply-input { margin-bottom: 8px; }
.reply-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* 子评论 */
.child-comments { margin-top: 12px; padding: 12px; background: #fafafa; border-radius: 6px; }
.child-comment-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.child-comment-item:last-child { border-bottom: none; padding-bottom: 0; }
.child-comment-body { flex: 1; }
.child-comment-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.child-comment-user { font-size: 13px; font-weight: 600; color: #333; }
.child-reply-user { color: #1890ff; }
.reply-arrow { font-size: 12px; color: #999; }
.child-comment-content { font-size: 13px; color: #555; line-height: 1.5; margin: 0 0 6px; }

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
