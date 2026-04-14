<template>
  <div class="order-manage-page">

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
            <!-- 普通用户(user)不显示角色筛选按钮，只显示"我买入的"订单 -->
            <a-radio-group v-model:value="serviceRoleFilter" class="role-chips">
              <template v-if="!isRegularUser">
                <a-radio-button value="all">全部</a-radio-button>
              </template>
             <template v-if="!isRegularUser">
               <a-radio-button value="buyer">我买入的</a-radio-button>
             </template>
              <template v-if="!isRegularUser">
                <a-radio-button value="seller">我卖出的</a-radio-button>
              </template>
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
            <div v-if="serviceLoading" class="loading-state">
              <a-spin />
            </div>
            <div v-else-if="serviceOrders.length === 0" class="empty-state">
              <InboxOutlined class="empty-icon" />
              <p>暂无服务商品订单</p>
            </div>
            <div class="order-card" v-for="order in serviceOrders" :key="order.id" @click="viewDetail(order)">
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
                      <a-button v-if="order.status === 'PENDING'" class="btn-action btn-accept" size="small" @click="handleAccept(order)">接单</a-button>
                      <a-button v-if="order.status === 'PENDING'" class="btn-action btn-reject" size="small" @click="openRejectModal(order)">拒单</a-button>
                      <a-button v-if="order.status === 'PROCESSING'" class="btn-action btn-deliver" size="small" @click="openDeliveryModal(order)">提交交付</a-button>
                    </template>
                    <template v-if="getMyRole(order) === 'buyer'">
                      <a-button v-if="order.status === 'PENDING'" class="btn-action btn-cancel" size="small" @click="handleCancel(order)">取消</a-button>
                      <a-button v-if="order.status === 'PROCESSING' || order.status === 'DELIVERED'" class="btn-action btn-appeal" size="small" @click="openComplaintModal(order)">申诉</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" class="btn-action btn-accept" size="small" @click="handleAcceptDelivery(order)">验收通过</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" class="btn-action btn-reject" size="small" @click="handleRejectDelivery(order)">验收驳回</a-button>
                    </template>
                    <a-button class="btn-action btn-detail" size="small" @click="viewDetail(order)">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper" v-if="serviceOrders.length > 0">
            <a-pagination
              v-model:current="servicePage"
              v-model:pageSize="servicePageSize"
              :total="serviceTotal"
              show-size-changer
              show-quick-jumper
              :show-total="(total) => `共 ${total} 条`"
              @change="handleServicePageChange"
              @showSizeChange="handleServiceSizeChange"
            />
          </div>
        </a-tab-pane>

        <!-- 需求悬赏订单 -->
        <a-tab-pane key="demand" tab="需求悬赏订单">
          <div class="filter-bar">
            <!-- 普通用户(user)不显示角色筛选按钮，只显示"我发布的"订单 -->
            <a-radio-group v-model:value="demandRoleFilter" class="role-chips">
              <template v-if="!isRegularUser">
                <a-radio-button value="all">全部</a-radio-button>
              </template>
              <template v-if="!isRegularUser">
                <a-radio-button value="publisher">我发布的</a-radio-button>
              </template>
              <template v-if="!isRegularUser">
                <a-radio-button value="bidder">我接取的</a-radio-button>
              </template>
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
            <div v-if="demandLoading" class="loading-state">
              <a-spin />
            </div>
            <div v-else-if="demandOrders.length === 0" class="empty-state">
              <InboxOutlined class="empty-icon" />
              <p>暂无需求悬赏订单</p>
            </div>
            <div class="order-card" v-for="order in demandOrders" :key="order.id" @click="viewDetail(order)">
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
                      <a-button v-if="order.status === 'PROCESSING'" class="btn-action btn-deliver" size="small" @click="openDeliveryModal(order)">提交交付</a-button>
                    </template>
                    <template v-if="getDemandRole(order) === 'publisher'">
                      <a-button v-if="order.status === 'PROCESSING' || order.status === 'DELIVERED'" class="btn-action btn-appeal" size="small" @click="openComplaintModal(order)">申诉</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" class="btn-action btn-accept" size="small" @click="handleAcceptDelivery(order)">验收通过</a-button>
                      <a-button v-if="order.status === 'DELIVERED'" class="btn-action btn-reject" size="small" @click="handleRejectDelivery(order)">验收驳回</a-button>
                    </template>
                    <a-button class="btn-action btn-detail" size="small" @click="viewDetail(order)">详情</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper" v-if="demandOrders.length > 0">
            <a-pagination
              v-model:current="demandPage"
              v-model:pageSize="demandPageSize"
              :total="demandTotal"
              show-size-changer
              show-quick-jumper
              :show-total="(total) => `共 ${total} 条`"
              @change="handleDemandPageChange"
              @showSizeChange="handleDemandSizeChange"
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

    <!-- 拒单弹窗 -->
    <a-modal v-model:open="rejectVisible" title="拒单" ok-text="确认拒单" cancel-text="取消" ok-type="danger" @ok="confirmReject" :confirm-loading="rejectLoading" width="500px">
      <div style="margin-top:8px">
        <div style="margin-bottom:8px;font-size:13px;color:#666">请填写拒单原因 <span style="color:#ff4d4f">*</span></div>
        <a-textarea v-model:value="rejectForm.reason" :rows="3" placeholder="请说明拒单的具体原因，以便买家理解" :maxlength="200" show-count />
      </div>
    </a-modal>

    <!-- 申诉弹窗 -->
    <a-modal v-model:open="complaintVisible" title="发起申诉" ok-text="提交申诉" cancel-text="取消" @ok="confirmComplaint" :confirm-loading="complaintLoading" width="580px">
      <div style="margin-top:8px">
        <div style="margin-bottom:8px;font-size:13px;color:#666">申诉类型</div>
        <a-select v-model:value="complaintForm.type" style="width:100%" placeholder="请选择申诉类型">
          <a-select-option value="REFUND">退款申诉</a-select-option>
          <a-select-option value="QUALITY">质量问题</a-select-option>
          <a-select-option value="DELAY">延期问题</a-select-option>
          <a-select-option value="OTHER">其他</a-select-option>
        </a-select>
        <div style="margin:12px 0 8px;font-size:13px;color:#666">申诉说明 <span style="color:#ff4d4f">*</span></div>
        <a-textarea v-model:value="complaintForm.reason" :rows="4" placeholder="请详细描述申诉原因和诉求" :maxlength="500" show-count />
        <div style="margin:12px 0 8px;font-size:13px;color:#666">上传凭证（可选）</div>
        <a-upload v-model:file-list="complaintForm.fileList" :before-upload="() => false" multiple :max-count="3">
          <a-button size="small"><UploadOutlined /> 上传凭证</a-button>
        </a-upload>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from "vue";
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
import { getOrderOverview, getOrderPage, exportOrders } from "@/service/user/uorder.js";

