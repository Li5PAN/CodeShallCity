<template>
  <div class="order-manage-page">
    <h2 class="page-title">订单管理</h2>

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

    <!-- 订单分类标签页 -->
    <div class="order-tabs-wrap">
      <a-tabs v-model:activeKey="activeTab" class="order-tabs">
        <template #rightExtra>
          <a-button class="export-btn" size="small" @click="activeTab === 'service' ? exportServiceOrders() : exportDemandOrders()">
            <template #icon><DownloadOutlined /></template>
            {{ activeTab === 'service' ? '导出服务订单' : '导出悬赏订单' }}
          </a-button>
        </template>

        <!-- 服务商品订单 -->
        <a-tab-pane key="service" tab="服务商品订单">
          <div class="filter-bar">
            <a-radio-group v-model:value="serviceRoleFilter" class="role-chips">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="buyer">我买入的</a-radio-button>
              <a-radio-button value="seller">我卖出的</a-radio-button>
            </a-radio-group>
            <div style="display:flex;align-items:center;gap:8px">
              <a-select v-model:value="serviceStatusFilter" style="width:130px" size="small">
                <a-select-option value="ALL">全部状态</a-select-option>
                <a-select-option value="PENDING">待接单</a-select-option>
                <a-select-option value="PROCESSING">进行中</a-select-option>
                <a-select-option value="DELIVERED">待验收</a-select-option>
                <a-select-option value="COMPLETED">已完成</a-select-option>
                <a-select-option value="CANCELLED">已取消</a-select-option>
                <a-select-option value="FAILED">已失败</a-select-option>
              </a-select>
              <a-input-search v-model:value="serviceKeyword" placeholder="订单号/服务名称" style="width:200px" size="small" allow-clear />
            </div>
          </div>

          <div class="order-list">
            <div v-if="filteredServiceOrders.length === 0" class="empty-state">
              <InboxOutlined class="empty-icon" />
              <p>暂无服务商品订单</p>
            </div>
            <div class="order-card" v-for="order in filteredServiceOrders" :key="order.id" @click="viewDetail(order)">
              <div class="order-card-header">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ order.createTime }}</span>
                <div class="header-right">
                  <a-tag class="role-badge" :class="'role-' + getMyRole(order)">
                    {{ getMyRoleText(order) }}
                  </a-tag>
                  <a-tag :color="statusColorMap[order.status]" class="order-status">{{ statusTextMap[order.status] }}</a-tag>
                </div>
              </div>
              <div class="order-card-body">
                <div class="service-cover" v-if="order.goodsCover">
                  <img :src="order.goodsCover" :alt="order.goodsName" />
                </div>
                <div class="service-info">
                  <div class="service-name">{{ order.goodsName }}</div>
                  <div class="service-desc">{{ order.goodsDesc }}</div>
                  <div class="service-tags">
                    <a-avatar :size="20" style="background-color:#1890ff">{{ getBuyerName(order)[0] }}</a-avatar>
                    <span class="seller-name">买家：{{ getBuyerName(order) }}</span>
                    <span class="divider">|</span>
                    <a-avatar :size="20" style="background-color:#52c41a">{{ getSellerName(order)[0] }}</a-avatar>
                    <span class="seller-name">卖家：{{ getSellerName(order) }}</span>
                  </div>
                  <div class="time-info" v-if="order.deliverTime || order.finishTime">
                    <span v-if="order.deliverTime"><ClockCircleOutlined /> 交付：{{ order.deliverTime }}</span>
                    <span v-if="order.finishTime" style="margin-left:12px"><CheckCircleOutlined /> 完成：{{ order.finishTime }}</span>
                  </div>
                </div>
                <div class="order-right">
                  <div class="order-price">¥ {{ order.amount }}</div>
                  <div class="order-amount-label">订单金额</div>
                  <div class="order-actions" @click.stop>
                    <template v-if="getMyRole(order) === 'seller'">
                      <a-button v-if="order.status === 'PENDING'" size="small" type="primary" @click="handleAccept(order)">接单</a-button>
                      <a-button v-if="order.status === 'PENDING'" size="small" danger @click="handleReject(order)">拒单</a-button>
                      <a-button v-if="order.status === 'PROCESSING'" size="small" type="link" style="color:#52c41a" @click="openDeliveryModal(order)">提交交付</a-button>
                    </template>
                    <template v-if="getMyRole(order) === 'buyer'">
                      <a-button v-if="order.status === 'PENDING'" size="small" danger @click="handleCancel(order)">取消</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" size="small" type="primary" style="background:#52c41a;border-color:#52c41a" @click="handleAcceptDelivery(order)">验收通过</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" size="small" @click="handleRejectDelivery(order)">验收驳回</a-button>
                    </template>
                    <a-button size="small" type="link" @click="viewDetail(order)">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper" v-if="filteredServiceOrders.length > 0">
            <a-pagination
              v-model:current="servicePage"
              v-model:pageSize="servicePageSize"
              :total="filteredServiceOrders.length"
              show-size-changer
              show-quick-jumper
              :show-total="(total) => `共 ${total} 条`"
            />
          </div>
        </a-tab-pane>

        <!-- 需求悬赏订单 -->
        <a-tab-pane key="demand" tab="需求悬赏订单">
          <div class="filter-bar">
            <a-radio-group v-model:value="demandRoleFilter" class="role-chips">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="publisher">我发布的</a-radio-button>
              <a-radio-button value="bidder">我接取的</a-radio-button>
            </a-radio-group>
            <div style="display:flex;align-items:center;gap:8px">
              <a-select v-model:value="demandStatusFilter" style="width:130px" size="small">
                <a-select-option value="ALL">全部状态</a-select-option>
                <a-select-option value="PENDING">待接单</a-select-option>
                <a-select-option value="PROCESSING">进行中</a-select-option>
                <a-select-option value="DELIVERED">待验收</a-select-option>
                <a-select-option value="COMPLETED">已完成</a-select-option>
                <a-select-option value="CANCELLED">已取消</a-select-option>
                <a-select-option value="FAILED">已失败</a-select-option>
              </a-select>
              <a-input-search v-model:value="demandKeyword" placeholder="订单号/需求标题" style="width:200px" size="small" allow-clear />
            </div>
          </div>

          <div class="order-list">
            <div v-if="filteredDemandOrders.length === 0" class="empty-state">
              <InboxOutlined class="empty-icon" />
              <p>暂无需求悬赏订单</p>
            </div>
            <div class="order-card" v-for="order in filteredDemandOrders" :key="order.id" @click="viewDetail(order)">
              <div class="order-card-header">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ order.createTime }}</span>
                <div class="header-right">
                  <a-tag class="role-badge" :class="'role-' + getDemandRole(order)">
                    {{ getDemandRoleText(order) }}
                  </a-tag>
                  <a-tag :color="statusColorMap[order.status]" class="order-status">{{ statusTextMap[order.status] }}</a-tag>
                </div>
              </div>
              <div class="order-card-body">
                <div class="demand-icon">
                  <TrophyOutlined :style="{ fontSize: '32px', color: '#faad14' }" />
                </div>
                <div class="service-info">
                  <div class="service-name">{{ order.demandTitle }}</div>
                  <div class="service-desc">{{ order.demandDesc }}</div>
                  <div class="service-tags">
                    <a-avatar :size="20" style="background-color:#722ed1">{{ getPublisherName(order)[0] }}</a-avatar>
                    <span class="seller-name">需求方：{{ getPublisherName(order) }}</span>
                    <span class="divider">|</span>
                    <a-avatar :size="20" style="background-color:#13c2c2">{{ getBidderName(order)[0] }}</a-avatar>
                    <span class="seller-name">接单方：{{ getBidderName(order) }}</span>
                  </div>
                  <div class="time-info" v-if="order.deliverTime || order.finishTime">
                    <span v-if="order.deliverTime"><ClockCircleOutlined /> 交付：{{ order.deliverTime }}</span>
                    <span v-if="order.finishTime" style="margin-left:12px"><CheckCircleOutlined /> 完成：{{ order.finishTime }}</span>
                  </div>
                </div>
                <div class="order-right">
                  <div class="order-price">¥ {{ order.amount }}</div>
                  <div class="order-amount-label">悬赏金额</div>
                  <div class="order-actions" @click.stop>
                    <template v-if="getDemandRole(order) === 'bidder'">
                      <a-button v-if="order.status === 'PENDING'" size="small" type="primary" @click="handleAccept(order)">接单</a-button>
                      <a-button v-if="order.status === 'PENDING'" size="small" danger @click="handleReject(order)">拒单</a-button>
                      <a-button v-if="order.status === 'PROCESSING'" size="small" type="link" style="color:#52c41a" @click="openDeliveryModal(order)">提交交付</a-button>
                    </template>
                    <template v-if="getDemandRole(order) === 'publisher'">
                      <a-button v-if="order.status === 'DELIVERED'" size="small" type="primary" style="background:#52c41a;border-color:#52c41a" @click="handleAcceptDelivery(order)">验收通过</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" size="small" @click="handleRejectDelivery(order)">验收驳回</a-button>
                    </template>
                    <a-button size="small" type="link" @click="viewDetail(order)">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper" v-if="filteredDemandOrders.length > 0">
            <a-pagination
              v-model:current="demandPage"
              v-model:pageSize="demandPageSize"
              :total="filteredDemandOrders.length"
              show-size-changer
              show-quick-jumper
              :show-total="(total) => `共 ${total} 条`"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 提交交付弹窗 -->
    <a-modal v-model:open="deliveryVisible" title="提交交付" ok-text="确认交付" cancel-text="取消" @ok="submitDelivery" :confirm-loading="deliveryLoading" width="580px">
      <div style="margin-top:8px">
        <div style="margin-bottom:8px;font-size:13px;color:#666">交付说明</div>
        <a-textarea v-model:value="deliveryForm.note" :rows="4" placeholder="请描述本次交付的内容、成果及注意事项" :maxlength="500" show-count />
        <div style="margin:12px 0 8px;font-size:13px;color:#666">附件（可选，最多上传5个文件）</div>
        <a-upload v-model:file-list="deliveryForm.fileList" :before-upload="() => false" multiple :max-count="5">
          <a-button size="small"><UploadOutlined /> 上传附件</a-button>
        </a-upload>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
