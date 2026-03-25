<template>
  <div class="profile-page">
    <!-- 顶部个人信息卡片 -->
    <div class="profile-hero">
      <div class="profile-hero-left">
        <a-avatar
          :size="80"
          style="background-color: #52c41a; font-size: 32px; flex-shrink: 0"
          >{{ username[0] }}</a-avatar
        >
        <div class="profile-hero-info">
          <div class="profile-name">{{ username }}</div>
          <div class="profile-bio">{{ bio }}</div>
          <div class="profile-tags">
            <a-tag v-if="userRole === 'user'" color="blue">user</a-tag>
            <a-tag v-else-if="userRole === 'provider'" color="gold"
              >服务商</a-tag
            >
          </div>
        </div>
      </div>
      <div class="profile-hero-right">
        <div class="profile-stat" v-for="s in stats" :key="s.label">
          <div class="profile-stat-num">{{ s.value }}</div>
          <div class="profile-stat-label">{{ s.label }}</div>
        </div>
        <a-button type="primary" ghost size="small" @click="editVisible = true"
          >编辑资料</a-button
        >
      </div>
    </div>

    <div class="profile-body">
      <!-- 左侧主内容 -->
      <div class="profile-main">
        <!-- 数据概览 -->
        <div class="profile-card">
          <div class="card-title">数据概览</div>
          <div class="overview-grid">
            <div
              class="overview-item"
              v-for="item in overview"
              :key="item.label"
            >
              <component
                :is="item.icon"
                class="overview-icon"
                :style="{ color: item.color }"
              />
              <div class="overview-num">{{ item.value }}</div>
              <div class="overview-label">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <!-- 我的内容 tabs -->
        <div class="profile-card">
          <a-tabs v-model:activeKey="contentTab">
            <a-tab-pane key="article" tab="我的文章">
              <!-- 筛选 + 搜索 -->
              <div class="filter-bar">
                <a-tabs
                  v-model:activeKey="articleStatusFilter"
                  class="status-tabs"
                >
                  <a-tab-pane key="all" tab="全部" />
                  <a-tab-pane key="published" tab="已发布" />
                  <a-tab-pane key="draft" tab="草稿" />
                  <a-tab-pane key="review" tab="审核中" />
                </a-tabs>
                <a-input-search
                  v-model:value="articleSearchKeyword"
                  placeholder="搜索文章"
                  style="width: 200px"
                />
              </div>

              <div class="article-list">
                <div v-if="filteredArticles.length === 0" class="empty-state">
                  <EditOutlined style="font-size: 48px; color: #e0e0e0" />
                  <p>暂无文章，去写一篇吧</p>
                </div>

                <div
                  class="article-item"
                  v-for="item in filteredArticles"
                  :key="item.id"
                >
                  <img
                    v-if="item.cover"
                    :src="item.cover"
                    class="article-cover"
                    @click="goForumDetail(item.id)"
                    style="cursor: pointer"
                  />
                  <div
                    class="article-info"
                    @click="goForumDetail(item.id)"
                    style="cursor: pointer"
                  >
                    <div class="article-title">{{ item.title }}</div>
                    <div class="article-desc">{{ item.desc }}</div>
                    <div class="article-meta">
                      <a-tag size="small" color="blue">{{
                        item.category
                      }}</a-tag>
                      <span><EyeOutlined /> {{ item.readCount }}</span>
                      <span><LikeOutlined /> {{ item.likeCount }}</span>
                      <span><MessageOutlined /> {{ item.commentCount }}</span>
                      <span class="article-time">{{ item.publishTime }}</span>
                    </div>
                  </div>
                  <div class="article-right">
                    <a-tag
                      :color="articleStatusMap[item.status]?.color || 'default'"
                      size="small"
                      >{{
                        articleStatusMap[item.status]?.text || item.status
                      }}</a-tag
                    >
                    <div class="article-actions">
                      <a-button
                        size="small"
                        @click.stop="handleEditArticle(item)"
                        >编辑</a-button
                      >
                      <a-popconfirm
                        title="确认删除该文章？"
                        ok-text="删除"
                        cancel-text="取消"
                        @confirm="deleteArticle(item.id)"
                      >
                        <a-button size="small" danger @click.stop
                          >删除</a-button
                        >
                      </a-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane
              key="service"
              tab="我的服务"
              v-if="userRole === 'provider'"
            >
              <!-- 筛选 + 搜索 -->
              <div class="filter-bar">
                <a-tabs
                  v-model:activeKey="serviceStatusFilter"
                  class="status-tabs"
                >
                  <a-tab-pane key="all" tab="全部" />
                  <a-tab-pane key="on" tab="已上架" />
                  <a-tab-pane key="off" tab="已下架" />
                  <a-tab-pane key="review" tab="审核中" />
                </a-tabs>
                <a-input-search
                  v-model:value="serviceSearchKeyword"
                  placeholder="搜索服务名称"
                  style="width: 200px"
                />
              </div>

              <div class="service-list">
                <div v-if="filteredServices.length === 0" class="empty-state">
                  <ShopOutlined style="font-size: 48px; color: #e0e0e0" />
                  <p>暂无服务，去发布吧</p>
                </div>

                <div
                  class="service-item"
                  v-for="item in filteredServices"
                  :key="item.id"
                >
                  <img :src="item.cover" class="service-cover" />
                  <div class="service-info">
                    <div class="service-title">{{ item.title }}</div>
                    <div class="service-desc">{{ item.desc }}</div>
                    <div class="service-tags">
                      <a-tag
                        v-for="tag in item.tags"
                        :key="tag"
                        size="small"
                        color="blue"
                        >{{ tag }}</a-tag
                      >
                      <a-tag size="small" color="orange">{{
                        item.category
                      }}</a-tag>
                    </div>
                    <div class="service-meta">
                      <span>更新时间：{{ item.updateTime }}</span>
                    </div>
                  </div>
                  <div class="service-data">
                    <div class="data-item">
                      <div class="data-num">{{ item.orders }}</div>
                      <div class="data-label">成交订单</div>
                    </div>
                    <div class="data-item">
                      <div class="data-num">{{ item.rating }}</div>
                      <div class="data-label">评分</div>
                    </div>
                  </div>
                  <div class="service-price">¥ {{ item.price }}</div>
                  <div class="service-status">
                    <a-badge
                      :status="serviceStatusBadgeMap[item.status]?.badge"
                      :text="serviceStatusBadgeMap[item.status]?.text"
                    />
                  </div>
                  <div class="service-actions">
                    <a-button size="small" @click="editService(item)"
                      >编辑</a-button
                    >
                    <a-button
                      size="small"
                      :type="item.status === 'on' ? 'default' : 'primary'"
                      :danger="item.status === 'on'"
                      :disabled="item.status === 'review'"
                      @click="toggleServiceStatus(item)"
                    >
                      {{ item.status === "on" ? "下架" : "上架" }}
                    </a-button>
                    <a-popconfirm
                      title="确认删除该服务？"
                      ok-text="删除"
                      cancel-text="取消"
                      @confirm="deleteService(item.id)"
                    >
                      <a-button size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="demand" tab="我的需求">
              <!-- 筛选栏 -->
              <div class="filter-bar">
                <a-tabs
                  v-model:activeKey="demandStatusFilter"
                  class="status-tabs"
                >
                  <a-tab-pane key="all" tab="全部" />
                  <a-tab-pane key="open" tab="待接单" />
                  <a-tab-pane key="progress" tab="进行中" />
                  <a-tab-pane key="done" tab="已完成" />
                  <a-tab-pane key="closed" tab="已关闭" />
                </a-tabs>
                <a-input-search
                  v-model:value="demandSearchKeyword"
                  placeholder="搜索需求标题"
                  style="width: 200px"
                />
              </div>

              <div class="demand-list">
                <div v-if="filteredDemands.length === 0" class="empty-state">
                  <TrophyOutlined style="font-size: 48px; color: #e0e0e0" />
                  <p>暂无悬赏需求</p>
                </div>

                <div
                  class="demand-item"
                  v-for="item in filteredDemands"
                  :key="item.id"
                >
                  <div class="demand-main" style="cursor: pointer">
                    <div class="demand-title" @click="goDemandDetail(item.id)">
                      {{ item.title }}
                    </div>
                    <div class="demand-desc">{{ item.desc }}</div>
                    <div class="demand-tags">
                      <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                      <a-tag
                        size="small"
                        :color="getDemandUrgencyColor(item.urgency)"
                        >{{ item.urgency }}</a-tag
                      >
                    </div>
                    <div class="demand-meta">
                      <span>发布时间：{{ item.publishTime }}</span>
                      <span>截止时间：{{ item.deadline }}</span>
                      <span
                        >报名人数：<strong>{{ item.applyCount }}</strong>
                        人</span
                      >
                    </div>
                  </div>
                  <div class="demand-right">
                    <div class="demand-budget">
                      ¥ {{ item.budgetMin }} ~ ¥ {{ item.budgetMax }}
                    </div>
                    <div class="demand-status">
                      <a-badge
                        :status="demandStatusBadgeMap[item.status]?.badge"
                        :text="demandStatusBadgeMap[item.status]?.text"
                      />
                    </div>
                    <div class="demand-actions">
                      <a-button
                        size="small"
                        @click.stop="goDemandDetail(item.id)"
                        >查看详情</a-button
                      >
                      <a-button
                        size="small"
                        v-if="item.status === 'PENDING'"
                        @click.stop="editDemand(item)"
                        >编辑</a-button
                      >
                      <a-button
                        size="small"
                        v-if="item.status === 'PENDING'"
                        @click.stop="
                          item.status = 'CLOSED';
                          message.success('已关闭');
                        "
                        >关闭</a-button
                      >
                      <a-popconfirm
                        title="确认删除？"
                        ok-text="删除"
                        cancel-text="取消"
                        @confirm="deleteDemand(item.id)"
                      >
                        <a-button size="small" danger @click.stop
                          >删除</a-button
                        >
                      </a-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="profile-side">
        <!-- 快捷入口 -->
        <div class="profile-card">
          <div class="card-title">快捷入口</div>
          <div class="shortcut-grid">
            <div
              class="shortcut-item"
              v-for="s in shortcuts"
              :key="s.label"
              @click="s.action()"
            >
              <component
                :is="s.icon"
                class="shortcut-icon"
                :style="{ color: s.color }"
              />
              <span>{{ s.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <a-modal
      v-model:open="editVisible"
      title="编辑资料"
      @ok="saveProfile"
      ok-text="保存"
      cancel-text="取消"
    >
      <a-form layout="vertical" style="margin-top: 8px">
        <a-form-item label="昵称">
          <a-input v-model:value="editForm.username" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea
            v-model:value="editForm.bio"
            :rows="3"
            placeholder="介绍一下自己"
            :maxlength="100"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  FileTextOutlined,
  ShopOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HistoryOutlined,
  EditOutlined,
  WalletOutlined,
  StarOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();

const username = ref(localStorage.getItem("username") || "用户");
const userRole = ref(localStorage.getItem("userRole") || "user"); // 获取用户角色
const bio = ref("热爱技术，专注于全栈开发与AI应用探索");
const editVisible = ref(false);
const contentTab = ref("article");

// 文章筛选
const articleStatusFilter = ref("all");
const articleSearchKeyword = ref("");
const articleStatusMap = {
  published: { text: "已发布", color: "green" },
  draft: { text: "草稿", color: "default" },
  review: { text: "审核中", color: "orange" },
};

// 服务筛选
const serviceStatusFilter = ref("all");
const serviceSearchKeyword = ref("");
const serviceStatusBadgeMap = {
  on: { badge: "success", text: "已上架" },
  off: { badge: "default", text: "已下架" },
  review: { badge: "processing", text: "审核中" },
};

// 需求筛选
const demandStatusFilter = ref("all");
const demandSearchKeyword = ref("");
const demandStatusBadgeMap = {
  PENDING: { badge: "success", text: "待接单" },
  PROCESSING: { badge: "processing", text: "进行中" },
  COMPLETED: { badge: "default", text: "已完成" },
  CLOSED: { badge: "error", text: "已关闭" },
  CANCELLED: { badge: "error", text: "已取消" },
};

// 服务状态映射（用于标签颜色）
const serviceStatusMap = {
  on: { text: "已上架", color: "green" },
  off: { text: "已下架", color: "default" },
  review: { text: "审核中", color: "orange" },
};

// 需求状态映射（用于标签颜色）
const demandStatusMap = {
  PENDING: { text: "待接单", color: "orange" },
  PROCESSING: { text: "进行中", color: "blue" },
  COMPLETED: { text: "已完成", color: "green" },
  CLOSED: { text: "已关闭", color: "default" },
  CANCELLED: { text: "已取消", color: "red" },
};

const editForm = reactive({
  username: username.value,
  bio: bio.value,
});

const saveProfile = () => {
  username.value = editForm.username;
  bio.value = editForm.bio;
  editVisible.value = false;
};

const stats = ref([
  { label: "粉丝", value: "1.2k" },
  { label: "关注", value: 141 },
  { label: "获赞", value: "3.8k" },
  { label: "文章", value: 28 },
]);

const overview = ref([
  { label: "总阅读量", value: "12.5k", color: "#1890ff", icon: EyeOutlined },
  { label: "总获赞", value: "3.8k", color: "#ff4d4f", icon: LikeOutlined },
  { label: "总评论", value: 286, color: "#52c41a", icon: MessageOutlined },
  { label: "发布文章", value: 28, color: "#722ed1", icon: FileTextOutlined },
  ...(userRole.value === "provider"
    ? [{ label: "上架服务", value: 5, color: "#fa8c16", icon: ShopOutlined }]
    : []),
  { label: "悬赏需求", value: 3, color: "#13c2c2", icon: TrophyOutlined },
]);

const assets = ref([
  {
    label: "账户余额",
    value: "¥ 1,280.00",
    color: "#ff4d4f",
    icon: WalletOutlined,
  },
]);

const shortcuts = [
  {
    label: "我的订单",
    icon: ShoppingCartOutlined,
    color: "#1890ff",
    action: () => router.push("/user/orders"),
  },
  {
    label: "我的收藏",
    icon: HeartOutlined,
    color: "#ff4d4f",
    action: () => router.push("/user/favorites"),
  },
  {
    label: "浏览历史",
    icon: HistoryOutlined,
    color: "#fa8c16",
    action: () => router.push("/user/history"),
  },
  {
    label: "我的关注",
    icon: StarOutlined,
    color: "#52c41a",
    action: () => router.push("/user/following"),
  },
  {
    label: "创作中心",
    icon: EditOutlined,
    color: "#722ed1",
    action: () => router.push("/user/creator-center"),
  },
  {
    label: "服务市场",
    icon: ShopOutlined,
    color: "#13c2c2",
    action: () => router.push("/user/service-market"),
  },
];

const myArticles = ref([
  {
    id: 1,
    title: "深入解析CPU调度：操作系统的核心资源分配机制",
    desc: "本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法...",
    category: "操作系统",
    cover: "https://placehold.co/100x70/1890ff/FFFFFF?text=OS",
    readCount: "1.5k",
    likeCount: 34,
    commentCount: 12,
    publishTime: "2026-02-27",
    status: "published",
  },
  {
    id: 2,
    title: "Vue3 Composition API 最佳实践总结",
    desc: "深入讲解 Vue3 组合式 API 的使用技巧，包括 setup、响应式、生命周期等核心概念...",
    category: "Vue",
    cover: "https://placehold.co/100x70/42b883/FFFFFF?text=Vue3",
    readCount: "2.3k",
    likeCount: 67,
    commentCount: 23,
    publishTime: "2026-02-20",
    status: "published",
  },
  {
    id: 3,
    title: "Docker容器化部署实战指南",
    desc: "从Docker基础到生产环境部署，手把手带你完成容器化改造...",
    category: "运维",
    cover: "https://placehold.co/100x70/0db7ed/FFFFFF?text=Docker",
    readCount: 890,
    likeCount: 21,
    commentCount: 8,
    publishTime: "2026-02-15",
    status: "draft",
  },
]);

const myServices = ref([
  {
    id: 1,
    title: "Java大厂面试课，一套搞定offer",
    desc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟",
    price: 399,
    orders: 128,
    rating: "4.9",
    cover: "https://placehold.co/120x80/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证"],
    category: "Java",
    updateTime: "2026-02-25",
    status: "on",
  },
  {
    id: 2,
    title: "Vue3 + TypeScript 企业级实战",
    desc: "从零搭建企业级前端项目，涵盖架构设计、性能优化、工程化实践",
    price: 299,
    orders: 86,
    rating: "4.8",
    cover: "https://placehold.co/120x80/42b883/FFFFFF?text=Vue3",
    tags: ["平台保障"],
    category: "Vue/React",
    updateTime: "2026-02-18",
    status: "review",
  },
]);

const myDemands = ref([
  {
    id: 1,
    title: "MiniMax-M2.1 智能客服系统开发",
    desc: "需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别",
    budgetMin: 3000,
    budgetMax: 5000,
    type: "人工智能",
    urgency: "紧急",
    applyCount: 12,
    publishTime: "2026-03-03",
    deadline: "2026-03-31",
    status: "PENDING",
  },
  {
    id: 2,
    title: "React Native 跨平台移动端应用",
    desc: "开发一款电商类App，需要支持iOS和Android双端",
    budgetMin: 10000,
    budgetMax: 15000,
    type: "移动开发",
    urgency: "一般",
    applyCount: 7,
    publishTime: "2026-02-28",
    deadline: "2026-04-15",
    status: "PROCESSING",
  },
]);

// 筛选函数
const filteredArticles = computed(() => {
  let list = myArticles.value;
  if (articleStatusFilter.value !== "all") {
    list = list.filter((a) => a.status === articleStatusFilter.value);
  }
  if (articleSearchKeyword.value.trim()) {
    list = list.filter((a) =>
      a.title.includes(articleSearchKeyword.value.trim()),
    );
  }
  return list;
});

const filteredServices = computed(() => {
  let list = myServices.value;
  if (serviceStatusFilter.value !== "all") {
    list = list.filter((s) => s.status === serviceStatusFilter.value);
  }
  if (serviceSearchKeyword.value.trim()) {
    list = list.filter((s) =>
      s.title.includes(serviceSearchKeyword.value.trim()),
    );
  }
  return list;
});

const filteredDemands = computed(() => {
  let list = myDemands.value;
  if (demandStatusFilter.value !== "all") {
    list = list.filter((d) => d.status === demandStatusFilter.value);
  }
  if (demandSearchKeyword.value.trim()) {
    list = list.filter((d) =>
      d.title.includes(demandSearchKeyword.value.trim()),
    );
  }
  return list;
});

// 文章操作
const handleEditArticle = (item) => {
  if (item.status === "draft") {
    router.push({ name: "WriteArticle", query: { id: item.id, draft: 1 } });
  } else {
    router.push({ name: "WriteArticle", query: { id: item.id, edit: 1 } });
  }
};

const deleteArticle = (id) => {
  myArticles.value = myArticles.value.filter((a) => a.id !== id);
  message.success("已删除");
};

// 服务操作
const editService = (item) => {
  router.push({ name: "CreatorCenter", query: { editServiceId: item.id } });
};

const toggleServiceStatus = (item) => {
  if (item.status === "on") {
    item.status = "off";
    message.success("已下架");
  } else {
    item.status = "on";
    message.success("已上架");
  }
};

const deleteService = (id) => {
  myServices.value = myServices.value.filter((s) => s.id !== id);
  message.success("已删除");
};

// 需求操作
const editDemand = (item) => {
  // TODO: 跳转到需求编辑页面
  message.info("编辑需求功能开发中");
};

const deleteDemand = (id) => {
  myDemands.value = myDemands.value.filter((d) => d.id !== id);
  message.success("已删除");
};

const getDemandUrgencyColor = (urgency) => {
  const colorMap = { 紧急: "orange", 一般: "blue", 常规: "default" };
  return colorMap[urgency] || "default";
};

const goForumDetail = (id) =>
  router.push({ name: "MyForumDetail", params: { id } });
const goServiceDetail = (id) =>
  router.push({
    name: "ServiceDetail",
    params: { id },
    query: { from: "my-services" },
  });
const goDemandDetail = (id) =>
  router.push({
    name: "DemandDetail",
    params: { id },
    query: { from: "my-demands" },
  });
</script>

<style scoped>
.profile-page {
  width: 100%;
}

/* Hero */
.profile-hero {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.profile-hero-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-hero-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-name {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}
.profile-bio {
  font-size: 13px;
  color: #888;
  max-width: 400px;
}
.profile-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.profile-hero-right {
  display: flex;
  align-items: center;
  gap: 28px;
}
.profile-stat {
  text-align: center;
  cursor: pointer;
}
.profile-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}
.profile-stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* Layout */
.profile-body {
  display: flex;
  gap: 16px;
}
.profile-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.profile-side {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card */
.profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

/* Overview */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}
.overview-icon {
  font-size: 22px;
}
.overview-num {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}
.overview-label {
  font-size: 12px;
  color: #999;
}

/* Content list */
.empty-state {
  padding: 32px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
}
.content-item-cover {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}
.content-item-info {
  flex: 1;
  min-width: 0;
}
.content-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.content-item-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: #bbb;
}
.content-item-time {
  margin-left: auto;
}
.content-item-price {
  font-size: 15px;
  font-weight: 700;
  color: #ff4d4f;
  flex-shrink: 0;
}

