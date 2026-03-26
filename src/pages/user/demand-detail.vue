<template>
  <div class="demand-detail-page">
    <!-- 面包屑 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item
        ><a @click="closeDetail">需求悬赏</a></a-breadcrumb-item
      >
      <a-breadcrumb-item>订单号：{{ demand.orderNo }}</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 主体内容：左侧详情 + 右侧操作栏 -->
    <div class="detail-layout">
      <!-- 左侧主内容 -->
      <div class="detail-main">
        <!-- 需求内容卡片 -->
        <div class="detail-card">
          <h2 class="card-title">需求内容</h2>
          <div class="meta-line">
            <span class="meta-author">发布者：{{ demand.publisher }}</span>
            <span class="meta-time">创建时间：{{ demand.createTime }}</span>
            <span class="meta-time">截止时间：{{ demand.deadline }}</span>
            <a-tag :color="getStatusColor(demand.status)" class="status-tag">{{ getStatusText(demand.status) }}</a-tag>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">需求标题</span>
              <span class="info-value">{{ demand.title }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">预算金额</span>
              <span class="info-value price-text"
                >{{ demand.budgetMin }} ~ {{ demand.budgetMax }}元</span
              >
            </div>
            <div class="info-row">
              <span class="info-label">需求描述</span>
              <span class="info-value">{{ demand.description }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">需求类型</span>
              <span class="info-value">{{ demand.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">紧急程度</span>
              <span class="info-value">
                <a-tag :color="getUrgencyColor(demand.urgency)">{{
                  demand.urgency
                }}</a-tag>
              </span>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-row">
            <div class="stat-item">
              <EyeOutlined class="stat-icon" />
              <span class="stat-label">浏览量</span>
              <span class="stat-value">{{ demand.views }}</span>
            </div>
            <div class="stat-item">
              <FileTextOutlined class="stat-icon" />
              <span class="stat-label">投标数</span>
              <span class="stat-value">{{ demand.bids }}</span>
            </div>
          </div>

          <!-- 操作按钮：自己发布的需求不显示 -->
          <div class="action-row" v-if="!fromMyDemands">
            <a-button
              v-if="userRole === 'provider'"
              type="primary"
              size="large"
              class="join-btn"
              ghost
              @click="bidModalVisible = true"
              :disabled="hasJoined"
              >{{ hasJoined ? "已参与" : "参与投标" }}</a-button
            >
            <a-button
              size="large"
              class="similar-btn"
              @click="openSimilarDemand"
              >发布类似需求</a-button
            >
            <a-button
              v-if="!fromFavorites"
              size="large"
              :type="collected ? 'primary' : 'default'"
              @click="collected = !collected"
            >
              <HeartOutlined /> {{ collected ? "已收藏" : "收藏" }}
            </a-button>
          </div>
        </div>

        <!-- 参与服务商 -->
        <div class="detail-card providers-card">
          <h3 class="providers-title">
            参与该需求的服务商
            <span class="providers-count">({{ providers.length }})</span>
          </h3>
          <div class="providers-list">
            <div class="provider-item" v-for="p in providers" :key="p.id">
              <a-avatar :size="56" :style="{ backgroundColor: p.color }">{{
                p.name[0]
              }}</a-avatar>
              <div class="provider-info">
                <div class="provider-name">{{ p.name }}</div>
                <div class="provider-meta">
                  <span class="provider-orders">{{ p.orders }}单已完成</span>
                </div>
                <!-- 投标详情：仅需求发布者可见 -->
                <div class="bid-detail" v-if="fromMyDemands">
                  <div class="bid-row">
                    <span class="bid-label">报价</span>
                    <span class="bid-price">¥ {{ p.bidPrice }}</span>
                    <span class="bid-label" style="margin-left:16px">交付天数</span>
                    <span class="bid-value">{{ p.deliveryDays }} 天</span>
                  </div>
                  <div class="bid-row">
                    <span class="bid-label">投标描述</span>
                    <span class="bid-value bid-desc">{{ p.bidDesc }}</span>
                  </div>
                  <div class="bid-row" v-if="p.attachments && p.attachments.length">
                    <span class="bid-label">附件材料</span>
                    <span class="bid-value">
                      <a v-for="f in p.attachments" :key="f.name" class="bid-attachment">
                        <PaperClipOutlined /> {{ f.name }}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
              <a-button
                v-if="fromMyDemands"
                type="primary"
                size="small"
                ghost
                class="contact-btn"
                @click="handleSelectWinner(p)"
                >选择中标</a-button
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧操作栏 -->
      <div class="detail-sidebar">
        <!-- 调试信息 -->
        <!-- <div style="background: yellow; padding: 10px; margin-bottom: 10px;">
          Debug: from = {{ from }}, fromMyDemands = {{ fromMyDemands }}
        </div> -->

        <div class="sidebar-card" v-if="fromMyDemands">
          <div class="sidebar-title">审核状态</div>
          <div class="audit-info">
            <div class="audit-status">
              <a-badge
                :status="
                  demand.auditStatus === 'approved' ? 'success' : 'error'
                "
                :text="
                  demand.auditStatus === 'approved' ? '审核通过' : '审核未通过'
                "
              />
            </div>
            <div class="audit-remark-label">审核备注</div>
            <div class="audit-remark-content">{{ demand.auditRemark }}</div>
          </div>
        </div>

        <div class="sidebar-card" v-else>
          <div class="sidebar-title">发布需求</div>
          <p class="sidebar-desc">描述您的需求，让专业服务商来帮您完成</p>
          <a-button
            type="primary"
            block
            size="large"
            class="publish-btn"
            @click="
              publishInitialData = null;
              publishModalVisible = true;
            "
            >立即发布需求</a-button
          >
        </div>

        <div class="sidebar-card">
          <div class="sidebar-title">平台保障</div>
          <div class="guarantee-item" v-for="g in guarantees" :key="g.title">
            <component
              :is="g.icon"
              class="g-icon"
              :style="{ color: g.color }"
            />
            <div>
              <div class="g-title">{{ g.title }}</div>
              <div class="g-desc">{{ g.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DemandPublishModal
      v-model:open="publishModalVisible"
      :initialData="publishInitialData"
    />

    <!-- 投标弹窗 -->
    <a-modal v-model:open="bidModalVisible" title="参与投标" ok-text="提交投标" cancel-text="取消" @ok="handleBidSubmit" :confirm-loading="bidLoading">
      <a-form layout="vertical" style="margin-top: 8px">
        <a-form-item label="报价（元）" required>
          <a-input-number v-model:value="bidForm.price" :min="demand.budgetMin" :max="demand.budgetMax" style="width: 100%" :placeholder="`预算范围 ${demand.budgetMin} ~ ${demand.budgetMax} 元`" />
        </a-form-item>
        <a-form-item label="预计交付天数" required>
          <a-input-number v-model:value="bidForm.days" :min="1" :max="365" style="width: 100%" placeholder="请输入交付天数" />
        </a-form-item>
        <a-form-item label="投标描述" required>
          <a-textarea v-model:value="bidForm.desc" :rows="4" placeholder="介绍您的方案、经验和优势" :maxlength="500" show-count />
        </a-form-item>
        <a-form-item label="附件材料（可选）">
          <a-upload v-model:file-list="bidForm.attachments" :before-upload="() => false" multiple :max-count="5">
            <a-button size="small"><PaperClipOutlined /> 上传方案文档</a-button>
          </a-upload>
          <div style="font-size:12px;color:#bbb;margin-top:4px">支持 PDF、Word、ZIP 等，最多5个文件</div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 选择中标确认弹窗 -->
    <a-modal v-model:open="winnerModal.visible" title="确认选择中标" ok-text="确认中标" cancel-text="取消" @ok="confirmSelectWinner" :confirm-loading="winnerModal.loading">
      <p>确定选择该服务商中标吗？</p>
      <p style="color: #999; font-size: 13px">选择后将生成订单并进入交付流程。</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, inject, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Modal, message } from "ant-design-vue";
import {
  CheckCircleOutlined,
  SafetyOutlined,
  MoneyCollectOutlined,
  AuditOutlined,
  HeartOutlined,
  EyeOutlined,
  FileTextOutlined,
  PaperClipOutlined,
} from "@ant-design/icons-vue";
import DemandPublishModal from "../../components/DemandPublishModal.vue";

const props = defineProps({
  id: { type: Number, default: 1 },
  from: { type: String, default: "" },
});
const route = useRoute();
const router = useRouter();
const closeDetail = inject("closeDetail", () => {});

const collected = ref(false);
const publishModalVisible = ref(false);
const publishInitialData = ref(null);
const userRole = ref(localStorage.getItem("userRole") || "user");
const fromFavorites = computed(() => props.from === "favorites");

const hasJoined = ref(false);

// 投标弹窗
const bidModalVisible = ref(false);
const bidLoading = ref(false);
const bidForm = reactive({ price: null, days: null, desc: "", attachments: [] });

const handleBidSubmit = () => {
  if (!bidForm.price) { message.warning("请输入报价"); return; }
  if (!bidForm.days) { message.warning("请输入交付天数"); return; }
  if (!bidForm.desc.trim()) { message.warning("请填写投标描述"); return; }
  bidLoading.value = true;
  setTimeout(() => {
    const username = localStorage.getItem("username") || "我";
    providers.value.push({ id: Date.now(), name: username, orders: 0, color: "#722ed1" });
    hasJoined.value = true;
    bidLoading.value = false;
    bidModalVisible.value = false;
    Object.assign(bidForm, { price: null, days: null, desc: "", attachments: [] });
    message.success("投标成功，等待需求方选择");
  }, 600);
};

// 选择中标弹窗
const winnerModal = reactive({ visible: false, loading: false, provider: null });

const handleSelectWinner = (provider) => {
  winnerModal.provider = provider;
  winnerModal.visible = true;
};

const confirmSelectWinner = () => {
  winnerModal.loading = true;
  fetch("/api/demand/select-bid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      demandId: demand.value.orderNo || demandId.value,
      bidId: winnerModal.provider.id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      winnerModal.loading = false;
      winnerModal.visible = false;
      if (data.code === 0 || data.code === 200) {
        message.success("已选中中标，订单已创建，进入交付流程");
        router.push("/user/order-manage");
      } else {
        message.error(data.message || "选中中标失败，请重试");
      }
    })
    .catch(() => {
      winnerModal.loading = false;
      winnerModal.visible = false;
      message.error("网络错误，请重试");
    });
};

const openSimilarDemand = () => {
  const d = demand.value;
  publishInitialData.value = {
    title: d.title,
    desc: d.description,
    category: d.type,
    budgetMin: d.budgetMin,
    budgetMax: d.budgetMax,
    urgency: d.urgency,
  };
  publishModalVisible.value = true;
};

const fromMyDemands = computed(() => {
  // 检查是否从"我的需求"进入：通过 route query 参数
  return route.query.from === "my-demands";
});
const demandId = computed(() => props.id || parseInt(route.params.id) || 1);

// 获取紧急程度颜色
const getUrgencyColor = (urgency) => {
  const colorMap = {
    紧急: "orange",
    一般: "blue",
    常规: "default",
  };
  return colorMap[urgency] || "default";
};

// 获取需求状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    PENDING: 'warning',
    PROCESSING: 'processing',
    COMPLETED: 'success',
    CLOSED: 'error',
    CANCELLED: 'default'
  }
  return colorMap[status] || 'default'
}

// 获取需求状态文本
const getStatusText = (status) => {
  const textMap = {
    PENDING: '待接单',
    PROCESSING: '进行中',
    COMPLETED: '已完成',
    CLOSED: '已关闭',
    CANCELLED: '已取消'
  }
  return textMap[status] || status
}

const demandMap = {
  1: {
    orderNo: "100234560",
    publisher: "李明",
    createTime: "2026-03-03 15:02:06",
    deadline: "2026-03-18 23:59:59",
    status: "PROCESSING",
    title: "MiniMax-M2.1: MiniMax-AI开源大模型，赋能高效智能应用开发",
    budgetMin: 3000,
    budgetMax: 5000,
    description:
      "需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别、知识库问答等功能，需提供完整源码及部署文档。",
    type: "人工智能",
    urgency: "紧急",
    views: 1256,
    bids: 8,
    auditStatus: "approved",
    auditRemark: "-",
  },
  2: {
    orderNo: "100234561",
    publisher: "王芳",
    createTime: "2026-03-02 10:30:00",
    deadline: "2026-03-22 23:59:59",
    status: "PENDING",
    title: "PaddleOCR-VL: 开源视觉语言OCR工具，多模态识别提升文档处理效率",
    budgetMin: 2500,
    budgetMax: 4500,
    description:
      "基于PaddleOCR开发文档智能识别系统，支持表格、印章、手写体等多种场景识别，需要提供API接口及前端展示页面。",
    type: "Python",
    urgency: "一般",
    views: 892,
    bids: 5,
    auditStatus: "approved",
    auditRemark: "-",
  },
  3: {
    orderNo: "100234562",
    publisher: "张伟",
    createTime: "2026-03-01 09:00:00",
    deadline: "2026-03-31 23:59:59",
    status: "PROCESSING",
    title: "CHATERMAI：开启云资源氛围管理新篇章！",
    budgetMin: 5000,
    budgetMax: 8000,
    description:
      "开发一套云资源管理平台，支持多云环境统一管理、资源监控、费用分析、自动扩缩容等功能，技术栈不限。",
    type: "人工智能",
    urgency: "紧急",
    views: 2103,
    bids: 12,
    auditStatus: "approved",
    auditRemark: "-",
  },
  4: {
    orderNo: "100234563",
    publisher: "赵强",
    createTime: "2026-02-28 14:20:00",
    deadline: "2026-03-25 23:59:59",
    status: "COMPLETED",
    title: "欧拉操作系统内核开源，助力开发者获取源码与技术",
    budgetMin: 8000,
    budgetMax: 15000,
    description:
      "基于欧拉操作系统进行内核模块开发，需要熟悉Linux内核开发，提供完整的模块代码、测试报告及技术文档。",
    type: "C",
    urgency: "常规",
    views: 3456,
    bids: 15,
    auditStatus: "rejected",
    auditRemark: "需求描述不够详细，请补充具体的功能模块和技术要求",
  },
};

const demand = computed(() => demandMap[demandId.value] || demandMap[1]);

const providers = ref([
  {
    id: 1, name: "xxx公司", orders: 320, color: "#1890ff",
    bidPrice: 4200, deliveryDays: 14, bidDesc: "我们有丰富的AI项目经验，曾为多家企业落地大模型应用，可提供完整源码及部署文档。",
    attachments: [{ name: "方案文档.pdf" }, { name: "案例展示.zip" }],
  },
  {
    id: 2, name: "技术工作室", orders: 180, color: "#52c41a",
    bidPrice: 3800, deliveryDays: 10, bidDesc: "专注AI开发5年，熟悉MiniMax API，可快速交付，支持后续维护。",
    attachments: [{ name: "技术方案.docx" }],
  },
  {
    id: 3, name: "云端科技", orders: 95, color: "#faad14",
    bidPrice: 4800, deliveryDays: 20, bidDesc: "团队具备完整的大模型应用开发能力，提供高质量交付，含测试报告。",
    attachments: [],
  },
]);

const guarantees = ref([
  {
    title: "平台担保交易",
    desc: "验收后再付款，资金更安全",
    icon: MoneyCollectOutlined,
    color: "#52c41a",
  },
  {
    title: "服务有标准",
    desc: "资料验收，交付有保障",
    icon: AuditOutlined,
    color: "#1890ff",
  },
  {
    title: "爽约必有赔",
    desc: "交付/离席/爽约有保障",
    icon: CheckCircleOutlined,
    color: "#faad14",
  },
  {
    title: "商家实名认证",
    desc: "服务商100%实名认证",
    icon: SafetyOutlined,
    color: "#ff4d4f",
  },
]);
</script>

<style scoped>
.demand-detail-page {
  width: 100%;
}
.breadcrumb {
  margin-bottom: 16px;
}

.detail-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.detail-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detail-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  background: #fff;
  border-radius: 8px;
  padding: 28px 32px;
}
.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #999;
  flex-wrap: wrap;
}
.meta-author {
  color: #666;
  font-weight: 500;
}
.meta-time {
  color: #999;
}
.status-tag {
  margin-left: auto;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}