import {
  InboxOutlined,
  TrophyOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  WalletOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();

const currentUserId = ref("user123");

const activeTab = ref("service");

// 服务商品筛选
const serviceRoleFilter = ref("all");
const serviceStatusFilter = ref("ALL");
const serviceKeyword = ref("");
const servicePage = ref(1);
const servicePageSize = ref(10);

// 需求悬赏筛选
const demandRoleFilter = ref("all");
const demandStatusFilter = ref("ALL");
const demandKeyword = ref("");
const demandPage = ref(1);
const demandPageSize = ref(10);

// 状态映射
const statusColorMap = {
  PENDING: "orange",
  PROCESSING: "blue",
  DELIVERED: "cyan",
  COMPLETED: "green",
  CANCELLED: "default",
  FAILED: "red",
};

const statusTextMap = {
  PENDING: "待接单",
  PROCESSING: "进行中",
  DELIVERED: "待验收",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  FAILED: "已失败",
};

// ========== 服务商品订单数据 ==========
const serviceOrders = ref([
  {
    id: 1,
    orderNo: "SVC20260310001",
    buyerId: "user456",
    sellerId: "user123",
    demandId: null,
    goodsId: 1,
    amount: 399.00,
    orderType: "SERVICE",
    status: "PROCESSING",
    deliverTime: null,
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-10 14:30:00",
    goodsName: "Java大厂面试课，一套搞定offer",
    goodsDesc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟",
    goodsCover: "https://placehold.co/80x60/FFD700/000000?text=Java",
  },
  {
    id: 2,
    orderNo: "SVC20260205002",
    buyerId: "user123",
    sellerId: "user789",
    demandId: null,
    goodsId: 2,
    amount: 399.00,
    orderType: "SERVICE",
    status: "COMPLETED",
    deliverTime: "2026-02-08 10:00:00",
    finishTime: "2026-02-10 18:20:00",
    cancelReason: null,
    createTime: "2026-02-05 08:55:00",
    goodsName: "10天精通MySQL",
    goodsDesc: "从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表",
    goodsCover: "https://placehold.co/80x60/FF6600/FFFFFF?text=MySQL",
  },
  {
    id: 3,
    orderNo: "SVC20260228003",
    buyerId: "user123",
    sellerId: "user101",
    demandId: null,
    goodsId: 3,
    amount: 299.00,
    orderType: "SERVICE",
    status: "DELIVERED",
    deliverTime: "2026-03-01 16:00:00",
    finishTime: null,
    cancelReason: null,
    createTime: "2026-02-28 15:30:00",
    goodsName: "Vue3 + TypeScript 企业级实战",
    goodsDesc: "从零搭建企业级前端项目，包含组件库、状态管理、路由等",
    goodsCover: "https://placehold.co/80x60/42b883/FFFFFF?text=Vue3",
  },
  {
    id: 6,
    orderNo: "SVC20260312005",
    buyerId: "user123",
    sellerId: "user404",
    demandId: null,
    goodsId: 5,
    amount: 359.00,
    orderType: "SERVICE",
    status: "PENDING",
    deliverTime: null,
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-12 14:20:00",
    goodsName: "Python 数据分析与机器学习实战",
    goodsDesc: "基于Pandas、Sklearn、Matplotlib完成完整数据分析项目",
    goodsCover: "https://placehold.co/80x60/3776AB/FFFFFF?text=Python",
  },
  {
    id: 7,
    orderNo: "SVC20260315006",
    buyerId: "user505",
    sellerId: "user123",
    demandId: null,
    goodsId: 6,
    amount: 599.00,
    orderType: "SERVICE",
    status: "PROCESSING",
    deliverTime: null,
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-15 10:30:00",
    goodsName: "Spring Boot 微服务架构设计",
    goodsDesc: "从单体到微服务，涵盖服务注册、网关、熔断、链路追踪",
    goodsCover: "https://placehold.co/80x60/6DB33F/FFFFFF?text=Spring",
  },
  {
    id: 10,
    orderNo: "SVC20260316007",
    buyerId: "user808",
    sellerId: "user123",
    demandId: null,
    goodsId: 1,
    amount: 399.00,
    orderType: "SERVICE",
    status: "CANCELLED",
    deliverTime: null,
    finishTime: null,
    cancelReason: "买家主动取消",
    createTime: "2026-03-16 08:00:00",
    goodsName: "Java大厂面试课，一套搞定offer",
    goodsDesc: "覆盖Java基础、JVM、并发、分布式等核心考点",
    goodsCover: "https://placehold.co/80x60/FFD700/000000?text=Java",
  },
]);

// ========== 需求悬赏订单数据 ==========
const demandOrders = ref([
  {
    id: 4,
    orderNo: "DMD20260303001",
    buyerId: "user123",
    sellerId: "user202",
    demandId: 1,
    goodsId: null,
    amount: 5000.00,
    orderType: "DEMAND",
    status: "PROCESSING",
    deliverTime: null,
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-03 10:00:00",
    demandTitle: "MiniMax-M2.1 智能客服系统开发",
    demandDesc: "基于MiniMax大模型开发智能客服系统，需要支持多轮对话、知识库检索",
  },
  {
    id: 5,
    orderNo: "DMD20260225002",
    buyerId: "user303",
    sellerId: "user123",
    demandId: 2,
    goodsId: null,
    amount: 15000.00,
    orderType: "DEMAND",
    status: "COMPLETED",
    deliverTime: "2026-02-27 14:00:00",
    finishTime: "2026-03-01 12:00:00",
    cancelReason: null,
    createTime: "2026-02-25 14:20:00",
    demandTitle: "React Native 跨平台移动端应用",
    demandDesc: "开发一款跨平台的移动应用，包含用户系统、支付功能、数据统计",
  },
  {
    id: 8,
    orderNo: "DMD20260308003",
    buyerId: "user123",
    sellerId: "user606",
    demandId: 3,
    goodsId: null,
    amount: 12000.00,
    orderType: "DEMAND",
    status: "DELIVERED",
    deliverTime: "2026-03-10 09:00:00",
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-08 11:00:00",
    demandTitle: "Vue3 后台管理系统开发",
    demandDesc: "基于Vue3+Element Plus开发企业级后台管理系统，含权限管理",
  },
  {
    id: 9,
    orderNo: "DMD20260314004",
    buyerId: "user707",
    sellerId: "user123",
    demandId: 4,
    goodsId: null,
    amount: 8000.00,
    orderType: "DEMAND",
    status: "PENDING",
    deliverTime: null,
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-14 16:00:00",
    demandTitle: "小程序商城开发",
    demandDesc: "微信小程序商城，含商品展示、购物车、订单、支付全流程",
  },
  {
    id: 11,
    orderNo: "DMD20260316005",
    buyerId: "user909",
    sellerId: "user123",
    demandId: 5,
    goodsId: null,
    amount: 10000.00,
    orderType: "DEMAND",
    status: "PROCESSING",
    deliverTime: null,
    finishTime: null,
    cancelReason: null,
    createTime: "2026-03-16 09:30:00",
    demandTitle: "Python 爬虫与数据采集系统",
    demandDesc: "开发分布式爬虫系统，支持多平台数据采集、清洗、存储",
  },
  {
    id: 12,
    orderNo: "DMD20260301007",
    buyerId: "user111",
    sellerId: "user222",
    demandId: 7,
    goodsId: null,
    amount: 12000.00,
    orderType: "DEMAND",
    status: "FAILED",
    deliverTime: null,
    finishTime: null,
    cancelReason: "需求方资金不足",
    createTime: "2026-03-01 14:00:00",
    demandTitle: "Linux 服务器运维与监控搭建",
    demandDesc: "搭建Prometheus+Grafana监控体系，制定运维规范",
  },
]);

// ========== 服务商品订单角色 & 筛选 ==========
const getMyRole = (order) => {
  if (order.buyerId === currentUserId.value) return "buyer";
  if (order.sellerId === currentUserId.value) return "seller";
  return "";
};

const getMyRoleText = (order) => {
  const role = getMyRole(order);
  if (role === "buyer") return "买入";
  if (role === "seller") return "卖出";
  return "";
};

const getBuyerName = (order) => {
  return order.buyerId === currentUserId.value ? "我" : `用户${order.buyerId.slice(-4)}`;
};

const getSellerName = (order) => {
  return order.sellerId === currentUserId.value ? "我" : `服务商${order.sellerId.slice(-4)}`;
};

const filteredServiceOrders = computed(() => {
  let list = [...serviceOrders.value];

  if (serviceRoleFilter.value === "buyer") {
    list = list.filter(o => o.buyerId === currentUserId.value);
  } else if (serviceRoleFilter.value === "seller") {
    list = list.filter(o => o.sellerId === currentUserId.value);
  }

  if (serviceStatusFilter.value !== "ALL") {
    list = list.filter(o => o.status === serviceStatusFilter.value);
  }

  if (serviceKeyword.value.trim()) {
    const kw = serviceKeyword.value.toLowerCase();
    list = list.filter(o =>
      o.orderNo.toLowerCase().includes(kw) ||
      (o.goodsName && o.goodsName.toLowerCase().includes(kw))
    );
  }

  return list;
});

// ========== 需求悬赏订单角色 & 筛选 ==========
const getDemandRole = (order) => {
  if (order.buyerId === currentUserId.value) return "publisher";
  if (order.sellerId === currentUserId.value) return "bidder";
  return "";
};

const getDemandRoleText = (order) => {
  const role = getDemandRole(order);
  if (role === "publisher") return "发布";
  if (role === "bidder") return "接取";
  return "";
};

const getPublisherName = (order) => {
  return order.buyerId === currentUserId.value ? "我" : `需求方${order.buyerId.slice(-4)}`;
};

const getBidderName = (order) => {
  return order.sellerId === currentUserId.value ? "我" : `接单方${order.sellerId.slice(-4)}`;
};

const filteredDemandOrders = computed(() => {
  let list = [...demandOrders.value];

  if (demandRoleFilter.value === "publisher") {
    list = list.filter(o => o.buyerId === currentUserId.value);
  } else if (demandRoleFilter.value === "bidder") {
    list = list.filter(o => o.sellerId === currentUserId.value);
  }

  if (demandStatusFilter.value !== "ALL") {
    list = list.filter(o => o.status === demandStatusFilter.value);
  }

  if (demandKeyword.value.trim()) {
    const kw = demandKeyword.value.toLowerCase();
    list = list.filter(o =>
      o.orderNo.toLowerCase().includes(kw) ||
      (o.demandTitle && o.demandTitle.toLowerCase().includes(kw))
    );
  }

  return list;
});

// ========== 数据概览 ==========
const totalAmount = computed(() => {
  return [...serviceOrders.value, ...demandOrders.value]
    .reduce((sum, o) => sum + o.amount, 0)
    .toFixed(2);
});

const summaryItems = computed(() => [
  { label: "订单总数", value: serviceOrders.value.length + demandOrders.value.length, icon: FileTextOutlined, color: "#1890ff" },
  { label: "服务订单", value: serviceOrders.value.length, icon: ShopOutlined, color: "#fa8c16" },
  { label: "悬赏订单", value: demandOrders.value.length, icon: TrophyOutlined, color: "#722ed1" },
  { label: "累计交易金额", value: `¥ ${totalAmount.value}`, icon: WalletOutlined, color: "#ff4d4f" },
]);

// ========== 交付弹窗 ==========
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
    if (deliveryTargetOrder.value) {
      const isService = deliveryTargetOrder.value.orderType === "SERVICE";
      const list = isService ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === deliveryTargetOrder.value.id);
      if (idx !== -1) {
        list[idx].status = "DELIVERED";
        list[idx].deliverTime = new Date().toLocaleString();
      }
    }
    deliveryLoading.value = false;
    deliveryVisible.value = false;
    message.success("交付成功，等待验收");
  }, 600);
};

