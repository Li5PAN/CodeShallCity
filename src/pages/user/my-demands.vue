<template>
  <div class="my-demands-page">
    <div class="page-header">
      <h2 class="page-title">我的需求</h2>
      <a-button
        type="primary"
        style="background: #52c41a; border-color: #52c41a"
        @click="openDrawer()"
      >
        <PlusOutlined /> 发布悬赏
      </a-button>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-num" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <a-tabs v-model:activeKey="statusFilter" class="status-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="PENDING" tab="待接单" />
        <a-tab-pane key="PROCESSING" tab="进行中" />
        <a-tab-pane key="COMPLETED" tab="已完成" />
        <a-tab-pane key="CLOSED" tab="已关闭" />
        <a-tab-pane key="CANCELLED" tab="已取消" />
      </a-tabs>
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="搜索需求"
        size="small"
        style="width: 200px"
      />
    </div>

    <!-- 列表 -->
    <div class="demand-list">
      <div v-if="filteredList.length === 0" class="empty-state">
        <TrophyOutlined style="font-size: 48px; color: #e0e0e0" />
        <p>暂无悬赏需求，点击右上角发布</p>
      </div>

      <div class="demand-item" v-for="item in filteredList" :key="item.id">
        <div class="demand-main" style="cursor: pointer">
          <div
            class="demand-title"
            @click="
              $router.push(`/user/demand-detail/${item.id}?from=my-demands`)
            "
          >
            {{ item.title }}
          </div>
          <div class="demand-desc">{{ item.desc }}</div>
          <div class="demand-tags">
            <a-tag size="small" color="orange">{{ item.category }}</a-tag>
            <a-tag size="small" :color="getUrgencyColor(item.urgency)">{{
              item.urgency
            }}</a-tag>
          </div>
          <div class="demand-meta">
            <span>发布时间：{{ item.publishTime }}</span>
            <span>截止时间：{{ item.deadline }}</span>
            <span
              >报名人数：<strong>{{ item.applyCount }}</strong> 人</span
            >
          </div>
        </div>
        <div class="demand-right">
          <div class="demand-budget">
            ¥ {{ item.budgetMin }} ~ ¥ {{ item.budgetMax }}
          </div>
          <div class="demand-status">
            <a-badge
              :status="statusMap[item.status].badge"
              :text="statusMap[item.status].text"
            />
          </div>
          <div class="demand-actions">
            <a-button
              size="small"
              @click.stop="
                $router.push(`/user/demand-detail/${item.id}?from=my-demands`)
              "
              >查看详情</a-button
            >
            <a-button size="small" @click.stop="openDrawer(item)"
              >编辑</a-button
            >
            <a-button
              size="small"
              v-if="item.status === 'PENDING'"
              @click.stop="
                item.status = 'CLOSED';
                message.success('已关闭');
              "
              >关闭</a-button
            >
            <a-button size="small" danger @click.stop="openDeleteDemandModal(item)">删除</a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布/编辑抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="editingItem ? '编辑悬赏' : '发布悬赏'"
      placement="right"
      width="480"
    >
      <a-form layout="vertical">
        <a-form-item label="需求标题" required>
          <a-input
            v-model:value="form.title"
            placeholder="请输入需求标题"
            :maxlength="80"
            show-count
          />
        </a-form-item>
        <a-form-item label="需求描述" required>
          <a-textarea
            v-model:value="form.desc"
            :rows="4"
            placeholder="详细描述需求内容、技术要求、交付标准等"
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="需求分类" required>
          <a-select
            v-model:value="form.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <a-select-option v-for="c in categories" :key="c" :value="c">{{
              c
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="悬赏金额（元）" required>
          <div style="display: flex; gap: 8px; align-items: center">
            <a-input-number
              v-model:value="form.budgetMin"
              :min="100"
              :max="999999"
              style="flex: 1"
              placeholder="最小金额"
            />
            <span>~</span>
            <a-input-number
              v-model:value="form.budgetMax"
              :min="100"
              :max="999999"
              style="flex: 1"
              placeholder="最大金额"
            />
          </div>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发布时间">
              <a-date-picker
                v-model:value="form.publishDate"
                style="width: 100%"
                placeholder="请选择发布日期"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="截止时间">
              <a-date-picker
                v-model:value="form.deadline"
                style="width: 100%"
                placeholder="请选择截止日期"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="紧急程度">
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <a-tag
              v-for="u in urgencyOptions"
              :key="u"
              :color="form.urgency === u ? urgencyColorMap[u] : 'default'"
              style="cursor: pointer; font-size: 13px; padding: 4px 12px"
              @click="form.urgency = u"
              >{{ u }}</a-tag
            >
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button
            type="primary"
            style="background: #52c41a; border-color: #52c41a"
            @click="handleSubmit"
          >
            {{ editingItem ? "保存修改" : "发布悬赏" }}
          </a-button>
        </div>
      </template>
    </a-drawer>

    <!-- 删除需求确认弹窗 -->
    <a-modal
      v-model:open="deleteDemandModalVisible"
      :footer="null"
      :centered="true"
      width="360"
    >
      <div class="modal-confirm">
        <div class="modal-confirm-icon">
          <ExclamationCircleFilled />
        </div>
        <p class="modal-confirm-text">确定删除需求「{{ deletingDemandTitle }}」？</p>
        <p class="modal-confirm-sub">删除后无法恢复</p>
        <div class="modal-confirm-actions">
          <a-button size="small" @click="deleteDemandModalVisible = false">取消</a-button>
          <a-button size="small" danger type="primary" :loading="deleteLoading" @click="confirmDeleteDemand">删除</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { PlusOutlined, TrophyOutlined, ExclamationCircleFilled } from "@ant-design/icons-vue";

