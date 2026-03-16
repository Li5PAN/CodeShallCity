<template>
  <div class="creator-page">
    <!-- 简化公告栏 -->
    <div class="notice-bar" v-if="activeNotice">
      <NotificationOutlined class="notice-icon" />
      <span class="notice-tag">{{ activeNotice.tag }}</span>
      <span class="notice-text">{{ activeNotice.content }}</span>
      <a-button type="text" size="small" class="notice-close" @click="activeNotice = null">
        <template #icon><CloseOutlined /></template>
      </a-button>
    </div>

    <div class="creator-body">
      <!-- 左侧主区域 -->
      <div class="creator-main">
        <!-- 快捷发布区 -->
        <div class="creator-card publish-card">
          <div class="card-title">快捷发布</div>
          <div class="publish-grid">
            <div
              class="publish-item"
              @click="router.push('/user/write-article')"
            >
              <div class="publish-icon-wrap publish-gradient-blue">
                <EditOutlined style="color: #fff; font-size: 28px" />
              </div>
              <div class="publish-label">写文章</div>
              <div class="publish-stat">已写 {{ publishStats.articles }} 篇</div>
            </div>
            <div class="publish-item" @click="demandModalVisible = true">
              <div class="publish-icon-wrap publish-gradient-orange">
                <TrophyOutlined style="color: #fff; font-size: 28px" />
              </div>
              <div class="publish-label">发布需求</div>
              <div class="publish-stat">已发布 {{ publishStats.demands }} 个</div>
            </div>
            <div
              v-if="isProvider"
              class="publish-item"
              @click="serviceModalVisible = true"
            >
              <div class="publish-icon-wrap publish-gradient-green">
                <ShopOutlined style="color: #fff; font-size: 28px" />
              </div>
              <div class="publish-label">发布服务</div>
              <div class="publish-stat">已上架 {{ publishStats.services }} 项</div>
            </div>
          </div>
        </div>

        <!-- 创作战绩 -->
        <div class="creator-card stats-card">
          <div class="card-title">创作战绩</div>
          <div class="stats-grid">
            <div class="stat-item" v-for="s in filteredStatsData" :key="s.label">
              <div class="stat-icon" :style="{ background: s.gradient }">
                <component :is="s.icon" style="color: #fff; font-size: 18px" />
              </div>
              <div class="stat-main">
                <div class="stat-value">{{ s.value }}</div>
                <div class="stat-label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 创作动态 -->
        <div class="creator-card dynamic-card">
          <div class="card-title-row">
            <span class="card-title">创作动态</span>
            <a-radio-group
              v-model:value="recentType"
              size="small"
              button-style="solid"
            >
              <a-radio-button value="article">文章</a-radio-button>
              <a-radio-button v-if="isProvider" value="service">服务</a-radio-button>
              <a-radio-button value="demand">悬赏</a-radio-button>
            </a-radio-group>
          </div>
          <div class="dynamic-list">
            <div class="dynamic-item" v-for="item in recentItems" :key="item.id">
              <div class="dynamic-info">
                <div class="dynamic-title">{{ item.title }}</div>
                <div class="dynamic-meta">
                  <a-tag size="small" :color="item.statusColor">{{ item.statusText }}</a-tag>
                  <span class="dynamic-time">{{ item.time }}</span>
                </div>
              </div>
              <div class="dynamic-stats">
                <span v-if="item.reads !== undefined"><EyeOutlined /> {{ item.reads }}</span>
                <span v-if="item.orders !== undefined"><ShoppingCartOutlined /> {{ item.orders }}</span>
                <span v-if="item.applies !== undefined"><TeamOutlined /> {{ item.applies }}</span>
              </div>
              <div class="dynamic-actions">
                <a-button v-if="item.statusText === '草稿'" type="link" size="small">继续编辑</a-button>
                <a-button v-else-if="item.statusText === '审核中'" type="link" size="small" disabled>查看进度</a-button>
                <a-button v-else-if="item.statusText === '已发布' || item.statusText === '已上架'" type="link" size="small">查看详情</a-button>
                <a-button v-else-if="item.statusText === '招募中' || item.statusText === '进行中'" type="link" size="small">管理</a-button>
              </div>
            </div>
            <div v-if="recentItems.length === 0" class="empty-state">
              暂无内容
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="creator-side">
        <!-- 服务提供者卡片 -->
        <div class="creator-card provider-card">
          <!-- 未认证 -->
          <template v-if="!isProvider">
            <div class="provider-header">
              <SafetyCertificateOutlined class="provider-icon" />
              <div>
                <div class="provider-title">成为服务提供者</div>
                <div class="provider-sub">通过认证，开启专业接单</div>
              </div>
            </div>
            <div class="provider-benefits">
              <div class="benefit-item" v-for="b in benefits" :key="b">
                <CheckCircleOutlined style="color: #52c41a" /> {{ b }}
              </div>
            </div>
            <a-button
              type="primary"
              block
              class="apply-btn"
              @click="applyVisible = true"
            >
              立即申请认证
            </a-button>
          </template>
          <!-- 已认证 - 服务商工作台风格 -->
          <template v-else>
            <div class="provider-workspace">
              <div class="provider-badge">
                <SafetyCertificateOutlined /> 已认证服务商
              </div>
              <div class="provider-stats">
                <div class="provider-stat-item">
                  <div class="provider-stat-num">{{ providerStats.pendingOrders }}</div>
                  <div class="provider-stat-label">待处理订单</div>
                </div>
                <div class="provider-stat-item">
                  <div class="provider-stat-num">¥{{ providerStats.todayIncome }}</div>
                  <div class="provider-stat-label">今日收入</div>
                </div>
              </div>
              <a-button type="primary" block class="manage-btn" @click="router.push('/user/my-services')">
                服务商管理
              </a-button>
            </div>
          </template>
        </div>

        <!-- 创作工具推荐 -->
        <div class="creator-card tools-card">
          <div class="card-title">创作工具推荐</div>
          <div class="tools-list">
            <div class="tool-item" v-for="t in tools" :key="t.name" @click="openTool(t.url)">
              <component :is="t.icon" class="tool-icon" />
              <span class="tool-name">{{ t.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布需求 Modal -->
    <DemandPublishModal
      v-model:open="demandModalVisible"
      @success="onDemandSuccess"
    />

    <!-- 发布服务 Modal -->
    <a-modal
      v-model:open="serviceModalVisible"
      title="发布新服务"
      width="600px"
      ok-text="提交审核"
      cancel-text="取消"
      @ok="submitService"
    >
      <a-form :model="serviceForm" layout="vertical" style="margin-top: 8px">
        <a-form-item label="服务标题" required>
          <a-input
            v-model:value="serviceForm.title"
            placeholder="请输入服务标题，建议20字以内"
            :maxlength="50"
            show-count
          />
        </a-form-item>
        <a-form-item label="服务描述" required>
          <a-textarea
            v-model:value="serviceForm.desc"
            :rows="3"
            placeholder="简要描述服务内容"
            :maxlength="200"
            show-count
          />
        </a-form-item>
        <a-form-item label="服务分类" required>
          <a-select
            v-model:value="serviceForm.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <a-select-option
              v-for="c in serviceCategories"
              :key="c"
              :value="c"
              >{{ c }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item label="服务价格（元）" required>
          <a-input-number
            v-model:value="serviceForm.price"
            :min="1"
            :max="99999"
            style="width: 100%"
            placeholder="请输入价格"
          />
        </a-form-item>
        <a-form-item label="服务标签">
          <div class="tag-input-wrap">
            <a-tag
              v-for="tag in serviceForm.tags"
              :key="tag"
              closable
              @close="serviceForm.tags = serviceForm.tags.filter((t) => t !== tag)"
              color="blue"
              >{{ tag }}</a-tag
            >
            <a-input
              v-if="serviceTagVisible"
              ref="serviceTagRef"
              v-model:value="serviceTagValue"
              size="small"
              style="width: 80px"
              @blur="confirmServiceTag"
              @keyup.enter="confirmServiceTag"
            />
            <a-tag
              v-else-if="serviceForm.tags.length < 5"
              style="cursor: pointer; border-style: dashed"
              @click="serviceTagVisible = true; $nextTick(() => serviceTagRef?.focus())"
            >
              <PlusOutlined /> 添加标签
            </a-tag>
          </div>
        </a-form-item>
        <a-form-item label="封面图片">
          <div class="cover-upload" @click="serviceCoverRef?.click()">
            <img
              v-if="serviceForm.coverUrl"
              :src="serviceForm.coverUrl"
              class="cover-preview"
            />
            <div v-else class="cover-placeholder">
              <PictureOutlined style="font-size: 28px; color: #ccc" />
              <span>点击上传封面（推荐 4:3）</span>
            </div>
          </div>
          <input
            ref="serviceCoverRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onServiceCoverChange"
          />
        </a-form-item>
        <a-form-item label="附图商品图">
          <div class="goods-images">
            <div
              class="goods-img-item"
              v-for="(img, idx) in serviceForm.goodsImages"
              :key="idx"
            >
              <img :src="img" class="goods-img-preview" />
              <div class="goods-img-remove" @click="serviceForm.goodsImages.splice(idx, 1)">
                <CloseCircleOutlined />
              </div>
            </div>
            <div
              v-if="serviceForm.goodsImages.length < 9"
              class="goods-img-add"
              @click="goodsImgInputRef?.click()"
            >
              <PlusOutlined style="font-size: 24px; color: #ccc" />
              <span>上传图片</span>
            </div>
          </div>
          <input
            ref="goodsImgInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="onGoodsImgChange"
          />
          <div style="font-size: 12px; color: #bbb; margin-top: 4px">
            最多上传9张商品图片
          </div>
        </a-form-item>
        <a-form-item label="服务详情">
          <a-textarea
            v-model:value="serviceForm.detail"
            :rows="6"
            placeholder="详细描述服务内容、交付物、服务流程等"
            :maxlength="2000"
            show-count
          />
        </a-form-item>
        <a-form-item label="交付周期">
          <a-select v-model:value="serviceForm.deliveryDays" style="width: 100%">
            <a-select-option :value="1">1天内交付</a-select-option>
            <a-select-option :value="3">3天内交付</a-select-option>
            <a-select-option :value="7">7天内交付</a-select-option>
            <a-select-option :value="14">14天内交付</a-select-option>
            <a-select-option :value="30">30天内交付</a-select-option>
            <a-select-option :value="90">90天内交付</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 服务提供者申请弹窗 -->
    <a-modal
      v-model:open="applyVisible"
      title="申请成为服务提供者"
      width="680px"
      ok-text="提交申请"
      cancel-text="取消"
      @ok="submitApply"
    >
      <div class="apply-modal">
        <a-alert
          message="请如实填写以下信息，平台将在 3 个工作日内完成审核，审核结果将通过站内信通知您。"
          type="info"
          show-icon
          style="margin-bottom: 20px"
        />
        <a-form :model="applyForm" layout="vertical" ref="applyFormRef">
          <a-form-item
            label="真实姓名"
            name="realName"
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          >
            <a-input v-model:value="applyForm.realName" placeholder="请输入真实姓名" />
          </a-form-item>
          <a-form-item
            label="身份证号"
            name="idCard"
            :rules="[
              { required: true, message: '请输入身份证号' },
              { pattern: /^\d{17}[\dX]$/, message: '身份证号格式不正确' },
            ]"
          >
            <a-input
              v-model:value="applyForm.idCard"
              placeholder="请输入18位身份证号"
              :maxlength="18"
            />
          </a-form-item>
          <a-form-item
            label="申请理由"
            name="reason"
            :rules="[{ required: true, message: '请填写申请理由' }]"
          >
            <a-textarea
              v-model:value="applyForm.reason"
              :rows="4"
              placeholder="文字描述申请动机或资质，便于管理员初步判断"
              :maxlength="800"
              show-count
            />
          </a-form-item>
          <a-form-item label="证明材料文件URL（可多条）" name="filesRaw">
            <a-textarea
              v-model:value="applyForm.filesRaw"
              :rows="3"
              placeholder="每行一个URL，例如：&#10;http://example.com/idcard.jpg&#10;http://example.com/certificate.pdf"
              :maxlength="2000"
              show-count
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  EditOutlined,
  TrophyOutlined,
  ShopOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  PlusOutlined,
  PictureOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CodeOutlined,
  ExperimentOutlined,
  HighlightOutlined,
} from "@ant-design/icons-vue";
import DemandPublishModal from "../../components/DemandPublishModal.vue";

const router = useRouter();
const applyVisible = ref(false);
const userRole = ref(localStorage.getItem("userRole") || "user");
const isProvider = ref(userRole.value === "provider");
const recentType = ref("article");

// 监听 recentType，如果切换到 service 但不是 provider，则切回 article
import { watch } from "vue";
watch(recentType, (val) => {
  if (val === "service" && !isProvider.value) {
    recentType.value = "article";
  }
});
const applyFormRef = ref(null);

// 简化公告栏 - 取第一条
const notices = ref([
  {
    id: 1,
    tag: "平台公告",
    content: "3月创作激励计划开启！优质文章可获得额外流量扶持，单篇最高奖励 500 积分。",
    time: "2026-03-02",
  },
]);
const activeNotice = ref(notices.value[0] || null);

// 发布需求
const demandModalVisible = ref(false);
const onDemandSuccess = () => {};

// 发布服务
const serviceModalVisible = ref(false);
const serviceTagVisible = ref(false);
const serviceTagValue = ref("");
const serviceTagRef = ref(null);
const serviceCategories = [
  "人工智能", "Java", "Python", "Vue/React", "移动开发",
  "数据库", "运维部署", "大数据", "区块链", "其他",
];
const serviceForm = reactive({
  title: "", desc: "", category: undefined, price: null,
  deliveryDays: 7, tags: [], detail: "", coverUrl: "", goodsImages: [],
});
const serviceCoverRef = ref(null);
const goodsImgInputRef = ref(null);

// 快捷发布统计数据
const publishStats = ref({
  articles: 6,
  demands: 4,
  services: 3,
});

const onServiceCoverChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { serviceForm.coverUrl = ev.target.result; };
  reader.readAsDataURL(file);
};
const onGoodsImgChange = (e) => {
  const files = Array.from(e.target.files);
  const remaining = 9 - serviceForm.goodsImages.length;
  files.slice(0, remaining).forEach((f) => {
    const r = new FileReader();
    r.onload = (ev) => { serviceForm.goodsImages.push(ev.target.result); };
    r.readAsDataURL(f);
  });
  e.target.value = "";
};
const confirmServiceTag = () => {
  const val = serviceTagValue.value.trim();
  if (val && !serviceForm.tags.includes(val)) serviceForm.tags.push(val);
  serviceTagVisible.value = false;
  serviceTagValue.value = "";
};
const submitService = () => {
  if (!serviceForm.title.trim()) { message.warning("请输入服务标题"); return; }
  if (!serviceForm.category) { message.warning("请选择服务分类"); return; }
  if (!serviceForm.price) { message.warning("请输入服务价格"); return; }
  serviceModalVisible.value = false;
  Object.assign(serviceForm, {
    title: "", desc: "", category: undefined, price: null,
    deliveryDays: 7, tags: [], detail: "", coverUrl: "", goodsImages: [],
  });
  message.success("已提交审核，审核通过后自动上架");
};

