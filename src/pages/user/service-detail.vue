<template>
  <div class="service-detail-page">
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item><a @click="$router.push('/user/service-market')">服务市场</a></a-breadcrumb-item>
      <a-breadcrumb-item>{{ service.title }}</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="product-section">
      <div class="product-gallery">
        <div class="main-image"><img :src="service.images[currentImage]" alt="商品图" /></div>
        <div class="thumb-list">
          <div v-for="(img, idx) in service.images" :key="idx" class="thumb-item" :class="{ active: currentImage === idx }" @click="currentImage = idx">
            <img :src="img" alt="" />
          </div>
        </div>
      </div>
      <div class="product-info">
        <h1 class="product-title">{{ service.title }}</h1>
        <p class="product-subtitle">{{ service.desc }}</p>
        <div class="price-box">
          <div class="price-row">
            <span class="price-label">价格</span>
            <span class="price-value">¥ {{ service.price }}</span>
            <span class="price-original">¥ {{ service.originalPrice }}</span>
            <a-tag color="red" size="small">限时优惠</a-tag>
          </div>
          <div class="price-row">
            <span class="price-label">销量</span>
            <span class="price-info">{{ service.sales }}+ 笔</span>
          </div>
          <div class="price-row">
            <span class="price-label">好评率</span>
            <span class="price-info" style="color: #52c41a">{{ service.rating }}%</span>
          </div>
        </div>
        <div class="guarantee-tags">
          <span class="price-label">保障</span>
          <div class="tag-list">
            <a-tag v-for="tag in service.tags" :key="tag" color="blue"><CheckCircleOutlined /> {{ tag }}</a-tag>
          </div>
        </div>
        <div class="seller-info">
          <a-avatar :size="40" style="background-color: #1890ff">{{ service.seller.name[0] }}</a-avatar>
          <div class="seller-detail">
            <div class="seller-name">{{ service.seller.name }}</div>
            <div class="seller-meta">
              <a-rate :value="service.seller.star" disabled allow-half :style="{ fontSize: '12px' }" />
              <span>{{ service.seller.orders }}单已完成</span>
            </div>
          </div>
        </div>
        <div class="quantity-row">
          <span class="price-label">购买数量</span>
          <div class="quantity-control">
            <a-button @click="quantity > 1 && quantity--">-</a-button>
            <a-input-number v-model:value="quantity" :min="1" :max="99" class="quantity-input" />
            <a-button @click="quantity < 99 && quantity++">+</a-button>
          </div>
        </div>
        <div class="action-buttons">
          <a-button type="primary" size="large" danger class="buy-btn"><ShoppingCartOutlined /> 立即购买</a-button>
          <a-button size="large" class="chat-btn"><MessageOutlined /> 在线咨询</a-button>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-left">
        <a-tabs v-model:activeKey="activeTab" class="detail-tabs">
          <a-tab-pane key="detail" tab="服务详情">
            <div class="detail-content">
              <h3>服务介绍</h3>
              <p>{{ service.detailIntro }}</p>
              <h3>服务内容</h3>
              <ul><li v-for="(item, idx) in service.detailItems" :key="idx">{{ item }}</li></ul>
              <h3>交付标准</h3>
              <p>{{ service.deliveryStandard }}</p>
            </div>
          </a-tab-pane>
          <a-tab-pane key="reviews" tab="客户评价">
            <div class="review-summary">
              <div class="review-score">
                <span class="score-num">{{ service.rating }}%</span>
                <span class="score-label">好评率</span>
              </div>
              <div class="review-tags">
                <a-tag v-for="tag in reviewTags" :key="tag.label">{{ tag.label }} ({{ tag.count }})</a-tag>
              </div>
            </div>
            <div class="review-list">
              <div class="review-item" v-for="review in reviews" :key="review.id">
                <div class="review-header">
                  <a-avatar :size="32" style="background-color: #87d068">{{ review.user[0] }}</a-avatar>
                  <div class="review-user-info">
                    <span class="review-user">{{ review.user }}</span>
                    <a-rate :value="review.star" disabled :style="{ fontSize: '12px' }" />
                  </div>
                  <span class="review-date">{{ review.date }}</span>
                </div>
                <p class="review-content">{{ review.content }}</p>
                <div class="review-images" v-if="review.images && review.images.length">
                  <img v-for="(img, idx) in review.images" :key="idx" :src="img" alt="评价图" />
                </div>
                <div class="review-footer"><span><LikeOutlined /> {{ review.likes }}</span></div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircleOutlined, ShoppingCartOutlined, MessageOutlined, LikeOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const serviceId = computed(() => Number(route.params.id) || 1)
const currentImage = ref(0)
const activeTab = ref('detail')
const quantity = ref(1)

