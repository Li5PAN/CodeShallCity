<template>
  <div class="content-wrapper">
    <!-- 左侧主内容 -->
    <div class="content-left">
      <!-- Banner区域 -->
      <div class="banner">
        <h1>找专业人做专业事 多快好省</h1>
        <p>IT服务平台</p>
      </div>

      <!-- 需求悬赏 -->
      <div class="section">
        <div class="section-header">
          <h3>需求悬赏</h3>
          <a class="section-more" @click="goToDemandBounty">更多需求 ></a>
        </div>
        <a-row :gutter="[16, 16]">
          <a-col :span="8" v-for="item in rewardList" :key="item.id">
            <div
              class="reward-card"
              @click="openDetail('demand', { id: item.id })"
            >
              <a-tag :color="getUrgencyColor(item.tag)" class="reward-tag">{{
                item.tag
              }}</a-tag>
              <h4>{{ item.title }}</h4>
              <p class="reward-desc">{{ item.desc }}</p>
              <div class="reward-footer">
                <span>{{ item.author }}</span>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 精选服务 -->
      <div class="section">
        <div class="section-header">
          <h3>精选服务</h3>
          <span class="article-tab active" @click="goToServiceMarket"
            >更多服务 ></span
          >
        </div>
        <div class="service-list">
          <div
            class="service-item"
            v-for="item in featuredServices"
            :key="item.id"
            @click="openDetail('service', { id: item.id })"
          >
            <div class="service-info">
              <div class="service-meta-top">
                <span class="service-author">{{ item.provider }}</span>
                <span class="service-orders">{{ item.orders }}+成交</span>
              </div>
              <h4 class="service-title">{{ item.title }}</h4>
              <p class="service-desc">{{ item.desc }}</p>
              <div class="service-tags">
                <a-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="small"
                  :color="tag === '平台保障' ? 'green' : 'blue'"
                >{{ tag }}</a-tag>
              </div>
              <div class="service-footer">
                <span class="service-rating" v-if="item.rating">
                  <StarFilled style="color: #faad14; font-size: 12px" />
                  {{ item.rating }}
                </span>
              </div>
            </div>
            <div class="service-cover" v-if="item.cover">
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
          <h4>论坛文章推荐</h4>
          <a class="more-link" @click="goToTechForum">更多</a>
        </div>
        <div class="forum-list">
          <div
            class="forum-item"
            v-for="item in forumList"
            :key="item.id"
            @click="openDetail('forum', { id: item.id })"
          >
            <span class="forum-name">{{ item.title }}</span>
            <RightOutlined class="forum-arrow" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  RightOutlined,
  StarFilled,
} from "@ant-design/icons-vue";
import { getHomeDemands, getHomeGoods, getHomePosts } from "@/service/user/uindex";

const router = useRouter();
const openDetail = inject("openDetail");

// 获取紧急程度颜色
const getUrgencyColor = (urgency) => {
  const colorMap = {
    紧急: "orange",
    一般: "blue",
    常规: "default",
  };
  return colorMap[urgency] || "default";
};

// 需求悬赏列表数据
const rewardList = ref([]);

// 加载首页需求悬赏数据
const loadDemandData = async () => {
  try {
    const res = await getHomeDemands({ pageNum: 1, pageSize: 6 })
    if (res.code === 0 && res.data) {
      // 将接口数据映射到卡片展示所需的格式
      rewardList.value = res.data.map(item => ({
        id: item.id,
        tag: item.urgency,
        title: item.demandTitle,
        desc: item.demandDescription,
        author: item.userName
      }))
    }
  } catch (error) {
    console.error('加载需求悬赏数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadDemandData()
})

const goToDemandBounty = () => {
  router.push("/user/demand-bounty");
};

const goToTechForum = () => {
  router.push("/user/tech-forum");
};

const goToServiceMarket = () => {
  router.push("/user/service-market");
};

// 精选服务数据
const featuredServices = ref([])

// 加载精选服务数据
const loadFeaturedServices = async () => {
  try {
    const res = await getHomeGoods({ pageNum: 1, pageSize: 6 })
    if (res.code === 0 && res.data) {
      featuredServices.value = res.data.map(item => ({
        id: item.id,
        title: item.title,
        desc: item.description,
        cover: item.picture,
        tags: item.tag ? item.tag.split(',') : [],
        provider: item.merchantName,
        orders: item.salesCount || 0,
        rating: item.goodRating
      }))
    }
  } catch (error) {
    console.error('加载精选服务数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadDemandData()
  loadFeaturedServices()
})

const forumList = ref([])

// 加载论坛文章推荐数据
const loadForumPosts = async () => {
  try {
    const res = await getHomePosts({ pageNo: 1, pageSize: 10 })
    if (res.code === 0 && res.data) {
      forumList.value = res.data.map(item => ({
        id: item.id,
        title: item.postTitle
      }))
    }
  } catch (error) {
    console.error('加载论坛文章推荐数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadDemandData()
  loadFeaturedServices()
  loadForumPosts()
})
</script>

<style scoped>
.content-wrapper {
  display: flex;
  gap: 20px;
  width: 100%;
}
.content-left {
  flex: 1;
  min-width: 0;
}
.content-right {
  width: 280px;
  flex-shrink: 0;
}

.banner {
  background: linear-gradient(135deg, #52c41a 0%, rgb(135, 208, 104) 100%);
  color: #fff;
  padding: 40px 32px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.banner h1 {
  font-size: 28px;
  margin: 0 0 12px 0;
  color: #fff;
  font-weight: 700;
}
.banner p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.section {
  margin-bottom: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.section-more {
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
}

.reward-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.reward-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.reward-tag {
  margin: 0 0 8px 0;
}
.reward-card h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.4;
}
.reward-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.reward-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.article-tab {
  font-size: 13px;
  color: #1890ff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}
.article-tab:hover {
  opacity: 0.8;
}
.article-list {
  background: #fff;
  border-radius: 8px;
}
.article-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.article-item:hover {
  background: #fafafa;
}
.article-item:last-child {
  border-bottom: none;
}
.article-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}
.article-meta-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.article-author {
  font-size: 12px;
  color: #999;
}
.article-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}
.article-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}
.article-cover img {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

/* 精选服务样式 */
.service-list {
  background: #fff;
  border-radius: 8px;
}
.service-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}
.service-item:hover {
  background: #fafafa;
}
.service-item:last-child {
  border-bottom: none;
}
.service-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}
.service-meta-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.service-author {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}
.service-orders {
  font-size: 12px;
  color: #999;
}
.service-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.4;
}
.service-item:hover .service-title {
  color: #1890ff;
}
.service-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.service-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}
.service-rating {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}
.service-cover img {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.right-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.right-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.right-section-header h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.more-link {
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
}
.forum-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.forum-item:last-child {
  border-bottom: none;
}
.forum-item:hover .forum-name {
  color: #1890ff;
}
.forum-name {
  font-size: 13px;
  color: #333;
}
.forum-arrow {
  font-size: 10px;
  color: #ccc;
}
</style>