// 创作战绩数据
const statsData = ref([
  { label: "文章总数", value: 6, icon: FileTextOutlined, gradient: "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)" },
  { label: "总阅读量", value: "12.5k", icon: EyeOutlined, gradient: "linear-gradient(135deg, #52c41a 0%, #95de64 100%)" },
  { label: "总获赞", value: "3.8k", icon: StarOutlined, gradient: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)" },
  { label: "上架服务", value: 3, icon: ShopOutlined, gradient: "linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)" },
  { label: "累计成交", value: 214, icon: ShoppingCartOutlined, gradient: "linear-gradient(135deg, #722ed1 0%, #b37feb 100%)" },
  { label: "发布悬赏", value: 4, icon: TrophyOutlined, gradient: "linear-gradient(135deg, #13c2c0 0%, #36cfc9 100%)" },
]);

const filteredStatsData = computed(() => {
  if (isProvider.value) return statsData.value;
  return statsData.value.filter(s => s.label !== "上架服务" && s.label !== "累计成交");
});

// 已认证服务商统计数据
const providerStats = ref({
  pendingOrders: 5,
  todayIncome: 1280,
});

// 创作动态数据
const recentData = {
  article: [
    { id: 1, title: "深入解析CPU调度：操作系统的核心资源分配机制", statusText: "已发布", statusColor: "green", time: "2026-02-27", reads: "1.5k" },
    { id: 2, title: "Vue3 Composition API 最佳实践总结", statusText: "已发布", statusColor: "green", time: "2026-02-20", reads: "2.3k" },
    { id: 3, title: "Docker容器化部署实战指南", statusText: "草稿", statusColor: "default", time: "2026-02-15", reads: 0 },
  ],
  service: [
    { id: 1, title: "Java大厂面试课，一套搞定offer", statusText: "已上架", statusColor: "green", time: "2026-02-25", orders: 128 },
    { id: 2, title: "Vue3 + TypeScript 企业级实战", statusText: "已上架", statusColor: "green", time: "2026-02-18", orders: 86 },
    { id: 3, title: "Docker + K8s 容器化部署实战", statusText: "审核中", statusColor: "orange", time: "2026-03-01", orders: 0 },
  ],
  demand: [
    { id: 1, title: "MiniMax-M2.1 智能客服系统开发", statusText: "招募中", statusColor: "green", time: "2026-03-03", applies: 12 },
    { id: 2, title: "React Native 跨平台移动端应用开发", statusText: "进行中", statusColor: "blue", time: "2026-02-28", applies: 7 },
    { id: 3, title: "Vue3 后台管理系统开发", statusText: "招募中", statusColor: "green", time: "2026-03-01", applies: 9 },
  ],
};
const recentItems = computed(() => {
  // 非 provider 用户不能查看服务列表
  if (recentType.value === "service" && !isProvider.value) {
    return recentData.article;
  }
  return recentData[recentType.value] || [];
});

