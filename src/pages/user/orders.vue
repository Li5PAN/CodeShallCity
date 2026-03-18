<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>

    <!-- 数据概览 -->
    <div class="order-summary">
      <div class="summary-item" v-for="item in summaryItems" :key="item.label">
        <div class="summary-icon-wrap" :style="{ background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}11 100%)` }">
          <component :is="item.icon" class="summary-icon" :style="{ color: item.color }" />
        </div>
        <div class="summary-content">
          <div class="summary-num">{{ item.value }}</div>
          <div class="summary-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 订单分类 -->
    <div class="order-tabs-wrap">
      <a-tabs v-model:activeKey="activeTab" class="order-tabs">
        <template #rightExtra>
          <a-button
            class="export-btn"
            size="small"
            @click="activeTab === 'service' ? exportServiceOrders() : exportDemandOrders()"
          >
            <template #icon><DownloadOutlined /></template>
            {{ activeTab === "service" ? "导出服务订单" : "导出悬赏订单" }}
          </a-button>
        </template>

        <a-tab-pane key="service" tab="服务商品订单">
          <div v-if="userRole === 'provider'" class="role-filter">
            <a-radio-group v-model:value="serviceRoleFilter" class="role-chips">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="buyer">我买入的</a-radio-button>
              <a-radio-button value="seller">我卖出的</a-radio-button>
            </a-radio-group>
          </div>
          <div class="order-list">
            <div v-if="filteredServiceOrders.length === 0" class="empty-state">
              <InboxOutlined class="empty-icon" />
              <p>暂无服务订单</p>
            </div>
            <div class="order-card" v-for="order in filteredServiceOrders" :key="order.id" @click="viewOrderDetail(order)">
              <div class="order-card-header">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ order.createTime }}</span>
                <div class="header-right">
                  <a-tag class="role-badge" :class="'role-' + order.myRole">
                    {{ order.myRole === 'seller' ? '卖出' : '买入' }}
                  </a-tag>
                  <a-tag :color="statusColorMap[order.status]" class="order-status">{{ statusTextMap[order.status] || order.status }}</a-tag>
                </div>
              </div>
              <div class="order-card-body">
                <div class="service-cover">
                  <img :src="order.cover" :alt="order.serviceName" />
                </div>
                <div class="service-info">
                  <div class="service-name">{{ order.serviceName }}</div>
                  <div class="service-desc">{{ order.serviceDesc }}</div>
                  <div class="service-tags">
                    <a-tag v-for="tag in order.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
                  </div>
                  <div class="seller-row">
                    <a-avatar :size="20" :style="{ backgroundColor: order.sellerColor }">{{ order.seller[0] }}</a-avatar>
                    <span class="seller-name">{{ order.myRole === 'seller' ? '买家：' + order.buyer : order.seller }}</span>
                  </div>
                </div>
                <div class="order-right">
                  <div class="order-price">¥ {{ order.price }}</div>
                  <div class="order-qty">x {{ order.quantity }}</div>
                  <div class="order-actions">
                    <a-button v-if="order.myRole === 'seller' && order.status === 'PENDING'" size="small" type="primary" @click.stop="acceptOrder(order)">接单</a-button>
                    <a-button v-if="order.myRole === 'seller' && order.status === 'PENDING'" size="small" danger @click.stop="rejectOrder(order)">拒单</a-button>
                    <a-button v-if="order.myRole === 'seller' && order.status === 'PROCESSING'" size="small" type="link" style="color:#52c41a" @click.stop="openDeliveryModal(order)">提交交付</a-button>
                    <a-button v-if="order.myRole === 'buyer' && order.status === 'PENDING'" size="small" type="link" danger @click.stop="cancelServiceOrder(order)">取消订单</a-button>
                    <a-button size="small" type="link" @click.stop="viewOrderDetail(order)">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="demand" tab="需求悬赏订单">
          <div v-if="userRole === 'provider'" class="role-filter">
            <a-radio-group v-model:value="demandRoleFilter" class="role-chips">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="publisher">我发布的</a-radio-button>
              <a-radio-button value="bidder">我接取的</a-radio-button>
            </a-radio-group>
          </div>
          <div class="order-list">
            <div v-if="filteredDemandOrders.length === 0" class="empty-state">
              <InboxOutlined class="empty-icon" />
              <p>暂无悬赏订单</p>
            </div>
            <div class="order-card" v-for="order in filteredDemandOrders" :key="order.id" @click="viewOrderDetail(order)">
              <div class="order-card-header">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ order.createTime }}</span>
                <div class="header-right">
                  <a-tag class="role-badge" :class="'role-' + order.myRole">
                    {{ order.myRole === 'publisher' ? '发布' : '接取' }}
                  </a-tag>
                  <a-tag :color="statusColorMap[order.status]" class="order-status">{{ statusTextMap[order.status] || order.status }}</a-tag>
                </div>
              </div>
              <div class="order-card-body">
                <div class="demand-icon">
                  <TrophyOutlined :style="{ fontSize: '32px', color: order.iconColor }" />
                </div>
                <div class="service-info">
                  <div class="service-name">{{ order.demandTitle }}</div>
                  <div class="service-desc">{{ order.demandDesc }}</div>
                  <div class="service-tags">
                    <a-tag size="small" color="orange">{{ order.demandType }}</a-tag>
                  </div>
                  <div class="seller-row">
                    <a-avatar :size="20" :style="{ backgroundColor: order.publisherColor }">{{ order.publisher[0] }}</a-avatar>
                    <span class="seller-name">需求方：{{ order.publisher }}</span>
                  </div>
                </div>
                <div class="order-right">
                  <div class="order-price">¥ {{ order.budgetMin }} ~ {{ order.budgetMax }}</div>
                  <div class="order-qty">悬赏金额</div>
                  <div class="order-total">支付<span>¥ {{ order.budgetMin }} ~ {{ order.budgetMax }}</span></div>
                  <div class="order-actions">
                    <a-button v-if="order.myRole === 'bidder' && order.status === 'PENDING'" size="small" type="primary" @click.stop="acceptOrder(order)">接单</a-button>
                    <a-button v-if="order.myRole === 'bidder' && order.status === 'PENDING'" size="small" danger @click.stop="rejectOrder(order)">拒单</a-button>
                    <a-button v-if="order.myRole === 'bidder' && order.status === 'PROCESSING'" size="small" type="link" style="color:#52c41a" @click.stop="openDeliveryModal(order)">提交交付</a-button>
                    <a-button size="small" type="link" @click.stop="viewOrderDetail(order)">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalOrders"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
        @change="handlePageChange"
      />
    </div>
  </div>

  <!-- 提交交付弹窗 -->
  <a-modal v-model:open="deliveryVisible" title="提交交付" ok-text="确认交付" cancel-text="取消" @ok="submitDelivery" :confirm-loading="deliveryLoading">
    <div style="margin-top:8px">
      <div style="margin-bottom:8px;font-size:13px;color:#666">交付说明</div>
      <a-textarea v-model:value="deliveryForm.note" :rows="4" placeholder="请描述本次交付的内容、成果及注意事项" :maxlength="500" show-count />
      <div style="margin:12px 0 8px;font-size:13px;color:#666">附件（可选）</div>
      <a-upload v-model:file-list="deliveryForm.fileList" :before-upload="() => false" multiple :max-count="5">
        <a-button size="small"><UploadOutlined /> 上传附件</a-button>
      </a-upload>
      <div style="font-size:12px;color:#bbb;margin-top:6px">最多上传5个文件</div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
