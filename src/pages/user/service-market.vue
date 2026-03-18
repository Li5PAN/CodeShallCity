<template>
  <div class="service-market-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-input
        v-model:value="searchValue"
        placeholder="搜索服务"
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
          @click="handleCategoryClick(item)"
        >
          {{ item.name }}
        </div>
        <a-dropdown v-if="hasOverflow" trigger="click">
          <div class="more-btn">
            更多
            <DownOutlined />
          </div>
          <template #overlay>
            <a-menu
              @click="
                ({ key }) =>
                  handleCategoryClick(allCategories.find((c) => c.key === key))
              "
            >
              <a-menu-item v-for="item in hiddenCategories" :key="item.key">
                {{ item.name }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <a-row :gutter="[16, 16]" class="service-list">
      <a-col
        :xs="24"
        :sm="12"
        :md="6"
        v-for="item in serviceList"
        :key="item.id"
      >
        <a-card
          :bordered="false"
          class="service-card"
          @click="openDetail('service', { id: item.id })"
          style="cursor: pointer"
        >
          <div
            class="card-cover"
            :style="{ backgroundImage: `url(${item.cover})` }"
          ></div>
          <div class="card-content">
            <h4 class="card-title">{{ item.title }}</h4>
            <p class="card-desc">{{ item.desc }}</p>
            <div class="card-tags">
              <a-tag
                v-for="tag in item.tags"
                :key="tag"
                :color="tag === '平台保障' ? 'green' : 'blue'"
                size="small"
                >{{ tag }}</a-tag
              >
            </div>
            <div class="card-footer">
              <span class="price">¥ {{ item.price }}</span>
              <span class="stats">提供商:李XXX 成交:1000+</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalServices"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, computed } from "vue";
import {
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";

const openDetail = inject("openDetail");

const searchValue = ref("");
const activeCategory = ref("all");

const handleSearch = (value) => {
  console.log("搜索服务:", value);
};

const allCategories = [
  { key: "all", name: "全部" },
  { key: "big-data", name: "大数云计" },
  { key: "algorithm", name: "算法与数据" },
  { key: "data-science", name: "数据科学" },
  { key: "iot", name: "物联网" },
  { key: "project-management", name: "项目管理与协作工" },
  { key: "blockchain", name: "区块链技" },
  { key: "ai", name: "人工智能" },
];

const MAX_VISIBLE = 8;
const hasOverflow = computed(() => allCategories.length > MAX_VISIBLE);
const visibleCategories = computed(() => allCategories.slice(0, MAX_VISIBLE));
const hiddenCategories = computed(() => allCategories.slice(MAX_VISIBLE));

const handleCategoryClick = (item) => {
  if (!item) return;
  activeCategory.value = item.key;
  handleCategoryChange(item.key);
};

const serviceList = reactive([
  {
    id: 1,
    title: "Java大厂面试�?一套搞定offer",
    desc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模",
    price: 399,
    cover: "https://placehold.co/240x120/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证", "7天无理由"],
  },
  {
    id: 2,
    title: "10天精通MySQL 讲的特别深入的那",
    desc: "从底层原理到实战优化，涵盖索引、事务、锁机制、分库分",
    price: 399,
    cover: "https://placehold.co/240x120/FF6600/FFFFFF?text=MySQL",
    tags: ["平台保障", "官方认证", "售后答疑"],
  },
  {
    id: 3,
    title: "颠覆你认知的八股盛宴",
    desc: "打破传统八股文，结合实战场景讲解，让面试官眼前一",
    price: 399,
    cover: "https://via.placeholder.com/240x120/FF4444/FFFFFF?text=八股",
    tags: ["平台保障", "一对一辅导", "终身更新"],
  },
  {
    id: 4,
    title: "RabbitMQ 2天入门到实战",
    desc: "从安装部署到高可用架构，结合电商场景实现消息队列实战",
    price: 399,
    cover: "https://placehold.co/240x120/0099FF/FFFFFF?text=RabbitMQ",
    tags: ["平台保障", "项目实战", "源码解析"],
  },
]);
const currentPage = ref(1);
const pageSize = ref(12);
const totalServices = ref(120);

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  console.log("分页变化:", page, size);
};

const handleCategoryChange = (key) => {
  console.log("切换到分类:", key);
};
</script>

<style scoped>
.service-market-page {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

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
.category-tag:hover {
  background: #e9ecef;
}
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
.more-btn:hover {
  background: #e9ecef;
  color: #52c41a;
}

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

.service-list {
  flex: 1;
}
.service-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card-cover {
  height: 120px;
  background-size: cover;
  background-position: center;
}
.card-content {
  padding: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.card-tags {
  margin-bottom: 10px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}
.price {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 14px;
}
.stats {
  color: #999;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 24px 0;
}
</style>
