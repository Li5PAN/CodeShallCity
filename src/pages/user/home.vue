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
            <span class="forum-name">{{ item.name }}</span>
            <RightOutlined class="forum-arrow" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { useRouter } from "vue-router";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  RightOutlined,
  StarFilled,
} from "@ant-design/icons-vue";

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

const rewardList = ref([
  {
    id: 1,
    tag: "紧急",
    title: "MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发",
    desc: "基于最新AI技术，提供高效的智能应用开发解决方案，支持多种场景应用，帮助企业快速构建智能化系统",
    author: "李XXX",
  },
  {
    id: 2,
    tag: "一般",
    title: "PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率",
    desc: "专业的OCR识别工具开发需求，需要支持多语言识别和文档智能处理，提升企业文档数字化效率",
    author: "王哈哈",
  },
  {
    id: 3,
    tag: "常规",
    title: "CHATERMAI：开启云资源氛围管理新篇章！",
    desc: "云资源管理平台开发，需要实现资源监控、自动化部署、成本优化等功能，提升云资源使用效率",
    author: "向前开",
  },
]);

const goToDemandBounty = () => {
  router.push("/user/demand-bounty");
};

const goToTechForum = () => {
  router.push("/user/tech-forum");
};

const goToServiceMarket = () => {
  router.push("/user/service-market");
};

// 精选服务数据 - 使用服务市场的模拟数据
const featuredServices = ref([
  {
    id: 1,
    title: "Java大厂面试冲刺班",
    desc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套模拟面试和简历优化",
    price: 399,
    cover: "https://placehold.co/200x120/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证", "7天无理由"],
    provider: "李老师",
    orders: 1258,
    rating: 4.9,
  },
  {
    id: 2,
    title: "MySQL数据库性能优化实战",
    desc: "从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表等高级话题",
    price: 499,
    cover: "https://placehold.co/200x120/FF6600/FFFFFF?text=MySQL",
    tags: ["平台保障", "官方认证", "售后答疑"],
    provider: "数据库老王",
    orders: 896,
    rating: 4.8,
  },
  {
    id: 3,
    title: "Redis缓存架构设计与实战",
    desc: "深入讲解Redis数据结构、持久化、集群方案，结合电商场景实战",
    price: 399,
    cover: "https://placehold.co/200x120/DC143C/FFFFFF?text=Redis",
    tags: ["平台保障", "源码解析", "项目实战"],
    provider: "缓存专家张工",
    orders: 756,
    rating: 4.9,
  },
  {
    id: 4,
    title: "Vue3企业级项目实战课程",
    desc: "从零构建企业级Vue3项目，涵盖Composition API、TypeScript、Pinia状态管理",
    price: 399,
    cover: "https://placehold.co/200x120/42b883/FFFFFF?text=Vue3",
    tags: ["平台保障", "TS认证", "终身更新"],
    provider: "前端架构师小李",
    orders: 1123,
    rating: 4.9,
  },
  {
    id: 5,
    title: "Python数据分析与可视化",
    desc: "Pandas、NumPy、Matplotlib、ECharts，从数据处理到可视化呈现全流程",
    price: 299,
    cover: "https://placehold.co/200x120/3776AB/FFFFFF?text=Python",
    tags: ["平台保障", "数据分析认证"],
    provider: "数据分析师阿华",
    orders: 634,
    rating: 4.7,
  },
  {
    id: 6,
    title: "Go语言微服务架构实战",
    desc: "gRPC、K8s、Gin框架、Prometheus监控，打造高性能微服务",
    price: 499,
    cover: "https://placehold.co/200x120/00ADD8/FFFFFF?text=Go",
    tags: ["平台保障", "Go语言认证"],
    provider: "Go语言布道师",
    orders: 423,
    rating: 4.8,
  },
]);

const forumList = ref([
  { id: 1, name: "海洋开发者中文社区" },
  { id: 2, name: "Harmony OS开发者社区" },
  { id: 3, name: "高飞AI开发者大赛论坛" },
  { id: 4, name: "深度学习开发者大赛论坛" },
  { id: 5, name: "NVIDIA AI智能开发论坛" },
  { id: 6, name: "智能制造与物联网论坛" },
  { id: 7, name: "DARPA开发者论坛" },
  { id: 8, name: "清华社区" },
  { id: 9, name: "JAVA社区" },
]);
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