import { InboxOutlined, TrophyOutlined, DownloadOutlined, UploadOutlined, FileTextOutlined, WalletOutlined, ShopOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const activeTab = ref("service");

const userRole = ref(localStorage.getItem("userRole") || "user");

const serviceRoleFilter = ref(userRole.value === "provider" ? "all" : "buyer");
const demandRoleFilter = ref(userRole.value === "provider" ? "all" : "publisher");

const filteredServiceOrders = computed(() => {
  const orders = serviceOrders.value;
  if (serviceRoleFilter.value === "buyer") return orders.filter(o => o.myRole === "buyer");
  if (serviceRoleFilter.value === "seller") return orders.filter(o => o.myRole === "seller");
  return orders;
});

const filteredDemandOrders = computed(() => {
  const orders = demandOrders.value;
  if (demandRoleFilter.value === "publisher") return orders.filter(o => o.myRole === "publisher");
  if (demandRoleFilter.value === "bidder") return orders.filter(o => o.myRole === "bidder");
  return orders;
});

const currentPage = ref(1);
const pageSize = ref(10);

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
};

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
    myRole: "buyer",
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
    myRole: "buyer",
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
    myRole: "buyer",
  },
  {
    id: 6,
    orderNo: "SVC20260310004",
    createTime: "2026-03-10 09:00:00",
    serviceName: "Docker + K8s 容器化部署实战",
    serviceDesc: "从Docker基础到Kubernetes集群管理，含CI/CD流水线搭建",
    cover: "https://placehold.co/80x60/0db7ed/FFFFFF?text=Docker",
    tags: ["平台保障", "官方认证"],
    seller: "DevOps专家",
    sellerColor: "#13c2c2",
    price: 499,
    quantity: 1,
    status: "DELIVERED",
    serviceId: 4,
    myRole: "buyer",
  },
  {
    id: 7,
    orderNo: "SVC20260312005",
    createTime: "2026-03-12 14:20:00",
    serviceName: "Python 数据分析与机器学习实战",
    serviceDesc: "基于Pandas、Sklearn、Matplotlib完成完整数据分析项目",
    cover: "https://placehold.co/80x60/3776AB/FFFFFF?text=Python",
    tags: ["平台保障"],
    seller: "数据科学家",
    sellerColor: "#fa8c16",
    price: 359,
    quantity: 1,
    status: "PENDING",
    serviceId: 5,
    myRole: "buyer",
  },
  {
    id: 8,
    orderNo: "SVC20260315006",
    createTime: "2026-03-15 10:30:00",
    serviceName: "Spring Boot 微服务架构设计",
    serviceDesc: "从单体到微服务，涵盖服务注册、网关、熔断、链路追踪",
    cover: "https://placehold.co/80x60/6DB33F/FFFFFF?text=Spring",
    tags: ["平台保障", "商家认证"],
    seller: "架构师老王",
    sellerColor: "#52c41a",
    price: 599,
    quantity: 1,
    status: "DELIVERED",
    serviceId: 6,
    myRole: "buyer",
  },
  {
    id: 11,
    orderNo: "SVC20260316007",
    createTime: "2026-03-16 08:00:00",
    serviceName: "Java大厂面试课，一套搞定offer",
    serviceDesc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟",
    cover: "https://placehold.co/80x60/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证"],
    seller: "我（卖家）",
    sellerColor: "#1890ff",
    price: 399,
    quantity: 1,
    status: "PROCESSING",
    serviceId: 1,
    myRole: "seller",
  },
  {
    id: 12,
    orderNo: "SVC20260317008",
    createTime: "2026-03-17 10:00:00",
    serviceName: "Vue3 + TypeScript 企业级实战",
    serviceDesc: "从零搭建企业级前端项目，包含组件库、状态管理、路由等",
    cover: "https://placehold.co/80x60/42b883/FFFFFF?text=Vue3",
    tags: ["平台保障"],
    seller: "我（卖家）",
    sellerColor: "#722ed1",
    price: 299,
    quantity: 1,
    status: "PROCESSING",
    serviceId: 3,
    myRole: "seller",
  },
]);