// 服务商权益
const benefits = [
  "平台认证标识，提升信任度",
  "优先展示在服务市场搜索结果",
  "享受平台流量扶持与推荐",
  "专属客服通道，快速处理纠纷",
  "参与平台优质服务商激励计划",
];

// 创作工具推荐
const tools = [
  { name: "Markdown编辑器", icon: EditOutlined, url: "https://markdown.com.cn" },
  { name: "代码高亮", icon: CodeOutlined, url: "https://highlightjs.org" },
  { name: "图片压缩", icon: ExperimentOutlined, url: "https://tinypng.com" },
  { name: "在线作图", icon: HighlightOutlined, url: "https://draw.io" },
];
const openTool = (url) => { window.open(url, "_blank"); };

// 申请表单
const applyForm = reactive({
  realName: "", idCard: "", reason: "", filesRaw: "",
});

const submitApply = () => {
  applyFormRef.value?.validate().then(() => {
    const files = (applyForm.filesRaw || "")
      .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const payload = {
      real_name: applyForm.realName,
      id_card: applyForm.idCard,
      reason: applyForm.reason,
      files,
    };
    console.log("provider_apply_payload", payload);
    applyVisible.value = false;
    message.success("申请已提交，平台将在 3 个工作日内完成审核");
  }).catch(() => {
    message.warning("请完整填写必填信息");
  });
};
</script>

