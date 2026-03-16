<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>

    <!-- 数据概览 -->
    <div class="order-summary">
      <div class="summary-item">
        <div class="summary-num">{{ totalOrders }}</div>
        <div class="summary-label">订单总数</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ serviceOrders.length }}</div>
        <div class="summary-label">服务订单</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">{{ demandOrders.length }}</div>
        <div class="summary-label">悬赏订单</div>
      </div>
      <div class="summary-item">
        <div class="summary-num">¥ {{ totalSpent }}</div>
        <div class="summary-label">累计交易金额</div>
      </div>
    </div>

    <!-- 订单分类 -->
    <a-tabs v-model:activeKey="activeTab" class="order-tabs">
      <a-tab-pane key="service" tab="服务商品订单">
        <div class="order-list">
          <div v-if="serviceOrders.length === 0" class="empty-state">
            <InboxOutlined class="empty-icon" />
            <p>暂无服务订单</p>
          </div>

          <div
            class="order-card"
            v-for="order in serviceOrders"
            :key="order.id"
          >
            <div class="order-card-header">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ order.createTime }}</span>
              <a-tag
                :color="statusColorMap[order.status]"
                class="order-status"
                >{{ statusTextMap[order.status] || order.status }}</a-tag
              >
            </div>
            <div class="order-card-body">
              <div class="service-cover">
                <img :src="order.cover" :alt="order.serviceName" />
              </div>
              <div class="service-info">
                <div class="service-name">
                  {{ order.serviceName }}
                  <a-tag v-if="order.isMine" color="green" size="small"
                    >我发布的</a-tag
                  >
                </div>
                <div class="service-desc">{{ order.serviceDesc }}</div>
                <div class="service-tags">
                  <a-tag
                    v-for="tag in order.tags"
                    :key="tag"
                    size="small"
                    color="blue"
                    >{{ tag }}</a-tag
                  >
                </div>
                <div class="seller-row">
                  <a-avatar
                    :size="20"
                    :style="{ backgroundColor: order.sellerColor }"
                    >{{ order.seller[0] }}</a-avatar
                  >
                  <span class="seller-name">{{ order.seller }}</span>
                </div>
              </div>
              <div class="order-right">
                <div class="order-price">¥ {{ order.price }}</div>
                <div class="order-qty">x {{ order.quantity }}</div>
                <div class="order-actions">
                  <a-button
                    size="small"
                    type="link"
                    @click="viewOrderDetail(order)"
                    >查看详情</a-button
                  >
                  <a-button
                    size="small"
                    type="link"
                    @click="viewServiceDetail(order.serviceId)"
                    >查看商品</a-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="demand" tab="需求悬赏订单">
        <div class="order-list">
          <div v-if="demandOrders.length === 0" class="empty-state">
            <InboxOutlined class="empty-icon" />
            <p>暂无悬赏订单</p>
          </div>

          <div class="order-card" v-for="order in demandOrders" :key="order.id">
            <div class="order-card-header">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ order.createTime }}</span>
              <a-tag
                :color="statusColorMap[order.status]"
                class="order-status"
                >{{ statusTextMap[order.status] || order.status }}</a-tag
              >
            </div>
            <div class="order-card-body">
              <div class="demand-icon">
                <TrophyOutlined
                  :style="{ fontSize: '32px', color: order.iconColor }"
                />
              </div>
              <div class="service-info">
                <div class="service-name">
                  {{ order.demandTitle }}
                  <a-tag v-if="order.isMine" color="green" size="small"
                    >我发布的</a-tag
                  >
                </div>
                <div class="service-desc">{{ order.demandDesc }}</div>
                <div class="service-tags">
                  <a-tag size="small" color="orange">{{
                    order.demandType
                  }}</a-tag>
                </div>
                <div class="seller-row">
                  <a-avatar
                    :size="20"
                    :style="{ backgroundColor: order.publisherColor }"
                    >{{ order.publisher[0] }}</a-avatar
                  >
                  <span class="seller-name">需求方：{{ order.publisher }}</span>
                </div>
              </div>
              <div class="order-right">
                <div class="order-price">
                  ¥ {{ order.budgetMin }} ~ {{ order.budgetMax }}
                </div>
                <div class="order-qty">悬赏金额</div>
                <div class="order-total">
                  支付<span
                    >¥ {{ order.budgetMin }} ~ {{ order.budgetMax }}</span
                  >
                </div>
                <div class="order-actions">
                  <a-button
                    size="small"
                    type="link"
                    @click="viewOrderDetail(order)"
                    >查看详情</a-button
                  >
                  <a-button
                    size="small"
                    type="link"
                    @click="viewDemandDetail(order.demandId)"
                    >查看需求</a-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { InboxOutlined, TrophyOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const activeTab = ref("service");

const statusColorMap = {
  // 英文状态
  PENDING: "orange",
  PROCESSING: "blue",
  DELIVERED: "cyan",
  COMPLETED: "green",
  CANCELLED: "default",
  FAILED: "red",
  // 中文状态
  待接单: "orange",
  进行中: "blue",
  待验收: "cyan",
  已完成: "green",
  已取消: "default",
  已失败: "red",
  待付款: "orange",
};

const statusTextMap = {
  // 英文状态转中文
  PENDING: "待接单",
  PROCESSING: "进行中",
  DELIVERED: "待验收",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  FAILED: "已失败",
  // 中文状态保持不变
  待接单: "待接单",
  进行中: "进行中",
  待验收: "待验收",
  已完成: "已完成",
  已取消: "已取消",
  已失败: "已失败",
  待付款: "待付款",
};

// 服务商品订单
const serviceOrders = ref([
  {
    id: 1,
    orderNo: "SVC20260210001",
    createTime: "2026-02-10 11:20:00",
    serviceName: "Java大厂面试课，一套搞定offer",
    serviceDesc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟",
    cover: "https://placehold.co/80x60/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证"],
    seller: "码上拿offer",
    sellerColor: "#1890ff",
    price: 399,
    quantity: 1,
    status: "COMPLETED",
    serviceId: 1,
    isMine: true,
  },
  {
    id: 2,
    orderNo: "SVC20260205002",
    createTime: "2026-02-05 08:55:00",
    serviceName: "10天精通MySQL 讲的特别深入的那种",
    serviceDesc: "从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表",
    cover: "https://placehold.co/80x60/FF6600/FFFFFF?text=MySQL",
    tags: ["平台保障", "官方认证"],
    seller: "DB技术专家",
    sellerColor: "#52c41a",
    price: 399,
    quantity: 1,
    status: "COMPLETED",
    serviceId: 2,
    isMine: false,
  },
  {
    id: 3,
    orderNo: "SVC20260228003",
    createTime: "2026-02-28 15:30:00",
    serviceName: "Vue3 + TypeScript 企业级实战",
    serviceDesc: "从零搭建企业级前端项目，包含组件库、状态管理、路由等",
    cover: "https://placehold.co/80x60/42b883/FFFFFF?text=Vue3",
    tags: ["平台保障"],
    seller: "前端大师",
    sellerColor: "#722ed1",
    price: 299,
    quantity: 1,
    status: "PROCESSING",
    serviceId: 3,
    isMine: false,
  },
  {
    id: 6,
    orderNo: "SVC20260310001",
    createTime: "2026-03-10 09:15:00",
    serviceName: "React Native 跨平台移动端应用",
    serviceDesc: "开发一款跨平台的移动应用，支持iOS和Android双平台",
    cover: "https://placehold.co/80x60/61dafb/000000?text=RN",
    tags: ["平台保障", "商家认证"],
    seller: "移动开发专家",
    sellerColor: "#1890ff",
    price: 2999,
    quantity: 1,
    status: "PENDING",
    serviceId: 4,
    isMine: true,
  },
  {
    id: 7,
    orderNo: "SVC20260308002",
    createTime: "2026-03-08 14:20:00",
    serviceName: "Python 数据分析实战",
    serviceDesc: "使用Python进行数据分析，包含Pandas、NumPy可视化等",
    cover: "https://placehold.co/80x60/3776ab/FFFFFF?text=Python",
    tags: ["平台保障"],
    seller: "数据分析师",
    sellerColor: "#13c2c2",
    price: 599,
    quantity: 1,
    status: "DELIVERED",
    serviceId: 5,
    isMine: true,
  },
  {
    id: 8,
    orderNo: "SVC20260305003",
    createTime: "2026-03-05 16:00:00",
    serviceName: "微服务架构设计与实现",
    serviceDesc: "从零构建微服务架构，涵盖Spring Cloud、Docker、K8s",
    cover: "https://placehold.co/80x60/FF6600/FFFFFF?text=Micro",
    tags: ["商家认证"],
    seller: "架构师老王",
    sellerColor: "#722ed1",
    price: 1999,
    quantity: 1,
    status: "CANCELLED",
    serviceId: 6,
    isMine: false,
  },
  {
    id: 9,
    orderNo: "SVC20260301004",
    createTime: "2026-03-01 10:30:00",
    serviceName: "区块链应用开发",
    serviceDesc: "基于以太坊开发DApp，包含智能合约编写和部署",
    cover: "https://placehold.co/80x60/343a40/FFFFFF?text=Blockchain",
    tags: ["平台保障"],
    seller: "区块链工程师",
    sellerColor: "#52c41a",
    price: 3999,
    quantity: 1,
    status: "FAILED",
    serviceId: 7,
    isMine: true,
  },
]);