const serviceMap = {
  1: {
    title: 'Java大厂面试题 一套搞定offer',
    desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟，助你轻松拿下大厂offer',
    price: 399, originalPrice: 699, sales: 1200, rating: 98,
    tags: ['平台保障', '商家认证', '7天无理由', '售后答疑'],
    images: ['https://via.placeholder.com/480x360/FFD700/000000?text=Java+面试题', 'https://via.placeholder.com/480x360/FF8C00/FFFFFF?text=课程大纲', 'https://via.placeholder.com/480x360/32CD32/FFFFFF?text=学员反馈', 'https://via.placeholder.com/480x360/4169E1/FFFFFF?text=讲师介绍'],
    seller: { name: '码上拿offer', star: 4.5, orders: 3200 },
    detailIntro: '本服务由资深Java架构师团队打造，覆盖Java基础、JVM调优、多线程并发、Spring全家桶、分布式架构、微服务、消息队列、数据库优化等大厂高频面试考点。配套一对一模拟面试，针对性辅导。',
    detailItems: ['Java核心基础与JVM深度解析', 'Spring/SpringBoot/SpringCloud全套面试题', '分布式系统设计与微服务架构', 'MySQL索引优化与分库分表方案', 'Redis缓存策略与高可用方案', '消息队列(Kafka/RabbitMQ)实战', '一对一模拟面试(3次)', '简历优化与面试技巧指导'],
    deliveryStandard: '购买后24小时内开通课程权限，模拟面试需提前预约。课程资料永久有效，模拟面试在购买后30天内完成。',
    flowSteps: ['下单购买', '开通课程', '系统学习', '预约模拟面试', '面试辅导', '拿到offer']
  },
  2: {
    title: '10天精通MySQL 讲的特别深入的那种',
    desc: '从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表',
    price: 399, originalPrice: 599, sales: 860, rating: 99,
    tags: ['平台保障', '官方认证', '售后答疑', '终身更新'],
    images: ['https://via.placeholder.com/480x360/FF6600/FFFFFF?text=MySQL+精通', 'https://via.placeholder.com/480x360/1E90FF/FFFFFF?text=索引原理', 'https://via.placeholder.com/480x360/FF4500/FFFFFF?text=锁机制'],
    seller: { name: 'DB技术专家', star: 5, orders: 1800 },
    detailIntro: '深入MySQL底层原理，从B+树索引结构到MVCC多版本并发控制，从锁机制到分库分表方案，10天带你从入门到精通。',
    detailItems: ['MySQL架构与存储引擎深度解析', 'B+树索引原理与优化实战', '事务隔离级别与MVCC机制', '锁机制：行锁、表锁、间隙锁', '慢SQL分析与执行计划优化', '分库分表方案设计与实战'],
    deliveryStandard: '购买后立即开通，课程内容持续更新，配套练习题和实战项目。',
    flowSteps: ['下单购买', '开通课程', '跟练实操', '项目实战', '答疑辅导', '精通MySQL']
  },
  3: {
    title: '颠覆你认知的八股盛宴',
    desc: '打破传统八股文，结合实战场景讲解，让面试官眼前一亮',
    price: 399, originalPrice: 799, sales: 650, rating: 97,
    tags: ['平台保障', '一对一辅导', '终身更新'],
    images: ['https://via.placeholder.com/480x360/FF4444/FFFFFF?text=八股盛宴', 'https://via.placeholder.com/480x360/9932CC/FFFFFF?text=面试技巧'],
    seller: { name: '面试达人', star: 4.5, orders: 2100 },
    detailIntro: '告别死记硬背，用实战场景理解八股文背后的原理。结合真实项目案例，让你在面试中答出深度。',
    detailItems: ['操作系统核心原理与面试高频题', '计算机网络TCP/IP深度解析', 'JVM内存模型与GC调优', '并发编程与线程安全', '设计模式在实战中的应用'],
    deliveryStandard: '购买后即时开通，一对一辅导需预约，课程终身有效。',
    flowSteps: ['下单购买', '基础学习', '专题突破', '模拟面试', '查漏补缺', '面试通关']
  },
  4: {
    title: 'RabbitMQ 2天入门到实战',
    desc: '从安装部署到高可用架构，结合电商场景实现消息队列实战',
    price: 399, originalPrice: 499, sales: 430, rating: 96,
    tags: ['平台保障', '项目实战', '源码解析'],
    images: ['https://via.placeholder.com/480x360/0099FF/FFFFFF?text=RabbitMQ', 'https://via.placeholder.com/480x360/00CED1/FFFFFF?text=消息队列'],
    seller: { name: '中间件专家', star: 4.5, orders: 960 },
    detailIntro: '2天快速掌握RabbitMQ，从基础概念到高可用集群部署，结合电商秒杀、订单系统等真实场景进行实战演练。',
    detailItems: ['RabbitMQ核心概念与安装部署', '交换机类型与路由策略', '消息确认与持久化机制', '死信队列与延迟队列', '电商秒杀场景实战', '高可用集群搭建'],
    deliveryStandard: '购买后立即开通课程，配套源码和部署文档，永久有效。',
    flowSteps: ['下单购买', '环境搭建', '基础学习', '场景实战', '集群部署', '项目上线']
  }
}

const service = computed(() => serviceMap[serviceId.value] || serviceMap[1])

const reviewTags = ref([
  { label: '讲解清晰', count: 128 }, { label: '内容丰富', count: 96 },
  { label: '物超所值', count: 85 }, { label: '售后好', count: 72 }, { label: '实用性强', count: 64 }
])