/* Assets */
.asset-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.asset-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.asset-label {
  font-size: 13px;
  color: #555;
}
.asset-value {
  font-size: 14px;
  font-weight: 600;
}

/* Shortcuts */
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #555;
}
.shortcut-item:hover {
  background: #e6f7ff;
  color: #1890ff;
}
.shortcut-icon {
  font-size: 20px;
}

.service-manage-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

/* 筛选栏 */
.filter-bar {
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.status-tabs {
  margin-bottom: 0;
}
.status-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}
.status-tabs :deep(.ant-tabs-nav::before) {
  border: none;
}
.status-tabs :deep(.ant-tabs-nav-operations) {
  display: none !important;
}

/* 文章列表 - 与 my-forum.vue 一致 */
.article-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.empty-state {
  padding: 60px;
  text-align: center;
  color: #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.article-item:last-child {
  border-bottom: none;
}
.article-cover {
  width: 100px;
  height: 70px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.article-info {
  flex: 1;
  min-width: 0;
}
.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.article-title:hover {
  color: #1890ff;
}
.article-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: #bbb;
}
.article-time {
  margin-left: auto;
}
.article-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.article-actions {
  display: flex;
  gap: 6px;
}

/* 服务列表 - 与 my-services.vue 一致 */
.service-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.service-item:last-child {
  border-bottom: none;
}
.service-cover {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.service-info {
  flex: 1;
  min-width: 0;
}
.service-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.service-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #bbb;
}
.service-data {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}
.data-item {
  text-align: center;
}
.data-num {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}
.data-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.service-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff4d4f;
  flex-shrink: 0;
  width: 80px;
  text-align: right;
}
.service-status {
  flex-shrink: 0;
  width: 70px;
}
.service-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

/* 需求列表 - 与 my-demands.vue 一致 */
.demand-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.demand-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.demand-item:last-child {
  border-bottom: none;
}
.demand-main {
  flex: 1;
  min-width: 0;
}
.demand-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  cursor: pointer;
}
.demand-title:hover {
  color: #1890ff;
}
.demand-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.demand-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.demand-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #bbb;
}
.demand-meta strong {
  color: #fa8c16;
}
.demand-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}
.demand-budget {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}
.demand-actions {
  display: flex;
  gap: 6px;
}
</style>