// 需求悬赏订单
const demandOrders = ref([
  {
    id: 4,
    orderNo: "DMD20260303001",
    createTime: "2026-03-03 10:00:00",
    demandTitle: "MiniMax-M2.1 智能客服系统开发",
    demandDesc: "基于MiniMax大模型开发智能客服系统，需要支持多轮对话、知识库检索",
    demandType: "人工智能",
    publisher: "科技公司HR",
    publisherColor: "#ff4d4f",
    budgetMin: 3000,
    budgetMax: 5000,
    status: "PROCESSING",
    iconColor: "#faad14",
    demandId: 1,
    myRole: "publisher",
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
    myRole: "bidder",
  },
  {
    id: 9,
    orderNo: "DMD20260308003",
    createTime: "2026-03-08 11:00:00",
    demandTitle: "Vue3 后台管理系统开发",
    demandDesc: "基于Vue3+Element Plus开发企业级后台管理系统，含权限管理",
    demandType: "前端开发",
    publisher: "某科技公司",
    publisherColor: "#722ed1",
    budgetMin: 8000,
    budgetMax: 12000,
    status: "DELIVERED",
    iconColor: "#1890ff",
    demandId: 3,
    myRole: "publisher",
  },
  {
    id: 10,
    orderNo: "DMD20260314004",
    createTime: "2026-03-14 16:00:00",
    demandTitle: "小程序商城开发",
    demandDesc: "微信小程序商城，含商品展示、购物车、订单、支付全流程",
    demandType: "移动开发",
    publisher: "电商创业者",
    publisherColor: "#ff4d4f",
    budgetMin: 5000,
    budgetMax: 8000,
    status: "PENDING",
    iconColor: "#faad14",
    demandId: 4,
    myRole: "bidder",
  },
  {
    id: 13,
    orderNo: "DMD20260316005",
    createTime: "2026-03-16 09:30:00",
    demandTitle: "Python 爬虫与数据采集系统",
    demandDesc: "开发分布式爬虫系统，支持多平台数据采集、清洗、存储",
    demandType: "Python",
    publisher: "数据公司",
    publisherColor: "#3776AB",
    budgetMin: 6000,
    budgetMax: 10000,
    status: "PROCESSING",
    iconColor: "#52c41a",
    demandId: 5,
    myRole: "bidder",
  },
  {
    id: 14,
    orderNo: "DMD20260312006",
    createTime: "2026-03-12 08:30:00",
    demandTitle: "Spring Cloud 微服务架构改造",
    demandDesc: "将现有单体应用改造为Spring Cloud微服务架构，含网关、注册中心、熔断",
    demandType: "Java",
    publisher: "我（发布者）",
    publisherColor: "#1890ff",
    budgetMin: 15000,
    budgetMax: 20000,
    status: "PENDING",
    iconColor: "#faad14",
    demandId: 6,
    myRole: "publisher",
  },
  {
    id: 15,
    orderNo: "DMD20260301007",
    createTime: "2026-03-01 14:00:00",
    demandTitle: "Linux 服务器运维与监控搭建",
    demandDesc: "搭建Prometheus+Grafana监控体系，制定运维规范，编写自动化脚本",
    demandType: "运维",
    publisher: "金融科技公司",
    publisherColor: "#722ed1",
    budgetMin: 8000,
    budgetMax: 12000,
    status: "CANCELLED",
    iconColor: "#999",
    demandId: 7,
    myRole: "bidder",
  },
  {
    id: 16,
    orderNo: "DMD20260220008",
    createTime: "2026-02-20 10:00:00",
    demandTitle: "Docker 容器化部署与 CI/CD 流水线",
    demandDesc: "将现有项目容器化，搭建GitLab CI/CD自动化部署流水线",
    demandType: "DevOps",
    publisher: "互联网创业公司",
    publisherColor: "#13c2c2",
    budgetMin: 5000,
    budgetMax: 8000,
    status: "COMPLETED",
    iconColor: "#52c41a",
    demandId: 8,
    myRole: "bidder",
  },
  {
    id: 17,
    orderNo: "DMD20260317009",
    createTime: "2026-03-17 15:00:00",
    demandTitle: "TensorFlow 图像识别模型训练",
    demandDesc: "基于TensorFlow训练图像分类模型，数据集已备好，需完成模型训练与部署",
    demandType: "人工智能",
    publisher: "我（发布者）",
    publisherColor: "#1890ff",
    budgetMin: 4000,
    budgetMax: 6000,
    status: "PENDING",
    iconColor: "#faad14",
    demandId: 9,
    myRole: "publisher",
  },
  {
    id: 18,
    orderNo: "DMD20260215010",
    createTime: "2026-02-15 09:00:00",
    demandTitle: "Redis 缓存架构设计与性能优化",
    demandDesc: "设计Redis缓存方案，优化热点数据访问，提升系统响应速度",
    demandType: "数据库",
    publisher: "在线教育平台",
    publisherColor: "#fa8c16",
    budgetMin: 3000,
    budgetMax: 5000,
    status: "DELIVERED",
    iconColor: "#1890ff",
    demandId: 10,
    myRole: "bidder",
  },
  {
    id: 19,
    orderNo: "DMD20260228011",
    createTime: "2026-02-28 11:30:00",
    demandTitle: "Android 短视频 APP 开发",
    demandDesc: "开发一款短视频分享APP，含拍摄、上传、播放、点赞、评论功能",
    demandType: "移动开发",
    publisher: "我（发布者）",
    publisherColor: "#1890ff",
    budgetMin: 12000,
    budgetMax: 18000,
    status: "PROCESSING",
    iconColor: "#52c41a",
    demandId: 11,
    myRole: "publisher",
  },
  {
    id: 20,
    orderNo: "DMD20260120012",
    createTime: "2026-01-20 16:00:00",
    demandTitle: "Node.js Koa 框架 RESTful API 开发",
    demandDesc: "基于Koa2开发企业级RESTful API，含鉴权、RBAC权限管理",
    demandType: "前端开发",
    publisher: "传统企业数字化部门",
    publisherColor: "#52c41a",
    budgetMin: 6000,
    budgetMax: 9000,
    status: "COMPLETED",
    iconColor: "#52c41a",
    demandId: 12,
    myRole: "bidder",
  },
]);