// ========== 通用操作 ==========
const handleAccept = (order) => {
  Modal.confirm({
    title: "确认接单",
    content: "确定接受该订单吗？接单后请尽快开始服务。",
    okText: "确认接单",
    cancelText: "取消",
    onOk() {
      const list = order.orderType === "SERVICE" ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === order.id);
      if (idx !== -1) list[idx].status = "PROCESSING";
      message.success("已接单，请尽快开始服务");
    },
  });
};

const handleReject = (order) => {
  Modal.confirm({
    title: "确认拒单",
    content: "确定拒绝该订单吗？",
    okText: "确认拒单",
    okType: "danger",
    cancelText: "再想想",
    onOk() {
      const list = order.orderType === "SERVICE" ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        list[idx].status = "CANCELLED";
        list[idx].cancelReason = "主动拒单";
      }
      message.success("已拒单");
    },
  });
};

const handleCancel = (order) => {
  Modal.confirm({
    title: "取消订单",
    content: "确定要取消该订单吗？",
    okText: "确定取消",
    okType: "danger",
    cancelText: "再想想",
    onOk() {
      const list = order.orderType === "SERVICE" ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        list[idx].status = "CANCELLED";
        list[idx].cancelReason = "买家主动取消";
      }
      message.success("订单已取消");
    },
  });
};

