<template>
  <div class="tech-forum-content">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-input
        v-model:value="searchValue"
        placeholder="搜索文章"
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

    <!-- 主体内容：文章列表 + 右侧推荐 -->
    <div class="main-content">
      <!-- 左侧文章列表 -->
      <div class="article-list">
        <div v-if="loading" class="empty-state">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>
        <div v-else-if="paginatedArticleList.length === 0" class="empty-state">
          <SearchOutlined style="font-size: 48px; color: #e0e0e0" />
          <p>暂无相关文章</p>
        </div>
        <div
          class="article-item"
          v-for="item in paginatedArticleList"
          :key="item.id"
          style="cursor: pointer"
          @click="openDetail('forum', { id: item.id })"
        >
          <div class="article-header">
            <a-avatar
              :size="28"
              :style="{ backgroundColor: item.authorColor }"
              >{{ item.author[0] }}</a-avatar
            >
            <span class="author-name">{{ item.author }}</span>
            <span class="article-time">{{ item.publishTime }}</span>
          </div>
          <div class="article-body">
            <div class="article-text">
              <h4 class="article-title">{{ item.title }}</h4>
              <p class="article-desc">{{ item.desc }}</p>
            </div>
            <img
              v-if="item.cover"
              :src="item.cover"
              class="article-cover"
              alt=""
            />
          </div>
        </div>
      </div>

      <!-- 右侧推荐论坛 -->
      <div class="right-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">推荐论坛</div>
          <div class="community-list">
            <div class="community-item" v-for="c in communityList" :key="c.key">
              <span class="community-name">{{ c.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalArticles"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from "vue";
import { SearchOutlined, DownOutlined } from "@ant-design/icons-vue";
import { getHomeForumCategories } from "@/service/user/uindex";
import { getPostPage } from "@/service/user/uforum";
import { getHomePosts } from "@/service/user/uindex";

const openDetail = inject("openDetail");

const searchValue = ref("");
const loading = ref(false);

// 文章列表数据（从 API 获取）
const articleList = ref([]);
const totalArticles = ref(0);

// 获取文章列表
const fetchArticleList = async () => {
  loading.value = true;
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
    };
    // 如果有分类选择且不是"全部"
    if (activeCategory.value !== "all") {
      params.categoryId = activeCategory.value;
    }
    // 如果有搜索关键词
    if (searchValue.value.trim()) {
      params.title = searchValue.value.trim();
    }
    const res = await getPostPage(params);
    if (res.code === 0) {
      // 处理返回的数据，转换为组件需要的格式
      articleList.value = (res.data || []).map((item) => ({
        id: item.id,
        author: item.userName || "未知用户",
        authorColor: stringToColor(item.userName || "未知用户"),
        title: item.title,
        desc: item.content ? item.content.replace(/<[^>]+>/g, "").substring(0, 100) : "",
        category: item.categoryName,
        tagColor: "blue",
        publishTime: item.createTime ? formatDate(item.createTime) : "",
        readCount: formatCount(item.viewCount),
        likeCount: item.likeCount || 0,
        collectCount: item.collectCount || 0,
        cover: item.coverImage,
      }));
      totalArticles.value = res.total || res.data?.length || 0;
    }
  } catch (error) {
    console.error("获取文章列表失败:", error);
    articleList.value = [];
    totalArticles.value = 0;
  } finally {
    loading.value = false;
  }
};

// 字符串转颜色（用于头像背景色）
const stringToColor = (str) => {
  if (!str) return "#1890ff";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#1890ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96", "#fa8c16"];
  return colors[Math.abs(hash) % colors.length];
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 格式化数量显示
const formatCount = (count) => {
  if (!count && count !== 0) return "0";
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + "w";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return String(count);
};

const handleSearch = (value) => {
  console.log("搜索文章:", value);
  currentPage.value = 1;
  fetchArticleList();
};

const allCategories = ref([
  { key: "all", name: "全部", description: "", postCount: 0 },
]);
const MAX_VISIBLE = 8;
const hasOverflow = computed(() => allCategories.value.length > MAX_VISIBLE);
const visibleCategories = computed(() => allCategories.value.slice(0, MAX_VISIBLE));
const hiddenCategories = computed(() => allCategories.value.slice(MAX_VISIBLE));

// 获取论坛分类列表
const fetchForumCategories = async () => {
  try {
    const res = await getHomeForumCategories();
    if (res.code === 0 && res.data) {
      // 保持"全部"分类在首位
      const otherCategories = res.data.map((item) => ({
        key: String(item.id),
        name: item.categoryName,
        description: item.description || "",
        postCount: item.postCount || 0,
      }));
      allCategories.value = [
        { key: "all", name: "全部", description: "", postCount: 0 },
        ...otherCategories,
      ];
    }
  } catch (error) {
    console.error("获取论坛分类失败:", error);
  }
};

// 获取推荐论坛列表
const fetchCommunityList = async () => {
  try {
    const res = await getHomePosts({ pageNo: 1, pageSize: 10 });
    if (res.code === 0 && res.data) {
      communityList.value = res.data.map((item, index) => ({
        key: item.id || index + 1,
        name: item.postTitle || "未知论坛",
      }));
    }
  } catch (error) {
    console.error("获取推荐论坛失败:", error);
  }
};

onMounted(() => {
  fetchForumCategories();
  fetchArticleList();
  fetchCommunityList();
});

const activeCategory = ref("all");

const handleCategoryClick = (item) => {
  if (!item) return;
  activeCategory.value = item.key;
  currentPage.value = 1;
  fetchArticleList();
};

const currentPage = ref(1);
const pageSize = ref(10);

// 筛选后的数据（这里只做前端额外筛选，API筛选已在 fetchArticleList 中处理）
const filteredArticleList = computed(() => {
  return articleList.value;
});

// 分页后的数据
const paginatedArticleList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredArticleList.value.slice(start, end);
});

// 监听筛选条件变化，重置分页并重新获取数据
watch(activeCategory, () => {
  currentPage.value = 1;
});
watch(searchValue, () => {
  currentPage.value = 1;
});
// 监听分页变化，重新获取数据
watch([currentPage, pageSize], () => {
  fetchArticleList();
});

// 社区推荐列表
const communityList = ref([]);
</script>

<style scoped>
.tech-forum-content {
  width: 100%;
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
  gap: 4px;
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

/* 主体布局 */
.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.article-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 文章条目 */
.article-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}
.article-item:last-of-type {
  border-bottom: none;
}
.article-item:hover {
  background: #fafafa;
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
.article-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.author-name {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
.article-time {
  font-size: 12px;
  color: #ccc;
  margin-left: auto;
}
.article-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.article-text {
  flex: 1;
  min-width: 0;
}
.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article-item:hover .article-title {
  color: #1890ff;
}
.article-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 10px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #bbb;
}
.article-cover {
  width: 100px;
  height: 75px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 20px 16px;
}

/* 右侧栏 */
.right-sidebar {
  width: 280px;
  flex-shrink: 0;
}
.sidebar-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.community-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.community-item {
  padding: 8px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.community-item:hover {
  background: #f5f5f5;
}
.community-name {
  font-size: 13px;
  color: #555;
}
</style>