const totalOrders = computed(
  () => serviceOrders.value.length + demandOrders.value.length
);

const totalSpent = computed(() => {
  const serviceTotal = serviceOrders.value.reduce(
    (sum, o) => sum + o.price * o.quantity,
    0
  );
  const demandTotal = demandOrders.value.reduce(
    (sum, o) => sum + o.budgetMax,
    0
  );
  return (serviceTotal + demandTotal).toFixed(2);
});

// 数据概览项
const summaryItems = computed(() => [
  { label: "订单总数", value: totalOrders.value, icon: FileTextOutlined, color: "#1890ff" },
  { label: "服务订单", value: serviceOrders.value.length, icon: ShopOutlined, color: "#fa8c16" },
  { label: "悬赏订单", value: demandOrders.value.length, icon: TrophyOutlined, color: "#722ed1" },
  { label: "累计交易金额", value: `¥ ${totalSpent.value}`, icon: WalletOutlined, color: "#ff4d4f" },
]);

const deliveryVisible = ref(false);
const deliveryLoading = ref(false);
const deliveryTargetOrder = ref(null);
const deliveryForm = reactive({ note: "", fileList: [] });

const openDeliveryModal = (order) => {
  deliveryTargetOrder.value = order;
  deliveryForm.note = "";
  deliveryForm.fileList = [];
  deliveryVisible.value = true;
};

