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
            :style="{ backgroundImage: `url(${item.coverImage})` }"
          ></div>
          <div class="card-content">
            <h4 class="card-title">{{ item.goodsTitle }}</h4>
            <p class="card-desc">{{ item.description }}</p>
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
              <div class="footer-left">
                <span class="price">{{ item.price }} 积分</span>
              </div>
              <div class="footer-right">
                <span class="provider">{{ item.providerName }}</span>
              </div>
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
        :pageSizeOptions="['8', '12', '24', '48']"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条服务`"
        @change="handlePageChange"
        @showSizeChange="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from "vue";
import {
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import { getCategoryList, getGoodsPage } from "../../service/user/uservice.js";

const openDetail = inject("openDetail");

const searchValue = ref("");
const activeCategory = ref("all");

// 分类数据 - 从API获取
const allCategories = ref([]);

// 分页和筛选状态
const currentPage = ref(1);
const pageSize = ref(12);
const totalServices = ref(0);
const loading = ref(false);

// 服务列表（从API获取）
const serviceList = ref([]);

// 获取服务商品列表
const fetchGoodsList = async () => {
  loading.value = true;
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
    };
    
    // 分类筛选
    if (activeCategory.value !== 'all') {
      params.categoryId = activeCategory.value;
    }
    
    // 搜索筛选
    if (searchValue.value.trim()) {
      params.goodsTitle = searchValue.value.trim();
    }
    
    const res = await getGoodsPage(params);
    
    // 适配API返回格式：可能是 { code, msg, data: { list, total } } 或 { data: { list, total } }
    let list = [];
    let total = 0;
    
    if (res.data) {
      list = Array.isArray(res.data) ? res.data : (res.data.list || []);
      total = res.data.total || (Array.isArray(res.data) ? res.data.length : 0);
    } else if (Array.isArray(res)) {
      list = res;
      total = res.length;
    }
    
    // 映射API字段到前端字段
    serviceList.value = list.map(item => ({
      id: item.id,
      coverImage: item.coverImage,
      goodsTitle: item.goodsTitle,
      description: item.description,
      price: item.price,
      providerName: item.providerName,
      providerAvatar: item.providerAvatar,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      goodsCode: item.goodsCode,
    }));
    
    totalServices.value = total;
  } catch (err) {
    console.error("获取服务商品列表失败:", err);
    serviceList.value = [];
    totalServices.value = 0;
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList({ type: 'SERVICE' });
    const data = Array.isArray(res) ? res : (res.data || []);
    // 转换API数据格式：添加"全部"分类，并映射字段
    allCategories.value = [
      { key: "all", name: "全部" },
      ...data.map((cat) => ({
        key: String(cat.id || cat.categoryId),
        name: cat.categoryName,
      })),
    ];
  } catch (err) {
    console.error("获取分类列表失败:", err);
  }
};

const handleSearch = (value) => {
  currentPage.value = 1;
  fetchGoodsList();
};

const MAX_VISIBLE = 8;
const hasOverflow = computed(() => allCategories.value.length > MAX_VISIBLE);
const visibleCategories = computed(() => allCategories.value.slice(0, MAX_VISIBLE));
const hiddenCategories = computed(() => allCategories.value.slice(MAX_VISIBLE));

const handleCategoryClick = (item) => {
  if (!item) return;
  activeCategory.value = item.key;
  currentPage.value = 1;
  fetchGoodsList();
};

// 分页变化时重新获取数据
const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchGoodsList();
};

// 监听分类和搜索变化
watch([activeCategory, searchValue], () => {
  // 不需要额外处理，因为handleCategoryClick和handleSearch已经会调用fetchGoodsList
});

// 组件挂载时加载分类和商品列表
onMounted(() => {
  fetchCategories();
  fetchGoodsList();
});
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
  height: 400px;
  width:  400px;
  display: flex;
  flex-direction: column;
}
.card-cover {
  width: 100%;
  height: 100px;
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
}
.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.3;
  max-height: 20.8px;
}
.card-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  flex-shrink: 0;
  max-height: 19.6px;
}
.card-tags {
  margin-bottom: 6px;
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: hidden;
  min-height: 22px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
  margin-top: auto;
  flex-shrink: 0;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.price {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}
.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #faad14;
  font-size: 12px;
}
.provider {
  color: #666;
  font-size: 11px;
}
.orders {
  color: #999;
  font-size: 11px;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 24px 0;
}
</style>