const router = useRouter();

const currentUserId = ref("user123");
const currentUserRole = ref("user"); // 用户角色：user 或 provider

const activeTab = ref("service");

// 服务商品筛选 - user角色默认只看"我买入的"，provider默认全部
const serviceRoleFilter = computed({
  get: () => {
    if (currentUserRole.value === "user") return "buyer";
    return serviceRoleFilterInner.value;
  },
  set: (val) => { serviceRoleFilterInner.value = val; }
});
const serviceRoleFilterInner = ref("all");
const serviceStatusFilter = ref("ALL");
const serviceKeyword = ref("");
const servicePage = ref(1);
const servicePageSize = ref(10);

// 需求悬赏筛选 - user角色默认只看"我发布的"，provider默认全部
const demandRoleFilter = computed({
  get: () => {
    if (currentUserRole.value === "user") return "publisher";
    return demandRoleFilterInner.value;
  },
  set: (val) => { demandRoleFilterInner.value = val; }
});
const demandRoleFilterInner = ref("all");
const demandStatusFilter = ref("ALL");
const demandKeyword = ref("");
const demandPage = ref(1);
const demandPageSize = ref(10);

// 判断是否为普通用户（user角色，不显示买入/卖出筛选按钮）
const isRegularUser = computed(() => currentUserRole.value === "user");

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
const serviceOrders = ref([]);
const serviceLoading = ref(false);
const serviceTotal = ref(0);

// ========== 订单数据概览 ==========
const overviewLoading = ref(false);
const overviewData = ref({
  totalCount: 0,
  serviceOrderCount: 0,
  demandOrderCount: 0,
  totalAmount: 0
});