const submitDelivery = () => {
  if (!deliveryForm.note.trim()) { message.warning("请填写交付说明"); return; }
  deliveryLoading.value = true;
  setTimeout(() => {
    if (deliveryTargetOrder.value) deliveryTargetOrder.value.status = "DELIVERED";
    deliveryLoading.value = false;
    deliveryVisible.value = false;
    message.success("交付成功，等待买家验收");
  }, 600);
};

const acceptOrder = (order) => {
  Modal.confirm({
    title: "确认接单",
    content: "确定接受该订单吗？接单后请尽快开始服务。",
    okText: "确认接单",
    cancelText: "取消",
    onOk() { order.status = "PROCESSING"; message.success("已接单，请尽快开始服务"); },
  });
};

const rejectOrder = (order) => {
  Modal.confirm({
    title: "确认拒单",
    content: "确定拒绝该订单吗？拒单后订单将自动取消。",
    okText: "确认拒单",
    okType: "danger",
    cancelText: "再想想",
    onOk() { order.status = "CANCELLED"; message.success("已拒单"); },
  });
};

const cancelServiceOrder = (order) => {
  Modal.confirm({
    title: "取消订单",
    content: "确定要取消该订单吗？",
    okText: "确定取消",
    okType: "danger",
    cancelText: "再想想",
    onOk() { order.status = "CANCELLED"; message.success("订单已取消"); },
  });
};