const route = useRoute();

const statusFilter = ref("all");
const searchKeyword = ref("");
const drawerVisible = ref(false);
const editingItem = ref(null);
const deleteDemandModalVisible = ref(false);
const deletingDemandTitle = ref("");
const deletingDemandId = ref(null);
const deleteLoading = ref(false);

const categories = [
  "人工智能",
  "Java",
  "Python",
  "Vue/React",
  "移动开发",
  "数据库",
  "运维部署",
  "大数据",
  "其他",
];

const statusMap = {
  PENDING: { badge: "warning", text: "待接单" },
  PROCESSING: { badge: "processing", text: "进行中" },
  COMPLETED: { badge: "success", text: "已完成" },
  CLOSED: { badge: "error", text: "已关闭" },
  CANCELLED: { badge: "default", text: "已取消" },
};

const statCards = ref([
  { label: "发布总数", value: 4, color: "#1890ff" },
  { label: "待接单", value: 2, color: "#faad14" },
  { label: "进行中", value: 1, color: "#1890ff" },
  { label: "已完成", value: 1, color: "#52c41a" },
]);

const demands = ref([
  {
    id: 1,
    title: "MiniMax-M2.1 智能客服系统开发",
    desc: "需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别、知识库接入",
    budgetMin: 3000,
    budgetMax: 5000,
    category: "人工智能",
    urgency: "紧急",
    status: "PENDING",
    applyCount: 12,
    publishTime: "2026-03-03",
    deadline: "2026-03-31",
    auditStatus: "approved",
    auditRemark: "-",
  },
  {
    id: 2,
    title: "React Native 跨平台移动端应用开发",
    desc: "开发一款电商类App，需要支持iOS和Android双端，包含商品浏览、购物车、支付功能",
    budgetMin: 10000,
    budgetMax: 15000,
    category: "移动开发",
    urgency: "一般",
    status: "PROCESSING",
    applyCount: 7,
    publishTime: "2026-02-28",
    deadline: "2026-04-15",
    auditStatus: "approved",
    auditRemark: "-",
  },
  {
    id: 3,
    title: "MySQL 数据库性能优化咨询",
    desc: "现有系统查询慢，需要专业DBA对数据库进行诊断和优化，提供优化报告",
    budgetMin: 1500,
    budgetMax: 2500,
    category: "数据库",
    urgency: "一般",
    status: "COMPLETED",
    applyCount: 5,
    publishTime: "2026-02-10",
    deadline: "2026-02-28",
    auditStatus: "approved",
    auditRemark: "-",
  },
  {
    id: 4,
    title: "Vue3 后台管理系统开发",
    desc: "基于Vue3+Element Plus开发一套通用后台管理系统，包含权限管理、数据可视化",
    budgetMin: 6000,
    budgetMax: 10000,
    category: "Vue/React",
    urgency: "紧急",
    status: "CLOSED",
    applyCount: 9,
    publishTime: "2026-03-01",
    deadline: "2026-04-01",
    auditStatus: "rejected",
    auditRemark: "需求描述不够详细，请补充具体的功能模块和技术要求",
  },
]);

const form = reactive({
  title: "",
  desc: "",
  category: undefined,
  budgetMin: null,
  budgetMax: null,
  publishDate: null,
  deadline: null,
  urgency: "一般",
});
const urgencyOptions = ["紧急", "一般", "常规"];
const urgencyColorMap = { 紧急: "orange", 一般: "blue", 常规: "default" };

