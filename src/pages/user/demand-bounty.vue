<template>
  <div class="reward-content">

    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-input
        v-model:value="searchValue"
        placeholder="搜索需求"
        class="search-input"
        @keyup.enter="handleSearch(searchValue)"
      >
        <template #prefix><SearchOutlined class="search-icon" /></template>
      </a-input>
      <a-button class="search-btn" @click="handleSearch(searchValue)"
        >搜索</a-button
      >
    </div>

    <!-- 分类导航栏 -->
    <div class="category-nav">
      <div class="category-tags">
        <div
          v-for="item in visibleCategories"
          :key="item.key"
          class="category-tag"
          :class="{ active: activeCategory === item.key }"
          @click="activeCategory = item.key"
        >
          {{ item.name }}
        </div>
        <a-dropdown v-if="hasOverflow" trigger="click">
          <div class="more-btn">
            更多
            <DownOutlined />
          </div>
          <template #overlay>
            <a-menu @click="({ key }) => activeCategory = key">
              <a-menu-item v-for="item in hiddenCategories" :key="item.key">
                {{ item.name }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
    <div class="service-grid">
      <div class="service-row" v-for="(row, index) in serviceRows" :key="index">
        <div
          class="service-card"
          v-for="item in row"
          :key="item.id"
          @click="openDetail('demand', { id: item.id })"
        >
          <div class="card-header">
            <h4 class="card-title">{{ item.title }}</h4>
            <a-tag :color="getUrgencyColor(item.urgency)" class="urgency-tag">{{
              item.urgency
            }}</a-tag>
          </div>
          <p class="card-desc">{{ item.desc }}</p>
          <div class="card-footer">
            <a-tag class="type-tag">{{ item.tag }}</a-tag>
            <div class="card-actions">
              <span class="card-price"
                >¥{{ item.minPrice }} ~ ¥{{ item.maxPrice }}</span
              >
              <a
                class="card-detail"
                @click.stop="openDetail('demand', { id: item.id })"
                >查看详情 ></a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalDemands"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import { SearchOutlined, DownOutlined } from "@ant-design/icons-vue";

const openDetail = inject("openDetail");

const searchValue = ref("");

const handleSearch = (value) => {
  console.log("搜索需求:", value);
};

// 获取紧急程度颜色
const getUrgencyColor = (urgency) => {
  const colorMap = {
    紧急: "orange",
    一般: "blue",
    常规: "default",
  };
  return colorMap[urgency] || "default";
};

// 分类标签数据
const allCategories = [
  { key: "recommend", name: "全部" },
  { key: "website", name: "网站开发" },
  { key: "wechat", name: "微信开发" },
  { key: "mini-program", name: "小程序开发" },
  { key: "app", name: "APP开发" },
];
const MAX_VISIBLE = 8
const hasOverflow = computed(() => allCategories.length > MAX_VISIBLE)
const visibleCategories = computed(() => allCategories.slice(0, MAX_VISIBLE))
const hiddenCategories = computed(() => allCategories.slice(MAX_VISIBLE))

// 当前选中的分类
const activeCategory = ref("recommend");

// 模拟服务数据（和图片一致）
const serviceList = ref([
  {
    id: 1,
    title: "MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发",
    desc: "基于最新AI技术，提供高效的智能应用开发解决方案，支持多种场景应用，帮助企业快速构建智能化系统",
    tag: "Python",
    minPrice: 3000,
    maxPrice: 5000,
    urgency: "紧急",
  },
  {
    id: 2,
    title: "PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率",
    desc: "专业的OCR识别工具开发需求，需要支持多语言识别和文档智能处理，提升企业文档数字化效率",
    tag: "Python",
    minPrice: 2500,
    maxPrice: 4500,
    urgency: "一般",
  },
  {
    id: 3,
    title: "CHATERMAI：开启云资源氛围管理新篇章！",
    desc: "云资源管理平台开发，需要实现资源监控、自动化部署、成本优化等功能，提升云资源使用效率",
    tag: "人工智能",
    minPrice: 5000,
    maxPrice: 8000,
    urgency: "紧急",
  },
  {
    id: 4,
    title: "欧拉操作系统内核开源，助力开发者获取源码与技术",
    desc: "操作系统内核开发与优化项目，需要深入理解Linux内核机制，进行性能优化和功能扩展",
    tag: "C",
    minPrice: 8000,
    maxPrice: 15000,
    urgency: "一般",
  },
]);

// 将服务列表按每行2个分组，重复展示模拟多行效果
const serviceRows = computed(() => {
  const rows = [];
  const list = [...serviceList.value];
  // 重复3次数据，和图片中展示的行数一致
  const repeatList = [...list, ...list, ...list];

  while (repeatList.length) {
    rows.push(repeatList.splice(0, 2));
  }
  return rows;
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(6);
const totalDemands = ref(48);

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  console.log("需求悬赏分页:", page, size);
};
</script>

<style scoped>
/* 核心内容容器 */
.reward-content {
  width: 100%;
}

/* 页面标题 */
.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 搜索栏 */
/* 页面标题 */
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2f3e;
  margin: 0 0 16px;
  line-height: 1.4;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  max-width: 600px;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  height: 40px;
  border-radius: 20px 0 0 20px;
  background: #f5f7fa;
  border-color: #e6e8ec;
  border-right: none;
}
.search-input:focus {
  border-color: #52c41a;
  box-shadow: none;
}
.search-icon {
  color: #bfbfbf;
  font-size: 14px;
}
.search-btn {
  height: 40px;
  width: 80px;
  border-radius: 0 20px 20px 0;
  background: #52c41a;
  border-color: #52c41a;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}
.search-btn:hover {
  background: #389e0d;
  border-color: #389e0d;
  color: #fff;
}

/* 分类导航 */
.category-nav {
  margin-bottom: 24px;
}
.category-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  background: #f5f7fa;
  color: #5e6d82;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.category-tag:hover { background: #e9ecef; }
.category-tag.active {
  background: #52c41a;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(82, 196, 26, 0.2);
}

.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  background: #f5f7fa;
  color: #5e6d82;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.more-btn:hover { background: #e9ecef; color: #52c41a; }

/* 响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  .search-bar {
    max-width: 100%;
  }
  .category-tags {
    flex-wrap: wrap;
    overflow: visible;
  }
}

.category-more {
  margin-left: 16px;
  color: red;
  cursor: pointer;
  font-size: 14px;
}

/* 服务卡片网格 */
.service-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

/* 单个服务卡片 */
.service-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.card-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.urgency-tag {
  flex-shrink: 0;
  margin: 0;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.type-tag {
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
  border: none;
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: 600;
}

.card-detail {
  font-size: 14px;
  color: #1890ff;
  text-decoration: none;
  white-space: nowrap;
}

.card-detail:hover {
  color: #40a9ff;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .service-row {
    flex-direction: column;
  }

  .category-tabs {
    flex-wrap: wrap;
  }

  .pagination-controls {
    flex-wrap: wrap;
  }
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
  margin-top: 8px;
}
</style>