const reviews = ref([
  { id: 1, user: '张同学', star: 5, date: '2025-12-15', content: '非常好的课程，讲解很深入，跟着学完之后面试信心大增，已经拿到了心仪的offer。', images: ['https://via.placeholder.com/80x80/52c41a/FFFFFF?text=好评'], likes: 56 },
  { id: 2, user: '李工程师', star: 5, date: '2025-11-28', content: '内容覆盖面很广，从基础到高级都有涉及，特别是分布式和微服务部分讲得很透彻。', images: [], likes: 42 },
  { id: 3, user: '王开发', star: 4, date: '2025-11-10', content: '整体质量不错，知识点讲解到位。希望后续能增加更多实战项目的内容。', images: [], likes: 28 },
  { id: 4, user: '赵同学', star: 5, date: '2025-10-22', content: '跟着课程学了两周，面试的时候明显感觉有底气了。特别是JVM和并发那部分，强烈推荐！', images: ['https://via.placeholder.com/80x80/1890ff/FFFFFF?text=截图1', 'https://via.placeholder.com/80x80/faad14/FFFFFF?text=截图2'], likes: 35 }
])
</script>

<style scoped>
.service-detail-page { width: 100%; }
.breadcrumb { margin-bottom: 16px; }
.product-section { display: flex; gap: 24px; background: #fff; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
.product-gallery { width: 480px; flex-shrink: 0; }
.main-image { width: 100%; height: 360px; border-radius: 8px; overflow: hidden; background: #f5f5f5; margin-bottom: 12px; }
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.thumb-list { display: flex; gap: 8px; }
.thumb-item { width: 72px; height: 54px; border-radius: 4px; overflow: hidden; cursor: pointer; border: 2px solid transparent; opacity: 0.6; transition: all 0.2s; }
.thumb-item.active { border-color: #1890ff; opacity: 1; }
.thumb-item:hover { opacity: 1; }
.thumb-item img { width: 100%; height: 100%; object-fit: cover; }
.product-info { flex: 1; min-width: 0; }
.product-title { font-size: 22px; font-weight: 700; color: #333; margin: 0 0 8px 0; line-height: 1.4; }
.product-subtitle { font-size: 14px; color: #666; margin: 0 0 16px 0; }
.price-box { background: #fff7f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.price-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.price-row:last-child { margin-bottom: 0; }
.price-label { font-size: 13px; color: #999; width: 50px; flex-shrink: 0; }
.price-value { font-size: 28px; font-weight: 700; color: #ff4d4f; }
.price-original { font-size: 14px; color: #ccc; text-decoration: line-through; }
.price-info { font-size: 14px; color: #333; }
.guarantee-tags { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.tag-list { display: flex; gap: 8px; flex-wrap: wrap; }
.seller-info { display: flex; align-items: center; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 20px; }
.seller-detail { flex: 1; }
.seller-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
.seller-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #999; }
.action-buttons { display: flex; gap: 12px; align-items: center; }
.quantity-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.quantity-control { display: flex; align-items: center; }
.quantity-control .quantity-input { width: 60px; text-align: center; }
.quantity-control :deep(.ant-input-number-handler-wrap) { display: none; }
.quantity-control :deep(.ant-input-number-input) { text-align: center; }
.buy-btn { min-width: 160px; height: 48px; font-size: 16px; }
.chat-btn { min-width: 120px; height: 48px; font-size: 16px; color: #1890ff; border-color: #1890ff; }
.detail-body { width: 100%; }
.detail-left { width: 100%; background: #fff; border-radius: 8px; padding: 24px; }
.detail-content h3 { font-size: 16px; font-weight: 600; color: #333; margin: 20px 0 12px 0; padding-left: 10px; border-left: 3px solid #1890ff; }
.detail-content h3:first-child { margin-top: 0; }
.detail-content p { font-size: 14px; color: #666; line-height: 1.8; margin: 0 0 12px 0; }
.detail-content ul { padding-left: 20px; margin: 0 0 16px 0; }
.detail-content li { font-size: 14px; color: #666; line-height: 2; }
.flow-steps { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
.flow-step { display: flex; align-items: center; gap: 8px; }
.flow-step::after { content: '→'; color: #ccc; font-size: 16px; margin-left: 8px; }
.flow-step:last-child::after { content: ''; }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: #1890ff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
.step-text { font-size: 13px; color: #333; }
.review-summary { display: flex; align-items: center; gap: 24px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
.review-score { text-align: center; }
.score-num { font-size: 32px; font-weight: 700; color: #52c41a; display: block; }
.score-label { font-size: 12px; color: #999; }
.review-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.review-item { padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
.review-item:last-child { border-bottom: none; }
.review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.review-user-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.review-user { font-size: 14px; font-weight: 600; color: #333; }
.review-date { font-size: 12px; color: #ccc; }
.review-content { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 10px 0; }
.review-images { display: flex; gap: 8px; margin-bottom: 10px; }
.review-images img { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; cursor: pointer; }
.review-footer { font-size: 12px; color: #999; }
.review-footer span { cursor: pointer; }
.review-footer span:hover { color: #1890ff; }
</style>