const filteredList = computed(() => {
  let list = demands.value;
  if (statusFilter.value !== "all")
    list = list.filter((d) => d.status === statusFilter.value);
  if (searchKeyword.value.trim())
    list = list.filter((d) => d.title.includes(searchKeyword.value.trim()));
  return list;
});

const openDrawer = (item = null) => {
  editingItem.value = item;
  if (item)
    Object.assign(form, {
      title: item.title,
      desc: item.desc,
      category: item.category,
      budgetMin: item.budgetMin,
      budgetMax: item.budgetMax,
      publishDate: item.publishTime,
      deadline: item.deadline,
      urgency: item.urgency,
    });
  else
    Object.assign(form, {
      title: "",
      desc: "",
      category: undefined,
      budgetMin: null,
      budgetMax: null,
      publishDate: null,
      deadline: null,
      urgency: "一般",
    });
  drawerVisible.value = true;
};

const handleSubmit = () => {
  if (!form.title.trim()) {
    message.warning("请输入需求标题");
    return;
  }
  if (!form.category) {
    message.warning("请选择需求分类");
    return;
  }
  if (!form.budgetMin || !form.budgetMax) {
    message.warning("请输入悬赏金额区间");
    return;
  }
  if (form.budgetMin > form.budgetMax) {
    message.warning("最小金额不能大于最大金额");
    return;
  }
  if (editingItem.value) {
    const idx = demands.value.findIndex((d) => d.id === editingItem.value.id);
    if (idx !== -1)
      Object.assign(demands.value[idx], {
        title: form.title,
        desc: form.desc,
        category: form.category,
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        urgency: form.urgency,
        publishTime: form.publishDate || demands.value[idx].publishTime,
        deadline: form.deadline || demands.value[idx].deadline,
      });
    message.success("修改已保存");
  } else {
    demands.value.unshift({
      id: Date.now(),
      title: form.title,
      desc: form.desc,
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      category: form.category,
      urgency: form.urgency,
      status: "PENDING",
      applyCount: 0,
      publishTime: form.publishDate || new Date().toISOString().slice(0, 10),
      deadline: form.deadline || "待定",
    });
    statCards.value[0].value++;
    statCards.value[1].value++;
    message.success("悬赏发布成功");
  }
  drawerVisible.value = false;
};

const openDeleteDemandModal = (item) => {
  deletingDemandId.value = item.id;
  deletingDemandTitle.value = item.title;
  deleteDemandModalVisible.value = true;
};
const confirmDeleteDemand = () => {
  deleteLoading.value = true;
  setTimeout(() => {
    demands.value = demands.value.filter((d) => d.id !== deletingDemandId.value);
    statCards.value[0].value = demands.value.length;
    deleteLoading.value = false;
    deleteDemandModalVisible.value = false;
    message.success("已删除");
  }, 400);
};

const deleteItem = (id) => {
  demands.value = demands.value.filter((d) => d.id !== id);
  statCards.value[0].value = demands.value.length;
  message.success("已删除");
};

const getUrgencyColor = (urgency) => {
  const colorMap = { 紧急: "orange", 一般: "blue", 常规: "default" };
  return colorMap[urgency] || "default";
};

onMounted(() => {
  if (route.query.action === "create") openDrawer();
});
</script>

<style scoped>
.my-demands-page {
  width: 100%;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  text-align: center;
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 12px;
  color: #999;
}

.filter-bar {
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.status-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}
.status-tabs :deep(.ant-tabs-nav::before) {
  border: none;
}
.status-tabs :deep(.ant-tabs-nav-operations) {
  display: none !important;
}

.demand-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.empty-state {
  padding: 60px;
  text-align: center;
  color: #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.demand-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.demand-item:last-child {
  border-bottom: none;
}
.demand-main {
  flex: 1;
  min-width: 0;
}
.demand-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  cursor: pointer;
}
.demand-title:hover {
  color: #1890ff;
}
.demand-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.demand-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.demand-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #bbb;
}
.demand-meta strong {
  color: #fa8c16;
}

.demand-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}
.demand-budget {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}
.demand-actions {
  display: flex;
  gap: 6px;
}

.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.modal-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px 4px;
  text-align: center;
}

.modal-confirm-icon {
  font-size: 36px;
  color: #faad14;
  margin-bottom: 10px;
}

.modal-confirm-text {
  font-size: 15px;
  color: #333;
  margin: 0 0 4px;
}

.modal-confirm-sub {
  font-size: 13px;
  color: #999;
  margin: 0 0 16px;
}

.modal-confirm-actions {
  display: flex;
  gap: 8px;
}
</style>
