<template>
  <div class="order-detail-page">
    <!-- 返回按钮 -->
    <div class="back-header">
      <a-button type="link" @click="goBack" class="back-btn">
        <LeftOutlined /> 返回订单列表
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <div class="detail-content" v-if="orderDetail">
        <!-- 1. 订单基本信息 -->
        <a-card class="info-card order-base-info">
          <template #title>
            <div class="card-title">
              <ShopOutlined />
              <span>订单基本信息</span>
            </div>
          </template>
          <a-descriptions :column="4" bordered size="small">
            <a-descriptions-item label="订单号">{{ orderDetail.orderNo }}</a-descriptions-item>
            <a-descriptions-item label="订单类型">
              <a-tag :color="orderDetail.orderType === 'SERVICE' ? 'blue' : 'orange'">
                {{ orderDetail.orderType === 'SERVICE' ? '服务购买' : '需求悬赏' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="订单状态">
              <a-tag :color="statusColorMap[orderDetail.status]">
                {{ statusTextMap[orderDetail.status] }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="订单金额">
              <span class="price">¥{{ orderDetail.amount }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间" :span="2">
              {{ orderDetail.createTime }}
            </a-descriptions-item>
            <a-descriptions-item label="我的角色" :span="2">
              <a-tag :color="currentUserRole === 'buyer' ? 'green' : 'purple'">
                {{ currentUserRole === 'buyer' ? '我是买家' : '我是卖家' }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 2. 关联商品/需求信息 + 3. 交易双方信息 -->
        <div class="middle-section">
          <!-- 关联商品/需求 -->
          <a-card class="info-card related-info">
            <template #title>
              <div class="card-title">
                <FileTextOutlined />
                <span>{{ orderDetail.orderType === 'SERVICE' ? '关联服务' : '关联需求' }}</span>
              </div>
            </template>
            <div class="related-content" v-if="orderDetail.relatedInfo">
              <!-- 根据是否有 cover 字段判断是服务订单（显示图片）还是需求订单（显示图标） -->
              <div class="related-cover" v-if="orderDetail.relatedInfo.cover">
                <img :src="orderDetail.relatedInfo.cover" :alt="orderDetail.relatedInfo.title" />
              </div>
              <div class="related-icon" v-else>
                <TrophyOutlined :style="{ fontSize: '48px', color: orderDetail.relatedInfo.iconColor || '#faad14' }" />
              </div>
              <div class="related-detail">
                <div class="related-title">
                  {{ orderDetail.relatedInfo.title }}
                  <a-button
                    type="link"
                    size="small"
                    @click="goToDetail"
                  >
                    查看详情 <RightOutlined />
                  </a-button>
                </div>
                <div class="related-desc">{{ orderDetail.relatedInfo.description }}</div>
              </div>
            </div>
          </a-card>

          <!-- 交易双方信息 -->
          <a-card class="info-card parties-info">
            <template #title>
              <div class="card-title">
                <TeamOutlined />
                <span>交易双方</span>
              </div>
            </template>
            <div class="party-item">
              <div class="party-label">
                <a-tag color="green">买家</a-tag>
              </div>
              <div class="party-info">
                <a-avatar :size="40" :src="orderDetail.buyer.avatar">
                  {{ orderDetail.buyer.nickname?.[0] || '用户' }}
                </a-avatar>
                <span class="party-name">{{ orderDetail.buyer.nickname }}</span>
                <a-tag v-if="currentUserRole === 'buyer'" color="blue">我</a-tag>
              </div>
            </div>
            <a-divider />
            <div class="party-item">
              <div class="party-label">
                <a-tag color="orange">卖家</a-tag>
              </div>
              <div class="party-info">
                <a-avatar :size="40" :src="orderDetail.seller.avatar">
                  {{ orderDetail.seller.nickname?.[0] || '用户' }}
                </a-avatar>
                <span class="party-name">{{ orderDetail.seller.nickname }}</span>
                <a-tag v-if="currentUserRole === 'seller'" color="blue">我</a-tag>
              </div>
            </div>
          </a-card>
        </div>

        <!-- 4. 交付记录列表 -->
        <a-card class="info-card delivery-list">
          <template #title>
            <div class="card-title">
              <SendOutlined />
              <span>交付记录</span>
            </div>
          </template>
          <div v-if="orderDetail.deliveryList && orderDetail.deliveryList.length > 0">
            <a-timeline>
              <a-timeline-item
                v-for="delivery in orderDetail.deliveryList"
                :key="delivery.deliveryId"
                :color="delivery.version === orderDetail.deliveryList.length ? 'green' : 'blue'"
              >
                <div class="delivery-item">
                  <div class="delivery-header">
                    <span class="delivery-version">第 {{ delivery.version }} 次交付</span>
                    <span class="delivery-time">{{ delivery.submitTime }}</span>
                  </div>
                  <div class="delivery-content">{{ delivery.content }}</div>
                  <div class="delivery-attachments" v-if="delivery.attachments && delivery.attachments.length > 0">
                    <span class="attach-label">附件：</span>
                    <a
                      v-for="(file, index) in delivery.attachments"
                      :key="index"
                      :href="file.url"
                      :download="file.name"
                      class="attach-link"
                    >
                      <PaperClipOutlined /> {{ file.name }}
                    </a>
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
          <a-empty v-else description="暂无交付记录" />
        </a-card>

        <!-- 5. 申诉信息 -->
        <a-card class="info-card complaint-info" v-if="orderDetail.complaint">
          <template #title>
            <div class="card-title">
              <WarningOutlined />
              <span>申诉信息</span>
            </div>
          </template>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="申诉状态">
              <a-tag :color="complaintStatusColorMap[orderDetail.complaint.status]">
                {{ complaintStatusTextMap[orderDetail.complaint.status] }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="申诉时间">
              {{ orderDetail.complaint.createTime || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="申诉理由" :span="2">
              {{ orderDetail.complaint.reason || '-' }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 6. 操作按钮 -->
        <div class="action-buttons">
          <!-- 待接单状态 PENDING -->
          <template v-if="isStatus('PENDING')">
            <a-button v-if="currentUserRole === 'buyer'" danger @click="showCancelModal">
              取消订单
            </a-button>
            <a-button v-if="currentUserRole === 'seller'" type="primary" @click="handleAccept">
              接单
            </a-button>
            <a-button v-if="currentUserRole === 'seller'" danger @click="showRejectModal">
              拒单
            </a-button>
          </template>

          <!-- 进行中状态 PROCESSING -->
          <template v-if="isStatus('PROCESSING')">
            <a-button v-if="currentUserRole === 'seller'" type="primary" @click="showDeliverModal">
              提交交付
            </a-button>
          </template>

          <!-- 待验收状态 DELIVERED -->
          <template v-if="isStatus('DELIVERED')">
            <a-button v-if="currentUserRole === 'buyer'" type="primary" @click="handleAcceptDelivery">
              验收通过
            </a-button>
            <a-button v-if="currentUserRole === 'buyer'" danger @click="showRejectDeliveryModal">
              验收驳回
            </a-button>
          </template>

          <!-- 已完成 COMPLETED / 已取消 CANCELLED / 已失败 FAILED - 无操作按钮 -->
          <template v-if="isStatus('COMPLETED') || isStatus('CANCELLED') || isStatus('FAILED')">
            <span class="no-action-tip">该订单已完结，无可执行操作</span>
          </template>

          <!-- 申诉按钮：进行中或待验收状态，且没有申诉记录时显示 -->
          <a-button
            v-if="(isStatus('PROCESSING') || isStatus('DELIVERED')) && !hasComplaint"
            @click="showComplaintModal"
          >
            发起申诉
          </a-button>
        </div>
      </div>
    </a-spin>

    <!-- 取消订单弹窗 -->
    <a-modal
      v-model:open="cancelModalVisible"
      title="取消订单"
      @ok="handleCancelOrder"
      :confirm-loading="actionLoading"
    >
      <a-textarea
        v-model:value="cancelReason"
        placeholder="请输入取消原因（可选）"
        :rows="3"
      />
    </a-modal>

    <!-- 拒单弹窗 -->
    <a-modal
      v-model:open="rejectModalVisible"
      title="拒单"
      @ok="handleRejectOrder"
      :confirm-loading="actionLoading"
    >
      <a-textarea
        v-model:value="rejectReason"
        placeholder="请输入拒单原因"
        :rows="3"
      />
    </a-modal>

    <!-- 提交交付弹窗 -->
    <a-modal
      v-model:open="deliverModalVisible"
      title="提交交付"
      @ok="handleDeliver"
      :confirm-loading="actionLoading"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="交付内容" required>
          <a-textarea
            v-model:value="deliverContent"
            placeholder="请详细描述交付内容"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="上传附件">
          <a-upload
            v-model:fileList="deliverFiles"
            :before-upload="beforeUpload"
            :multiple="true"
            :max-count="5"
          >
            <a-button>
              <UploadOutlined /> 上传文件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 验收驳回弹窗 -->
    <a-modal
      v-model:open="rejectDeliveryModalVisible"
      title="验收驳回"
      @ok="handleRejectDelivery"
      :confirm-loading="actionLoading"
    >
      <a-textarea
        v-model:value="rejectDeliveryReason"
        placeholder="请输入驳回原因"
        :rows="3"
      />
    </a-modal>

    <!-- 申诉弹窗 -->
    <a-modal
      v-model:open="complaintModalVisible"
      title="发起申诉"
      @ok="handleComplaint"
      :confirm-loading="actionLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="申诉理由" required>
          <a-textarea
            v-model:value="complaintReason"
            placeholder="请详细描述申诉理由"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="上传证据">
          <a-upload
            v-model:fileList="complaintFiles"
            :before-upload="beforeUpload"
            :multiple="true"
            :max-count="3"
          >
            <a-button>
              <UploadOutlined /> 上传证据
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  message,
  Modal,
} from "ant-design-vue";
import {
  LeftOutlined,
  ShopOutlined,
  FileTextOutlined,
  TeamOutlined,
  SendOutlined,
  WarningOutlined,
  TrophyOutlined,
  RightOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const orderId = route.params.id;

// 状态映射
const statusTextMap = {
  PENDING: "待接单",
  PROCESSING: "进行中",
  DELIVERED: "待验收",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  FAILED: "已失败",
  待接单: "待接单",
  进行中: "进行中",
  待验收: "待验收",
  已完成: "已完成",
  已取消: "已取消",
  已失败: "已失败",
};

const statusColorMap = {
  PENDING: "orange",
  PROCESSING: "blue",
  DELIVERED: "cyan",
  COMPLETED: "green",
  CANCELLED: "default",
  FAILED: "red",
  待接单: "orange",
  进行中: "blue",
  待验收: "cyan",
  已完成: "green",
  已取消: "default",
  已失败: "red",
};

const complaintStatusTextMap = {
  PENDING: "待处理",
  PROCESSING: "处理中",
  RESOLVED: "已裁决",
  REJECTED: "已驳回",
};

const complaintStatusColorMap = {
  PENDING: "orange",
  PROCESSING: "blue",
  RESOLVED: "green",
  REJECTED: "red",
};

// 当前用户ID（mock，实际应从store获取）
const currentUserId = ref("user123");

// 是否有申诉记录
const hasComplaint = computed(() => {
  return !!orderDetail.value?.complaint;
});

// 数据
const loading = ref(false);
const actionLoading = ref(false);
const orderDetail = ref(null);

// 当前用户角色
const currentUserRole = computed(() => {
  if (!orderDetail.value) return "";
  // 优先使用从列表传入的 myRole
  if (orderDetail.value.myRole) {
    const r = orderDetail.value.myRole;
    // 统一映射：buyer/publisher → buyer，seller/bidder → seller
    if (r === 'buyer' || r === 'publisher') return 'buyer';
    if (r === 'seller' || r === 'bidder') return 'seller';
  }
  if (orderDetail.value.buyer.userId === currentUserId.value) return "buyer";
  if (orderDetail.value.seller.userId === currentUserId.value) return "seller";
  return "";
});

// 判断订单状态（支持中英文）
const isStatus = (status) => {
  if (!orderDetail.value) return false;
  const currentStatus = orderDetail.value.status;
  // 中文状态映射
  const statusMap = {
    '待接单': 'PENDING',
    '进行中': 'PROCESSING',
    '待验收': 'DELIVERED',
    '已完成': 'COMPLETED',
    '已取消': 'CANCELLED',
    '已失败': 'FAILED',
  };
  // 如果是中文状态，转换为英文
  const normalizedStatus = statusMap[currentStatus] || currentStatus;
  return normalizedStatus === status;
};

// 根据订单状态返回对应的交付记录
const getDeliveryListByStatus = (status) => {
  // 中文状态映射
  const statusMap = {
    '待接单': 'PENDING',
    '进行中': 'PROCESSING',
    '待验收': 'DELIVERED',
    '已完成': 'COMPLETED',
    '已取消': 'CANCELLED',
    '已失败': 'FAILED',
  };
  const normalizedStatus = statusMap[status] || status;

  // 待接单状态没有交付记录
  if (normalizedStatus === 'PENDING' || normalizedStatus === 'CANCELLED' || normalizedStatus === 'FAILED') {
    return [];
  }

  // 已完成状态有完整的交付记录
  if (normalizedStatus === 'COMPLETED') {
    return [
      {
        deliveryId: 1,
        content: "已完成项目基础框架搭建，包含了路由配置、状态管理、基础组件等",
        attachments: [
          { name: "项目代码.zip", url: "/files/code.zip" },
          { name: "说明文档.pdf", url: "/files/doc.pdf" },
        ],
        submitTime: "2026-03-12 10:00:00",
        version: 1,
      },
      {
        deliveryId: 2,
        content: "完成了用户管理模块的开发，包括增删改查功能",
        attachments: [
          { name: "用户模块代码.zip", url: "/files/user.zip" },
        ],
        submitTime: "2026-03-14 16:20:00",
        version: 2,
      },
    ];
  }

  // 进行中状态有一条交付记录
  if (normalizedStatus === 'PROCESSING') {
    return [
      {
        deliveryId: 1,
        content: "已完成项目基础框架搭建，包含了路由配置、状态管理、基础组件等",
        attachments: [
          { name: "项目代码.zip", url: "/files/code.zip" },
          { name: "说明文档.pdf", url: "/files/doc.pdf" },
        ],
        submitTime: "2026-03-12 10:00:00",
        version: 1,
      },
    ];
  }

  // 待验收状态有两条交付记录
  if (normalizedStatus === 'DELIVERED') {
    return [
      {
        deliveryId: 1,
        content: "已完成项目基础框架搭建，包含了路由配置、状态管理、基础组件等",
        attachments: [
          { name: "项目代码.zip", url: "/files/code.zip" },
          { name: "说明文档.pdf", url: "/files/doc.pdf" },
        ],
        submitTime: "2026-03-12 10:00:00",
        version: 1,
      },
      {
        deliveryId: 2,
        content: "完成了用户管理模块的开发，包括增删改查功能",
        attachments: [
          { name: "用户模块代码.zip", url: "/files/user.zip" },
        ],
        submitTime: "2026-03-14 16:20:00",
        version: 2,
      },
    ];
  }

  return [];
};

// 弹窗状态
const cancelModalVisible = ref(false);
const cancelReason = ref("");
const rejectModalVisible = ref(false);
const rejectReason = ref("");
const deliverModalVisible = ref(false);
const deliverContent = ref("");
const deliverFiles = ref([]);
const rejectDeliveryModalVisible = ref(false);
const rejectDeliveryReason = ref("");
const complaintModalVisible = ref(false);
const complaintReason = ref("");
const complaintFiles = ref([]);

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true;
  try {
    // 优先使用从订单列表传递的数据
    const orderDataStr = route.query.orderData;
    if (orderDataStr) {
      const orderData = JSON.parse(orderDataStr);

      // 根据是否有 serviceName 字段判断是否是服务订单
      const isServiceOrder = !!orderData.serviceName;

      if (isServiceOrder) {
        // 服务订单
        orderDetail.value = {
          orderId: orderData.id,
          orderNo: orderData.orderNo,
          orderType: "SERVICE",
          status: orderData.status,
          amount: orderData.price,
          createTime: orderData.createTime,
          myRole: orderData.myRole || 'buyer',
          buyer: {
            userId: orderData.myRole === 'buyer' ? currentUserId.value : "other_user",
            nickname: orderData.myRole === 'seller' ? orderData.buyer || '买家用户' : '我',
            avatar: "",
          },
          seller: {
            userId: orderData.myRole === 'seller' ? currentUserId.value : "other_user",
            nickname: orderData.seller,
            avatar: "",
          },
          relatedInfo: {
            id: orderData.serviceId,
            title: orderData.serviceName,
            description: orderData.serviceDesc,
            cover: orderData.cover,
          },
          deliveryList: getDeliveryListByStatus(orderData.status),
        };
      } else {
        // 需求订单
        orderDetail.value = {
          orderId: orderData.id,
          orderNo: orderData.orderNo,
          orderType: "DEMAND",
          status: orderData.status,
          amount: orderData.budgetMax,
          createTime: orderData.createTime,
          myRole: orderData.myRole || 'publisher',
          buyer: {
            userId: orderData.myRole === 'publisher' ? currentUserId.value : "other_user",
            nickname: orderData.myRole === 'bidder' ? orderData.publisher : '我',
            avatar: "",
          },
          seller: {
            userId: orderData.myRole === 'bidder' ? currentUserId.value : "other_user",
            nickname: orderData.publisher,
            avatar: "",
          },
          relatedInfo: {
            id: orderData.demandId,
            title: orderData.demandTitle,
            description: orderData.demandDesc,
            iconColor: orderData.iconColor || '#faad14',
          },
          deliveryList: getDeliveryListByStatus(orderData.status),
        };
      }
      loading.value = false;
      return;
    }

    // 如果没有传递数据，使用mock数据（兼容直接访问URL的情况）
    // const res = await axios.get(`/api/order/detail/${orderId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 根据orderId返回不同的mock数据，模拟真实订单信息
    const id = parseInt(orderId);

    // 服务订单mock数据
    const serviceOrderData = {
      orderId: id,
      orderNo: "SVC20260310001",
      orderType: "SERVICE",
      status: "PROCESSING",
      amount: 399,
      createTime: "2026-03-10 14:30:00",
      buyer: {
        userId: "user123",
        nickname: "程序员小王",
        avatar: "",
      },
      seller: {
        userId: "provider456",
        nickname: "前端大师",
        avatar: "",
      },
      relatedInfo: {
        id: 1,
        title: "Vue3 + TypeScript 企业级实战",
        description: "从零搭建企业级前端项目，包含组件库、状态管理、路由等",
        cover: "https://placehold.co/120x90/42b883/FFFFFF?text=Vue3",
      },
      deliveryList: [
        {
          deliveryId: 1,
          content: "已完成项目基础框架搭建，包含了路由配置、状态管理、基础组件等",
          attachments: [
            { name: "项目代码.zip", url: "/files/code.zip" },
            { name: "说明文档.pdf", url: "/files/doc.pdf" },
          ],
          submitTime: "2026-03-12 10:00:00",
          version: 1,
        },
        {
          deliveryId: 2,
          content: "完成了用户管理模块的开发，包括增删改查功能",
          attachments: [
            { name: "用户模块代码.zip", url: "/files/user.zip" },
          ],
          submitTime: "2026-03-14 16:20:00",
          version: 2,
        },
      ],
    };

    // 需求悬赏订单mock数据
    const demandOrderData = {
      orderId: id,
      orderNo: "DMD20260303001",
      orderType: "DEMAND",
      status: "PROCESSING",
      amount: 5000,
      createTime: "2026-03-03 10:00:00",
      buyer: {
        userId: "user123",
        nickname: "程序员小王",
        avatar: "",
      },
      seller: {
        userId: "provider789",
        nickname: "解决方案专家",
        avatar: "",
      },
      relatedInfo: {
        id: 1,
        title: "MiniMax-M2.1 智能客服系统开发",
        description: "基于MiniMax大模型开发智能客服系统，需要支持多轮对话、知识库检索",
      },
      deliveryList: [
        {
          deliveryId: 1,
          content: "已完成需求分析和系统架构设计，输出了详细的技术方案文档",
          attachments: [
            { name: "技术方案.pdf", url: "/files/tech.pdf" },
            { name: "原型图.zip", url: "/files/prototype.zip" },
          ],
          submitTime: "2026-03-05 15:00:00",
          version: 1,
        },
      ],
    };

    // 根据订单ID返回对应类型的数据
    // 奇数ID返回服务订单，偶数ID返回需求订单
    if (id % 2 === 1) {
      orderDetail.value = serviceOrderData;
    } else {
      orderDetail.value = demandOrderData;
    }
  } catch (error) {
    message.error("获取订单详情失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 返回列表
const goBack = () => {
  router.push({ name: "Orders" });
};

// 跳转到关联详情
const goToDetail = () => {
  if (orderDetail.value.orderType === "SERVICE") {
    router.push({
      name: "ServiceDetail",
      params: { id: orderDetail.value.relatedInfo.id },
    });
  } else {
    router.push({
      name: "DemandDetail",
      params: { id: orderDetail.value.relatedInfo.id },
    });
  }
};

// 文件上传前处理
const beforeUpload = (file) => {
  return false;
};

// 取消订单
const showCancelModal = () => {
  cancelReason.value = "";
  cancelModalVisible.value = true;
};

const handleCancelOrder = async () => {
  actionLoading.value = true;
  try {
    // const res = await axios.post("/api/order/cancel", {
    //   orderId,
    //   reason: cancelReason.value,
    // });
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success("订单已取消");
    cancelModalVisible.value = false;
    fetchOrderDetail();
  } catch (error) {
    message.error("操作失败");
  } finally {
    actionLoading.value = false;
  }
};

// 接单
const handleAccept = async () => {
  Modal.confirm({
    title: "确认接单",
    content: "确定要接下此订单吗？",
    onOk: async () => {
      actionLoading.value = true;
      try {
        // const res = await axios.post("/api/order/accept-order", { orderId });
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success("接单成功");
        fetchOrderDetail();
      } catch (error) {
        message.error("操作失败");
      } finally {
        actionLoading.value = false;
      }
    },
  });
};

// 拒单
const showRejectModal = () => {
  rejectReason.value = "";
  rejectModalVisible.value = true;
};

const handleRejectOrder = async () => {
  if (!rejectReason.value.trim()) {
    message.warning("请输入拒单原因");
    return;
  }
  actionLoading.value = true;
  try {
    // const res = await axios.post("/api/order/reject-order", {
    //   orderId,
    //   reason: rejectReason.value,
    // });
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success("已拒单");
    rejectModalVisible.value = false;
    fetchOrderDetail();
  } catch (error) {
    message.error("操作失败");
  } finally {
    actionLoading.value = false;
  }
};

// 提交交付
const showDeliverModal = () => {
  deliverContent.value = "";
  deliverFiles.value = [];
  deliverModalVisible.value = true;
};

const handleDeliver = async () => {
  if (!deliverContent.value.trim()) {
    message.warning("请输入交付内容");
    return;
  }
  actionLoading.value = true;
  try {
    // const formData = new FormData();
    // formData.append("orderId", orderId);
    // formData.append("content", deliverContent.value);
    // deliverFiles.value.forEach((file) => {
    //   formData.append("attachments", file.originFileObj);
    // });
    // const res = await axios.post("/api/order/deliver", formData);
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success("交付成功");
    deliverModalVisible.value = false;
    fetchOrderDetail();
  } catch (error) {
    message.error("操作失败");
  } finally {
    actionLoading.value = false;
  }
};

// 验收通过
const handleAcceptDelivery = async () => {
  Modal.confirm({
    title: "确认验收",
    content: "确定要通过此次交付吗？",
    onOk: async () => {
      actionLoading.value = true;
      try {
        // const res = await axios.post("/api/order/accept-delivery", { orderId });
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success("验收成功");
        fetchOrderDetail();
      } catch (error) {
        message.error("操作失败");
      } finally {
        actionLoading.value = false;
      }
    },
  });
};

// 验收驳回
const showRejectDeliveryModal = () => {
  rejectDeliveryReason.value = "";
  rejectDeliveryModalVisible.value = true;
};

const handleRejectDelivery = async () => {
  if (!rejectDeliveryReason.value.trim()) {
    message.warning("请输入驳回原因");
    return;
  }
  actionLoading.value = true;
  try {
    // const res = await axios.post("/api/order/reject-delivery", {
    //   orderId,
    //   reason: rejectDeliveryReason.value,
    // });
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success("已驳回交付");
    rejectDeliveryModalVisible.value = false;
    fetchOrderDetail();
  } catch (error) {
    message.error("操作失败");
  } finally {
    actionLoading.value = false;
  }
};

// 发起申诉
const showComplaintModal = () => {
  complaintReason.value = "";
  complaintFiles.value = [];
  complaintModalVisible.value = true;
};

const handleComplaint = async () => {
  if (!complaintReason.value.trim()) {
    message.warning("请输入申诉理由");
    return;
  }
  actionLoading.value = true;
  try {
    // const formData = new FormData();
    // formData.append("orderId", orderId);
    // formData.append("reason", complaintReason.value);
    // complaintFiles.value.forEach((file) => {
    //   formData.append("evidence", file.originFileObj);
    // });
    // const res = await axios.post("/api/complaint/create", formData);
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success("申诉已提交");
    complaintModalVisible.value = false;
    fetchOrderDetail();
  } catch (error) {
    message.error("操作失败");
  } finally {
    actionLoading.value = false;
  }
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.order-detail-page {
  width: 100%;
}

.back-header {
  margin-bottom: 16px;
}

.back-btn {
  padding: 0;
  height: auto;
  color: #666;
}

.back-btn:hover {
  color: #52c41a;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  border-radius: 8px;
}

.info-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-title :deep(.anticon) {
  color: #52c41a;
}

.price {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}

.middle-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.related-content {
  display: flex;
  gap: 16px;
}

.related-cover img {
  width: 120px;
  height: 90px;
  border-radius: 6px;
  object-fit: cover;
}

.related-icon {
  width: 120px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 6px;
  flex-shrink: 0;
}

.related-detail {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.related-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.party-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.party-label {
  width: 50px;
}

.party-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.party-name {
  font-weight: 500;
}

.delivery-item {
  padding: 8px 0;
}

.delivery-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.delivery-version {
  font-weight: 600;
  color: #333;
}

.delivery-time {
  color: #999;
  font-size: 13px;
}

.delivery-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.delivery-attachments {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.attach-label {
  color: #999;
  font-size: 13px;
}

.attach-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  font-size: 13px;
}

.attach-link:hover {
  color: #40a9ff;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
}

.no-action-tip {
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .middle-section {
    grid-template-columns: 1fr;
  }

  .related-content {
    flex-direction: column;
  }

  .related-cover img,
  .related-icon {
    width: 100%;
    height: 120px;
  }
}
</style>