const acceptServiceOrder = (order) => {
  Modal.confirm({
    title: "验收通过",
    content: "确认验收通过？资金将结算给卖家。",
    okText: "确认",
    cancelText: "取消",
    onOk() { order.status = "COMPLETED"; message.success("验收通过，交易完成"); },
  });
};

const rejectServiceOrder = (order) => {
  order.status = "PROCESSING";
  message.info("已驳回，卖家将重新交付");
};

const acceptDemandOrder = (order) => {
  Modal.confirm({
    title: "验收通过",
    content: "确认验收通过？资金将结算给服务商。",
    okText: "确认",
    cancelText: "取消",
    onOk() { order.status = "COMPLETED"; message.success("验收通过，交易完成"); },
  });
};

const rejectDemandOrder = (order) => {
  order.status = "PROCESSING";
  message.info("已驳回，服务商将重新交付");
};

const viewServiceDetail = (id) => {
  router.push({ name: "ServiceDetail", params: { id } });
};

const viewDemandDetail = (id) => {
  router.push({ name: "DemandDetail", params: { id } });
};

const viewOrderDetail = (order) => {
  // 将订单数据通过 query 传递给详情页
  router.push({
    name: "OrderDetail",
    params: { id: order.id },
    query: { orderData: JSON.stringify(order) }
  });
};

