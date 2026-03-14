<template>
  <div class="reward-content">
    <h2 class="page-title">需求悬赏</h2>
    <div class="search-bar">
      <a-input-search
        v-model:value="searchValue"
        placeholder="搜索需求"
        style="width: 400px"
        @search="handleSearch"
      />
    </div>
    <div class="category-bar">
      <div class="category-tabs">
        <a-tag v-for="item in categoryList" :key="item.key" :class="['category-tag', activeCategory === item.key ? 'active-tag' : '']" @click="activeCategory = item.key">
          {{ item.name }}
        </a-tag>
      </div>
    </div>
    <div class="service-grid">
      <div class="service-row" v-for="(row, index) in serviceRows" :key="index">
        <div class="service-card" v-for="item in row" :key="item.id" @click="openDetail('demand', { id: item.id })">
          <div class="card-header">
            <h4 class="card-title">{{ item.title }}</h4>
            <a-tag :color="getUrgencyColor(item.urgency)" class="urgency-tag">{{ item.urgency }}</a-tag>
          </div>
          <p class="card-desc">{{ item.desc }}</p>
          <div class="card-footer">
            <a-tag class="type-tag">{{ item.tag }}</a-tag>
            <div class="card-actions">
              <span class="card-price">¥{{ item.minPrice }} ~ ¥{{ item.maxPrice }}</span>
              <a class="card-detail" @click.stop="openDetail('demand', { id: item.id })">查看详情 ></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const openDetail = inject('openDetail')

const searchValue = ref('')

const handleSearch = (value) => {
  console.log('搜索需求:', value)
}

// 获取紧急程度颜色
const getUrgencyColor = (urgency) => {
  const colorMap = {
    '紧急': 'orange',
    '一般': 'blue',
    '不紧急': 'default'
  }
  return colorMap[urgency] || 'default'
}

// 分类标签数据
const categoryList = ref([
  { key: 'recommend', name: '猜你喜欢' },
  { key: 'website', name: '网站开发' },
  { key: 'wechat', name: '微信开发' },
  { key: 'mini-program', name: '小程序开发'},
  { key: 'app', name: 'APP开发' }
])

// 当前选中的分�?
const activeCategory = ref('recommend')

// 模拟服务数据（和图片一致）
const serviceList = ref([
  {
    id: 1,
    title: 'MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发',
    desc: '基于最新AI技术，提供高效的智能应用开发解决方案，支持多种场景应用，帮助企业快速构建智能化系统',
    tag: 'Python',
    minPrice: 3000,
    maxPrice: 5000,
    urgency: '紧急'
  },
  {
    id: 2,
    title: 'PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率',
    desc: '专业的OCR识别工具开发需求，需要支持多语言识别和文档智能处理，提升企业文档数字化效率',
    tag: 'Python',
    minPrice: 2500,
    maxPrice: 4500,
    urgency: '一般'
  },
  {
    id: 3,
    title: 'CHATERMAI：开启云资源氛围管理新篇章！',
    desc: '云资源管理平台开发，需要实现资源监控、自动化部署、成本优化等功能，提升云资源使用效率',
    tag: '人工智能',
    minPrice: 5000,
    maxPrice: 8000,
    urgency: '紧急'
  },
  {
    id: 4,
    title: '欧拉操作系统内核开源，助力开发者获取源码与技术',
    desc: '操作系统内核开发与优化项目，需要深入理解Linux内核机制，进行性能优化和功能扩展',
    tag: 'C',
    minPrice: 8000,
    maxPrice: 15000,
    urgency: '一般'
  }
])

// 将服务列表按每行2个分组，重复展示模拟多行效果
const serviceRows = computed(() => {
  const rows = []
  const list = [...serviceList.value]
  // 重复3次数据，和图片中展示的行数一�?
  const repeatList = [...list, ...list, ...list]
  
  while (repeatList.length) {
    rows.push(repeatList.splice(0, 2))
  }
  return rows
})
</script>

<style scoped>
/* 核心内容容器 */
.reward-content {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* 页面标题 */
.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 20px;
}

/* 分类标签�?*/
.category-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
}

.category-tabs {
  display: flex;
  gap: 20px;
}

.category-tag {
  font-size: 16px;
  padding: 4px 8px;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.2s;
}

/* 选中标签样式（红色文�?底部红线�?*/
.active-tag {
  color: rgb(199, 81, 42);
  border-bottom: 2px solid rgb(255, 253, 253);
  font-weight: 500;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
}
</style>