<style scoped>
.creator-page { width: 100%; }

/* 简化公告栏 */
.notice-bar {
  background: linear-gradient(90deg, #fff7e6 0%, #fff 100%);
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ffd591;
}
.notice-icon { color: #fa8c16; font-size: 15px; }
.notice-tag {
  background: #ff4d4f;
  color: #fff;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
}
.notice-text { flex: 1; font-size: 13px; color: #333; }
.notice-close { color: #999; }

.creator-body { display: flex; gap: 16px; align-items: flex-start; }
.creator-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.creator-side { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

.creator-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 快捷发布区 - 增大卡片、渐变背景、hover效果 */
.publish-card .publish-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.publish-card .publish-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}
.publish-card .publish-item:hover {
  transform: translateY(-4px);
  border-color: #52c41a;
  box-shadow: 0 8px 24px rgba(82, 196, 26, 0.2);
}
.publish-icon-wrap {
  width: 64px; height: 64px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
}
.publish-gradient-blue { background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%); }
.publish-gradient-orange { background: linear-gradient(135deg, #fa8c16 0%, #ffc069 100%); }
.publish-gradient-green { background: linear-gradient(135deg, #52c41a 0%, #95de64 100%); }
.publish-label { font-size: 16px; font-weight: 700; color: #333; }
.publish-stat { font-size: 12px; color: #999; }

/* 创作战绩 - 渐变背景区分 */
.stats-card .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.stats-card .stat-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; border-radius: 10px;
  background: #fafafa;
}
.stats-card .stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.stats-card .stat-main { flex: 1; }
.stats-card .stat-value {
  font-size: 18px; font-weight: 700; color: #333;
}
.stats-card .stat-label { font-size: 12px; color: #999; margin-top: 2px; }

/* 创作动态 - 紧凑布局 + 操作按钮 */
.dynamic-card .dynamic-list { display: flex; flex-direction: column; }
.dynamic-card .dynamic-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
}
.dynamic-card .dynamic-item:last-child { border-bottom: none; }
.dynamic-card .dynamic-info { flex: 1; min-width: 0; }
.dynamic-card .dynamic-title {
  font-size: 14px; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dynamic-card .dynamic-meta {
  display: flex; align-items: center; gap: 8px;
  margin-top: 4px; font-size: 12px; color: #bbb;
}
.dynamic-card .dynamic-stats {
  display: flex; gap: 10px; font-size: 12px; color: #bbb;
  flex-shrink: 0;
}
.dynamic-card .dynamic-actions {
  flex-shrink: 0;
  margin-left: 8px;
}
.empty-state { padding: 24px; text-align: center; color: #ccc; font-size: 13px; }

/* 右侧边栏 */
.provider-card { border: 1px solid #b7eb8f; background: linear-gradient(135deg, #f6ffed 0%, #fff 100%); }
.provider-card .provider-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.provider-card .provider-icon { font-size: 32px; color: #52c41a; }
.provider-card .provider-title { font-size: 15px; font-weight: 700; color: #333; }
.provider-card .provider-sub { font-size: 12px; color: #999; margin-top: 2px; }
.provider-card .provider-benefits { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.provider-card .benefit-item { font-size: 13px; color: #555; display: flex; align-items: center; gap: 6px; }
.provider-card .apply-btn { background: #52c41a; border-color: #52c41a; }

/* 已认证 - 服务商工作台 */
.provider-workspace .provider-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff; padding: 6px 12px; border-radius: 20px;
  font-size: 13px; font-weight: 600; margin-bottom: 16px;
}
.provider-workspace .provider-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-bottom: 16px;
}
.provider-workspace .provider-stat-item {
  text-align: center; padding: 12px; background: #fafafa; border-radius: 8px;
}
.provider-workspace .provider-stat-num { font-size: 20px; font-weight: 700; color: #333; }
.provider-workspace .provider-stat-label { font-size: 12px; color: #999; margin-top: 4px; }
.provider-workspace .manage-btn { background: #52c41a; border-color: #52c41a; }

/* 创作工具推荐 */
.tools-card .tools-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tools-card .tool-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 8px; border-radius: 8px; background: #fafafa;
  cursor: pointer; transition: all 0.2s;
}
.tools-card .tool-item:hover { background: #f0f9eb; }
.tools-card .tool-icon { font-size: 22px; color: #52c41a; }
.tools-card .tool-name { font-size: 12px; color: #555; }

/* 表单通用样式 */
.apply-modal { max-height: 60vh; overflow-y: auto; padding-right: 4px; }
.tag-input-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cover-upload {
  width: 100%; height: 140px; border: 1px dashed #d9d9d9; border-radius: 6px;
  cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s;
}
.cover-upload:hover { border-color: #52c41a; }
.cover-preview { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #bbb; font-size: 13px; }
.goods-images { display: flex; flex-wrap: wrap; gap: 8px; }
.goods-img-item { position: relative; width: 100px; height: 100px; border-radius: 6px; overflow: hidden; border: 1px solid #f0f0f0; }
.goods-img-preview { width: 100%; height: 100%; object-fit: cover; }
.goods-img-remove {
  position: absolute; top: 2px; right: 2px; cursor: pointer;
  color: #ff4d4f; font-size: 16px; background: rgba(255, 255, 255, 0.8); border-radius: 50%; line-height: 1;
}
.goods-img-add {
  width: 100px; height: 100px; border: 1px dashed #d9d9d9; border-radius: 6px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  cursor: pointer; color: #bbb; font-size: 12px; transition: border-color 0.2s;
}
.goods-img-add:hover { border-color: #52c41a; }
</style>