// 加载服务商品订单列表
const loadServiceOrders = async () => {
  serviceLoading.value = true;
  try {
    const roleMap = { buyer: 'BUYER', seller: 'SELLER', all: undefined };
    const res = await getOrderPage({
      orderType: 'SERVICE',
      status: serviceStatusFilter.value !== 'ALL' ? serviceStatusFilter.value : undefined,
      roleType: roleMap[serviceRoleFilter.value],
      keyword: serviceKeyword.value.trim() || undefined,
      pageNo: servicePage.value,
      pageSize: servicePageSize.value
    });
    if (res && res.data) {
      serviceOrders.value = res.data.records || [];
      serviceTotal.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取服务订单失败:', error);
  } finally {
    serviceLoading.value = false;
  }
};

// 加载订单概览数据
const loadOrderOverview = async () => {
  overviewLoading.value = true;
  try {
    const res = await getOrderOverview();
    if (res && res.data) {
      overviewData.value = res.data;
    }
  } catch (error) {
    console.error('获取订单概览失败:', error);
  } finally {
    overviewLoading.value = false;
  }
};

// ========== 需求悬赏订单数据 ==========
const demandOrders = ref([]);
const demandLoading = ref(false);
const demandTotal = ref(0);

// 加载需求悬赏订单列表
const loadDemandOrders = async () => {
  demandLoading.value = true;
  try {
    const roleMap = { publisher: 'BUYER', bidder: 'SELLER', all: undefined };
    const res = await getOrderPage({
      orderType: 'DEMAND',
      status: demandStatusFilter.value !== 'ALL' ? demandStatusFilter.value : undefined,
      roleType: roleMap[demandRoleFilter.value],
      keyword: demandKeyword.value.trim() || undefined,
      pageNo: demandPage.value,
      pageSize: demandPageSize.value
    });
    if (res && res.data) {
      demandOrders.value = res.data.records || [];
      demandTotal.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取需求悬赏订单失败:', error);
  } finally {
    demandLoading.value = false;
  }
};

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

// ========== 数据概览 ==========
const totalAmount = computed(() => {
  return overviewData.value.totalAmount?.toFixed(2) || "0.00";
});

const summaryItems = computed(() => [
  { label: "订单总数", value: overviewData.value.totalCount || 0, icon: FileTextOutlined, color: "#1890ff" },
  { label: "服务订单", value: overviewData.value.serviceOrderCount || 0, icon: ShopOutlined, color: "#fa8c16" },
  { label: "悬赏订单", value: overviewData.value.demandOrderCount || 0, icon: TrophyOutlined, color: "#722ed1" },
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

// ========== 拒单弹窗 ==========
const rejectVisible = ref(false);
const rejectLoading = ref(false);
const rejectTargetOrder = ref(null);
const rejectForm = reactive({ reason: "" });

const openRejectModal = (order) => {
  rejectTargetOrder.value = order;
  rejectForm.reason = "";
  rejectVisible.value = true;
};

const confirmReject = () => {
  if (!rejectForm.reason.trim()) { message.warning("请填写拒单原因"); return; }
  rejectLoading.value = true;
  setTimeout(() => {
    if (rejectTargetOrder.value) {
      const list = rejectTargetOrder.value.orderType === "SERVICE" ? serviceOrders.value : demandOrders.value;
      const idx = list.findIndex(o => o.id === rejectTargetOrder.value.id);
      if (idx !== -1) {
        list[idx].status = "CANCELLED";
        list[idx].cancelReason = rejectForm.reason;
      }
    }
    rejectLoading.value = false;
    rejectVisible.value = false;
    message.success("已拒单，订单已取消");
  }, 500);
};

// ========== 申诉弹窗 ==========
const complaintVisible = ref(false);
const complaintLoading = ref(false);
const complaintTargetOrder = ref(null);
const complaintForm = reactive({ type: "REFUND", reason: "", fileList: [] });

const openComplaintModal = (order) => {
  complaintTargetOrder.value = order;
  complaintForm.type = "REFUND";
  complaintForm.reason = "";
  complaintForm.fileList = [];
  complaintVisible.value = true;
};

const confirmComplaint = () => {
  if (!complaintForm.reason.trim()) { message.warning("请填写申诉说明"); return; }
  complaintLoading.value = true;
  setTimeout(() => {
    const payload = {
      orderId: complaintTargetOrder.value.id,
      orderNo: complaintTargetOrder.value.orderNo,
      orderType: complaintTargetOrder.value.orderType,
      type: complaintForm.type,
      reason: complaintForm.reason,
      attachments: complaintForm.fileList.map(f => f.url || f.name),
    };
    // const res = await axios.post("/api/complaint/create", payload);
    console.log("提交申诉:", payload);
    complaintLoading.value = false;
    complaintVisible.value = false;
    message.success("申诉已提交，管理员将在1-3个工作日内处理");
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
  const isService = order.orderType === "SERVICE";
  let myRole = "";
  if (isService) {
    myRole = order.buyerId === currentUserId.value ? "buyer" : "seller";
  } else {
    myRole = order.buyerId === currentUserId.value ? "publisher" : "bidder";
  }
  router.push({
    name: "OrderDetail",
    params: { id: order.id },
    query: { orderData: JSON.stringify({ ...order, myRole }) },
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

// 下载 blob 文件
const downloadBlob = (blobData, filename) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blobData);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportServiceOrders = async () => {
  try {
    message.loading({ content: '正在导出服务订单...', key: 'exportService' });
    const roleMap = { buyer: 'BUYER', seller: 'SELLER', all: undefined };
    const res = await exportOrders({
      orderType: 'SERVICE',
      status: serviceStatusFilter.value !== 'ALL' ? serviceStatusFilter.value : undefined,
      roleType: roleMap[serviceRoleFilter.value],
      keyword: serviceKeyword.value.trim() || undefined,
    });
    downloadBlob(res, `服务商品订单_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    message.success({ content: '导出成功', key: 'exportService' });
  } catch (error) {
    console.error('导出服务订单失败:', error);
    message.error({ content: '导出失败，请重试', key: 'exportService' });
  }
};

const exportDemandOrders = async () => {
  try {
    message.loading({ content: '正在导出悬赏订单...', key: 'exportDemand' });
    const roleMap = { publisher: 'BUYER', bidder: 'SELLER', all: undefined };
    const res = await exportOrders({
      orderType: 'DEMAND',
      status: demandStatusFilter.value !== 'ALL' ? demandStatusFilter.value : undefined,
      roleType: roleMap[demandRoleFilter.value],
      keyword: demandKeyword.value.trim() || undefined,
    });
    downloadBlob(res, `需求悬赏订单_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    message.success({ content: '导出成功', key: 'exportDemand' });
  } catch (error) {
    console.error('导出悬赏订单失败:', error);
    message.error({ content: '导出失败，请重试', key: 'exportDemand' });
  }
};

// ========== 分页和筛选事件处理 ==========
const handleServicePageChange = (page, pageSize) => {
  servicePage.value = page;
  servicePageSize.value = pageSize;
  loadServiceOrders();
};

const handleServiceSizeChange = (current, size) => {
  servicePage.value = 1;
  servicePageSize.value = size;
  loadServiceOrders();
};

const handleDemandPageChange = (page, pageSize) => {
  demandPage.value = page;
  demandPageSize.value = pageSize;
  loadDemandOrders();
};

const handleDemandSizeChange = (current, size) => {
  demandPage.value = 1;
  demandPageSize.value = size;
  loadDemandOrders();
};

// 监听筛选条件变化，重新加载数据
watch([serviceRoleFilter, serviceStatusFilter, serviceKeyword], () => {
  servicePage.value = 1;
  loadServiceOrders();
});

watch([demandRoleFilter, demandStatusFilter, demandKeyword], () => {
  demandPage.value = 1;
  loadDemandOrders();
});

// 监听标签页切换，加载对应数据
watch(activeTab, (newTab) => {
  if (newTab === 'service' && serviceOrders.value.length === 0) {
    loadServiceOrders();
  } else if (newTab === 'demand' && demandOrders.value.length === 0) {
    loadDemandOrders();
  }
});

// 组件挂载时加载概览数据和当前标签页订单
onMounted(() => {
  loadOrderOverview();
  if (activeTab.value === 'service') {
    loadServiceOrders();
  } else {
    loadDemandOrders();
  }
});
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

.loading-state {
  background: #fafafa;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
}

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
.order-actions { display: flex; gap: 6px; margin-top: 4px; justify-content: flex-end; flex-wrap: wrap; }

/* ===================== 统一操作按钮样式 ===================== */
.btn-action {
  height: 26px !important;
  padding: 0 12px !important;
  font-size: 12px !important;
  border-radius: 13px !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 0.2s !important;
  line-height: 24px !important;
}
.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* 接单 / 验收通过 — 绿色填充 */
.btn-accept {
  background: #f6ffed !important;
  border-color: #b7eb8f !important;
  color: #52c41a !important;
}
.btn-accept:hover {
  background: #52c41a !important;
  border-color: #52c41a !important;
  color: #fff !important;
}

/* 拒单 / 验收驳回 — 红色描边 */
.btn-reject {
  border-color: #ffa39e !important;
  color: #ff4d4f !important;
}
.btn-reject:hover {
  background: #fff1f0 !important;
  border-color: #ff4d4f !important;
  color: #ff4d4f !important;
}

/* 提交交付 — 蓝色描边 */
.btn-deliver {
  border-color: #91d5ff !important;
  color: #1890ff !important;
}
.btn-deliver:hover {
  background: #e6f7ff !important;
  border-color: #1890ff !important;
  color: #1890ff !important;
}

/* 申诉 / 取消 — 橙色描边 */
.btn-appeal,
.btn-cancel {
  border-color: #ffd591 !important;
  color: #fa8c16 !important;
}
.btn-appeal:hover,
.btn-cancel:hover {
  background: #fff7e6 !important;
  border-color: #fa8c16 !important;
  color: #fa8c16 !important;
}

/* 详情 — 灰色描边 */
.btn-detail {
  border-color: #d9d9d9 !important;
  color: #666 !important;
}
.btn-detail:hover {
  background: #fafafa !important;
  border-color: #999 !important;
  color: #333 !important;
}

/* ===================== 分页 ===================== */
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 16px 0 4px; }
</style>