// 需求悬赏订单
const demandOrders = ref([
  {
    id: 4,
    orderNo: "DMD20260303001",
    createTime: "2026-03-03 10:00:00",
    demandTitle: "MiniMax-M2.1 智能客服系统开发",
    demandDesc:
      "基于MiniMax大模型开发智能客服系统，需要支持多轮对话、知识库检索",
    demandType: "人工智能",
    publisher: "科技公司HR",
    publisherColor: "#ff4d4f",
    budgetMin: 3000,
    budgetMax: 5000,
    status: "PROCESSING",
    iconColor: "#faad14",
    demandId: 1,
    isMine: true,
  },
  {
    id: 5,
    orderNo: "DMD20260225002",
    createTime: "2026-02-25 14:20:00",
    demandTitle: "React Native 跨平台移动端应用",
    demandDesc: "开发一款跨平台的移动应用，包含用户系统、支付功能、数据统计",
    demandType: "移动开发",
    publisher: "创业团队",
    publisherColor: "#13c2c2",
    budgetMin: 10000,
    budgetMax: 15000,
    status: "COMPLETED",
    iconColor: "#52c41a",
    demandId: 2,
    isMine: false,
  },
  {
    id: 10,
    orderNo: "DMD20260312001",
    createTime: "2026-03-12 11:00:00",
    demandTitle: "企业官网设计与开发",
    demandDesc: "设计并开发一个企业官方网站，要求响应式设计，SEO友好",
    demandType: "网站开发",
    publisher: "传统企业",
    publisherColor: "#1890ff",
    budgetMin: 5000,
    budgetMax: 8000,
    status: "PENDING",
    iconColor: "#722ed1",
    demandId: 3,
    isMine: true,
  },
  {
    id: 11,
    orderNo: "DMD20260308002",
    createTime: "2026-03-08 15:30:00",
    demandTitle: "小程序商城开发",
    demandDesc: "开发微信小程序商城，包含商品展示、购物车、订单管理",
    demandType: "小程序开发",
    publisher: "电商公司",
    publisherColor: "#eb2f96",
    budgetMin: 8000,
    budgetMax: 12000,
    status: "DELIVERED",
    iconColor: "#13c2c2",
    demandId: 4,
    isMine: false,
  },
  {
    id: 12,
    orderNo: "DMD20260305003",
    createTime: "2026-03-05 09:00:00",
    demandTitle: "电商APP后端API开发",
    demandDesc: "开发电商APP的后端API，包含用户、商品、订单、支付模块",
    demandType: "后端开发",
    publisher: "创业团队",
    publisherColor: "#faad14",
    budgetMin: 15000,
    budgetMax: 20000,
    status: "CANCELLED",
    iconColor: "#ff4d4f",
    demandId: 5,
    isMine: true,
  },
  {
    id: 13,
    orderNo: "DMD20260301004",
    createTime: "2026-03-01 14:00:00",
    demandTitle: "AI图像识别系统",
    demandDesc: "基于深度学习的图像识别系统，支持多种物体检测",
    demandType: "人工智能",
    publisher: "科技公司",
    publisherColor: "#52c41a",
    budgetMin: 20000,
    budgetMax: 30000,
    status: "FAILED",
    iconColor: "#f5222d",
    demandId: 6,
    isMine: false,
  },
]);