.info-row {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.info-row:last-child {
  border-bottom: none;
}
.info-label {
  font-size: 13px;
  color: #999;
  width: 72px;
  flex-shrink: 0;
}
.info-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}
.price-text {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}

.stats-row {
  display: flex;
  gap: 32px;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-icon {
  font-size: 16px;
  color: #1890ff;
}
.stat-label {
  font-size: 13px;
  color: #999;
}
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.action-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.join-btn {
  border-color: #52c41a;
  color: #52c41a;
  min-width: 140px;
}
.join-btn:hover {
  background: #52c41a;
  color: #fff;
}
.similar-btn {
  min-width: 140px;
}
.more-link-row {
  text-align: right;
}
.more-link {
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
}
.more-link:hover {
  color: #40a9ff;
}

.providers-card {
}
.providers-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}
.providers-count {
  font-size: 14px;
  color: #999;
  font-weight: 400;
}
.providers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.provider-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}
.provider-info {
  flex: 1;
  min-width: 0;
}
.provider-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.provider-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}
.provider-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.provider-orders {
  font-size: 12px;
  color: #999;
}
.contact-btn {
  border-color: #1890ff;
  color: #1890ff;
}

.bid-detail {
  margin-top: 10px;
  padding: 10px 12px;
  background: #f6f8ff;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bid-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
}
.bid-label {
  color: #999;
  flex-shrink: 0;
  min-width: 56px;
}
.bid-price {
  color: #ff4d4f;
  font-weight: 600;
}
.bid-value {
  color: #333;
  flex: 1;
}
.bid-desc {
  line-height: 1.6;
}
.bid-attachment {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 10px;
  color: #1890ff;
  font-size: 12px;
  cursor: pointer;
}

.sidebar-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}
.sidebar-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
  line-height: 1.6;
}
.publish-btn {
  background: #52c41a;
  border-color: #52c41a;
}
.publish-btn:hover {
  background: #73d13d;
  border-color: #73d13d;
}

.guarantee-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.guarantee-item:last-child {
  border-bottom: none;
}
.g-icon {
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}
.g-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}
.g-desc {
  font-size: 12px;
  color: #999;
}

.audit-info {
  padding-top: 8px;
}
.audit-status {
  margin-bottom: 16px;
}
.audit-remark-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}
.audit-remark-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  min-height: 60px;
}
</style>