// CSV 导出工具
const downloadCsv = (filename, headers, rows) => {
  const BOM = "\uFEFF";
  const csvContent =
    BOM +
    [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 导出服务订单
const exportServiceOrders = () => {
  const headers = ["订单号", "服务名称", "服务描述", "卖家", "单价(元)", "数量", "状态", "下单时间"];
  const rows = serviceOrders.value.map((o) => [
    o.orderNo, o.serviceName, o.serviceDesc, o.seller,
    o.price, o.quantity, o.status, o.createTime,
  ]);
  downloadCsv("服务商品订单.csv", headers, rows);
};

// 导出悬赏订单
const exportDemandOrders = () => {
  const headers = ["订单号", "需求标题", "需求描述", "需求类型", "需求方", "预算最低(元)", "预算最高(元)", "状态", "下单时间"];
  const rows = demandOrders.value.map((o) => [
    o.orderNo, o.demandTitle, o.demandDesc, o.demandType,
    o.publisher, o.budgetMin, o.budgetMax, o.status, o.createTime,
  ]);
  downloadCsv("需求悬赏订单.csv", headers, rows);
};
</script>

<style scoped>
.orders-page { width: 100%; }

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
}

/* ===================== 数据概览 ===================== */
.order-summary {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 10px;
  background: #fafafa;
  transition: all 0.2s;
}
.summary-item:hover { background: #f0f9eb; }

.summary-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.summary-icon { font-size: 20px; }

.summary-content { flex: 1; min-width: 0; }
.summary-num {
  font-size: 22px;
  font-weight: 800;
  color: #333;
  line-height: 1.2;
}
.summary-label { font-size: 12px; color: #999; margin-top: 2px; }

/* ===================== 标签页容器 ===================== */
.order-tabs-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.order-tabs { background: #fff; }
.order-tabs :deep(.ant-tabs-nav) { margin-bottom: 0; padding: 0 20px; }
.order-tabs :deep(.ant-tabs-tab) {
  font-size: 15px;
  padding: 12px 0;
  color: #999;
  transition: color 0.2s;
}
.order-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #52c41a;
  font-weight: 600;
}
.order-tabs :deep(.ant-tabs-ink-bar) {
  background: #52c41a;
  height: 3px;
  border-radius: 2px;
}
.order-tabs :deep(.ant-tabs-content-holder) { padding: 0 20px 16px; }

/* 导出按钮 */
.export-btn {
  background: #f0f9eb;
  border: 1px solid #b7eb8f;
  color: #52c41a;
  border-radius: 20px;
}
.export-btn:hover {
  background: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

/* ===================== 角色筛选 ===================== */
.role-filter { padding: 12px 0 4px; }
.role-chips :deep(.ant-radio-button-wrapper) {
  background: #f5f5f5;
  border-color: transparent;
  color: #666;
  border-radius: 20px;
  padding: 0 14px;
  height: 30px;
  line-height: 28px;
  font-size: 13px;
  margin-right: 6px;
  box-shadow: none !important;
}
.role-chips :deep(.ant-radio-button-wrapper::before) { display: none; }
.role-chips :deep(.ant-radio-button-wrapper-checked) {
  background: #52c41a !important;
  border-color: #52c41a !important;
  color: #fff !important;
  box-shadow: none;
}

/* ===================== 订单列表 ===================== */
.order-list { display: flex; flex-direction: column; gap: 12px; }

.empty-state {
  background: #fafafa;
  border-radius: 10px;
  padding: 60px;
  text-align: center;
  color: #ccc;
}
.empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid #f0f0f0;
}
.order-card:hover {
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.12);
  border-color: #b7eb8f;
  transform: translateY(-1px);
}

.order-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.order-no { color: #666; font-weight: 500; white-space: nowrap; }
.order-time { color: #999; white-space: nowrap; }
.header-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.order-status { margin: 0; }

/* 角色徽章 */
.role-badge {
  margin: 0;
  font-size: 11px;
  border-radius: 4px;
  border: none;
}
.role-badge.role-seller,
.role-badge.role-publisher {
  background: #fff7e6;
  color: #fa8c16;
}
.role-badge.role-buyer,
.role-badge.role-bidder {
  background: #f0f9eb;
  color: #52c41a;
}

.order-card-body {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  align-items: flex-start;
}
.service-cover img {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.demand-icon {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  flex-shrink: 0;
}
.service-info { flex: 1; min-width: 0; }
.service-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.service-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-tags { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
.seller-row { display: flex; align-items: center; gap: 6px; }
.seller-name { font-size: 12px; color: #666; }

/* 右侧价格区 */
.order-right {
  text-align: right;
  flex-shrink: 0;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}
.order-price {
  font-size: 20px;
  font-weight: 800;
  color: #ff4d4f;
  line-height: 1;
}
.order-qty { font-size: 12px; color: #999; }
.order-total { font-size: 12px; color: #666; padding-top: 4px; border-top: 1px solid #f0f0f0; margin-top: 2px; }
.order-total span { color: #ff4d4f; font-weight: 600; margin-left: 2px; }
.order-actions { display: flex; gap: 4px; margin-top: 6px; justify-content: flex-end; flex-wrap: wrap; }

/* ===================== 分页 ===================== */
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 16px 0 4px; }
</style>