const handleAcceptDelivery = (order) => {
  Modal.confirm({
    title: "确认验收",
    content: "确定要通过此次交付吗？资金将结算给服务商。",
    okText: "确认验收",
    cancelText: "取消",
    onOk() {
      const list = order.orderType === "SERVICE" ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        list[idx].status = "COMPLETED";
        list[idx].finishTime = new Date().toLocaleString();
      }
      message.success("验收成功，交易完成");
    },
  });
};

const handleRejectDelivery = (order) => {
  Modal.confirm({
    title: "验收驳回",
    content: "确定要驳回此次交付吗？服务商将重新提交交付。",
    okText: "确认驳回",
    okType: "danger",
    cancelText: "再想想",
    onOk() {
      const list = order.orderType === "SERVICE" ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === order.id);
      if (idx !== -1) list[idx].status = "PROCESSING";
      message.info("已驳回，服务商将重新交付");
    },
  });
};

const viewDetail = (order) => {
  router.push({
    name: "OrderDetail",
    params: { id: order.id },
    query: { orderData: JSON.stringify(order) },
  });
};

// ========== CSV 导出 ==========
const downloadCsv = (filename, headers, rows) => {
  const BOM = "\uFEFF";
  const csvContent =
    BOM +
    [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportServiceOrders = () => {
  const headers = ["订单号", "服务名称", "服务描述", "买家ID", "卖家ID", "订单金额", "状态", "创建时间", "交付时间", "完成时间", "取消原因"];
  const rows = filteredServiceOrders.value.map((o) => [
    o.orderNo, o.goodsName, o.goodsDesc, o.buyerId, o.sellerId,
    o.amount, statusTextMap[o.status] || o.status, o.createTime,
    o.deliverTime || "-", o.finishTime || "-", o.cancelReason || "-",
  ]);
  downloadCsv("服务商品订单.csv", headers, rows);
};

const exportDemandOrders = () => {
  const headers = ["订单号", "需求标题", "需求描述", "买家ID", "卖家ID", "订单金额", "状态", "创建时间", "交付时间", "完成时间", "取消原因"];
  const rows = filteredDemandOrders.value.map((o) => [
    o.orderNo, o.demandTitle, o.demandDesc, o.buyerId, o.sellerId,
    o.amount, statusTextMap[o.status] || o.status, o.createTime,
    o.deliverTime || "-", o.finishTime || "-", o.cancelReason || "-",
  ]);
  downloadCsv("需求悬赏订单.csv", headers, rows);
};
</script>

<style scoped>
.order-manage-page { width: 100%; }

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
  margin-right: 8px;
}
.export-btn:hover {
  background: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

/* ===================== 筛选栏 ===================== */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===================== 角色筛选 ===================== */
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
.role-badge.role-bidder {
  background: #fff7e6;
  color: #fa8c16;
}
.role-badge.role-buyer,
.role-badge.role-publisher {
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-tags { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.seller-name { font-size: 12px; color: #666; }
.divider { color: #ddd; font-size: 12px; }
.time-info { font-size: 12px; color: #fa8c16; display: flex; align-items: center; gap: 4px; }

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
.order-amount-label { font-size: 12px; color: #999; margin-bottom: 8px; }
.order-actions { display: flex; gap: 4px; margin-top: 4px; justify-content: flex-end; flex-wrap: wrap; }

/* ===================== 分页 ===================== */
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 16px 0 4px; }
</style>
