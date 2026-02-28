<template>
  <div class="reward-content">
    <h2 class="page-title">需求悬赏</h2>
    <div class="category-bar">
      <div class="category-tabs">
        <a-tag v-for="item in categoryList" :key="item.key" :class="['category-tag', activeCategory === item.key ? 'active-tag' : '']" @click="activeCategory = item.key">
          {{ item.name }}
        </a-tag>
      </div>
    </div>
    <div class="service-grid">
      <div class="service-row" v-for="(row, index) in serviceRows" :key="index">
        <div class="service-card" v-for="item in row" :key="item.id" @click="openDetail('demand', { id: item.id })" style="cursor: pointer">
          <div class="card-left">
            <img :src="item.cover" alt="" class="card-cover" />
            <div class="card-info">
              <h4 class="card-title">{{ item.title }}</h4>
              <span class="card-tag">{{ item.tag }}</span>
            </div>
          </div>
          <div class="card-right">
            <span class="card-price">¥{{ item.price }}</span>
            <a class="card-detail" @click.stop="openDetail('demand', { id: item.id })">查看详情 </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const openDetail = inject('openDetail')

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
    cover: 'https://placehold.co/60x60/000000/FFFFFF?text=MM',
    title: 'MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开',
    tag: 'Python',
    price: 3800
  },
  {
    id: 2,
    cover: 'https://placehold.co/60x60/1890ff/FFFFFF?text=OCR',
    title: 'PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效',
    tag: 'Python',
    price: 3800
  },
  {
    id: 3,
    cover: 'https://placehold.co/60x60/13c2c2/FFFFFF?text=AI',
    title: 'CHATERMAI：开启云资源氛围管理新篇章！',
    tag: '人工智能',
    price: 3800
  },
  {
    id: 4,
    cover: 'https://placehold.co/60x60/f5222d/FFFFFF?text=OS',
    title: '欧拉操作系统内核开源，助力开发者获取源码与技',
    tag: 'C',
    price: 3800
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
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
  box-sizing: border-box;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.card-info {
  max-width: 400px;
}

.card-title {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-tag {
  font-size: 12px;
  color: #666;
  background: #e8e8e8;
  padding: 2px 6px;
  border-radius: 2px;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.card-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: bold;
}

.card-detail {
  font-size: 12px;
  color: #1890ff;
  text-decoration: none;
}

.card-detail:hover {
  color: #40a9ff;
  text-decoration: underline;
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