const totalOrders = computed(
  () => serviceOrders.value.length + demandOrders.value.length,
);

const totalSpent = computed(() => {
  const serviceTotal = serviceOrders.value.reduce(
    (sum, o) => sum + o.price * o.quantity,
    0,
  );
  const demandTotal = demandOrders.value.reduce(
    (sum, o) => sum + o.budgetMax,
    0,
  );
  return (serviceTotal + demandTotal).toFixed(2);
});

const viewServiceDetail = (id) => {
  router.push({ name: "ServiceDetail", params: { id } });
};

const viewOrderDetail = (order) => {
  // 将订单数据通过query传递到详情页
  router.push({
    name: "OrderDetail",
    params: { id: order.id },
    query: { orderData: JSON.stringify(order) },
  });
};

const viewDemandDetail = (id) => {
  router.push({ name: "DemandDetail", params: { id } });
};
</script>

<style scoped>
.orders-page {
  width: 100%;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
}

.order-summary {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  gap: 40px;
  justify-content: center;
  margin-bottom: 16px;
}
.summary-item {
  text-align: center;
}
.summary-num {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}
.summary-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.order-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 0 20px;
}
.order-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
}

.empty-state {
  background: #fafafa;
  border-radius: 8px;
  padding: 60px;
  text-align: center;
  color: #ccc;
}
.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.order-card {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}
.order-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.order-no {
  color: #666;
  font-weight: 500;
}
.order-time {
  color: #999;
}
.order-status {
  margin-left: auto;
}

.order-card-body {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  align-items: flex-start;
  background: #fff;
}
.service-cover img {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}
.demand-icon {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 6px;
  flex-shrink: 0;
}
.service-info {
  flex: 1;
  min-width: 0;
}
.service-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
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
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.seller-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.seller-name {
  font-size: 12px;
  color: #666;
}

.order-right {
  text-align: right;
  flex-shrink: 0;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.order-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff4d4f;
}
.order-qty {
  font-size: 13px;
  color: #999;
}
.order-total {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
.order-total span {
  color: #ff4d4f;
  font-weight: 600;
  margin-left: 4px;
}
.order-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  justify-content: flex-end;
}
</style>
