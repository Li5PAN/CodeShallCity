<template>
  <div class="page">
    <!-- 顶部操作栏 -->
    <div class="notice-header">
      <a-tabs
        v-model:activeKey="noticeStatusTab"
        size="small"
        class="notice-tabs"
      >
        <a-tab-pane key="all" tab="全部公告" />
        <a-tab-pane key="active" tab="生效中" />
        <a-tab-pane key="expired" tab="已过期" />
      </a-tabs>
      <div class="notice-actions">
        <a-input-search
          v-model:value="noticeSearch"
          placeholder="搜索公告标题"
          style="width: 200px"
          size="small"
        />
        <a-button type="primary" size="small" @click="openNoticeForm(null)">
          + 新增公告
        </a-button>
      </div>
    </div>

    <!-- 公告表格 -->
    <a-table
      :columns="noticeColumns"
      :data-source="filteredNotices"
      :pagination="noticePagination"
      :row-key="(record) => record.id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <div class="notice-title-cell">
            <div class="notice-title-text">{{ record.title }}</div>
            <div class="notice-content-preview">{{ record.content }}</div>
          </div>
        </template>

        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.active ? 'green' : 'default'" size="small">
            {{ record.active ? "生效中" : "已过期" }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'action'">
          <div class="action-buttons">
            <a-button type="link" size="small" @click="openNoticeForm(record)"
              >编辑</a-button
            >
            <a-popconfirm
              title="确认删除该公告？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="deleteNotice(record)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
            <a-button
              type="link"
              size="small"
              danger
              @click="Modal.confirm({ title: '确认推送', content: '确定要推送该公告吗？', okText: '推送', cancelText: '取消', onOk() { const n = noticeList.find(x => x.id === record.id); if (n) n.pushStatus = true; message.success('推送成功'); } })"
            >推送</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 公告表单弹窗 -->
    <a-modal
      v-model:open="noticeForm.show"
      :title="noticeForm.id ? '编辑公告' : '新增公告'"
      @ok="submitNotice"
      ok-text="保存"
      cancel-text="取消"
      width="600px"
    >
      <a-form layout="vertical" style="margin-top: 16px">
        <a-form-item label="公告标题" required>
          <a-input
            v-model:value="noticeForm.title"
            placeholder="请输入公告标题"
            :maxlength="100"
            show-count
          />
        </a-form-item>
        <a-form-item label="推送范围" required>
          <a-select
            v-model:value="noticeForm.noticeType"
            placeholder="请选择推送范围"
            style="width: 100%"
          >
            <a-select-option value="1">全部用户</a-select-option>
            <a-select-option value="2">普通用户</a-select-option>
            <a-select-option value="3">服务提供者</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="公告内容" required>
          <a-textarea
            v-model:value="noticeForm.content"
            placeholder="请输入公告内容"
            :rows="6"
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="生效时间" required>
          <a-date-picker
            v-model:value="noticeForm.effectAt"
            style="width: 100%"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择生效时间"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch
            v-model:checked="noticeForm.active"
            checked-children="生效中"
            un-checked-children="已过期"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import dayjs from "dayjs";
import { message, Modal } from "ant-design-vue";

const noticeStatusTab = ref("all");
const noticeSearch = ref("");

const noticeColumns = [
  { title: "公告编号", dataIndex: "id", key: "id", width: "10%" },
  { title: "公告标题", key: "title", width: "35%" },
  { title: "状态", key: "status", width: "10%" },
  { title: "创建时间", dataIndex: "publishAt", key: "publishAt", width: "15%" },
  { title: "生效时间", dataIndex: "effectAt", key: "effectAt", width: "15%" },
  { title: "操作", key: "action", width: "15%" },
];

const noticePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const noticeList = ref([
  {
    id: 1,
    title: "建好网站公告：2018-07-01 系统更新维护通知",
    content:
      "为了提升系统性能和用户体验，我们将在2018年7月1日进行系统维护更新...",
    noticeType: "1",
    active: true,
    effectAt: "2026-03-01 09:00:00",
    publishAt: "2026-02-28 17:03:40",
  },
  {
    id: 2,
    title: "平台功能升级公告",
    content: "平台将新增多项功能，包括智能推荐、数据分析等，敬请期待...",
    noticeType: "1",
    active: true,
    effectAt: "2026-03-05 10:00:00",
    publishAt: "2026-03-04 10:20:15",
  },
  {
    id: 3,
    title: "春节放假通知",
    content: "春节期间客服工作时间调整通知，祝大家新春快乐...",
    noticeType: "1",
    active: false,
    effectAt: "2026-01-28 00:00:00",
    publishAt: "2026-01-20 09:30:00",
  },
]);

const noticeForm = reactive({
  show: false,
  id: null,
  title: "",
  noticeType: undefined,
  content: "",
  effectAt: null,
  active: true,
});

const filteredNotices = computed(() => {
  let list = noticeList.value;

  if (noticeStatusTab.value === "active") {
    list = list.filter((n) => n.active);
  } else if (noticeStatusTab.value === "expired") {
    list = list.filter((n) => !n.active);
  }

  if (noticeSearch.value.trim()) {
    const keyword = noticeSearch.value.trim().toLowerCase();
    list = list.filter((n) => n.title.toLowerCase().includes(keyword));
  }

  noticePagination.value.total = list.length;
  return list;
});

const viewNotice = (notice) => {
  message.info(`查看公告详情：${notice.title}`);
};

const toDayjs = (val) => {
  if (!val) return null;
  if (dayjs.isDayjs(val)) return val;
  return dayjs(val);
};

const openNoticeForm = (n) => {
  noticeForm.show = true;
  noticeForm.id = n?.id || null;
  noticeForm.title = n?.title || "";
  noticeForm.noticeType = n?.noticeType || undefined;
  noticeForm.content = n?.content || "";
  noticeForm.effectAt = n?.effectAt ? toDayjs(n.effectAt) : null;
  noticeForm.active = n?.active ?? true;
};

const submitNotice = () => {
  if (!noticeForm.title.trim()) {
    message.warning("请输入公告标题");
    return;
  }
  if (!noticeForm.noticeType) {
    message.warning("请选择推送范围");
    return;
  }
  if (!noticeForm.content.trim()) {
    message.warning("请输入公告内容");
    return;
  }
  if (!noticeForm.effectAt) {
    message.warning("请选择生效时间");
    return;
  }

  if (noticeForm.id) {
    const notice = noticeList.value.find((n) => n.id === noticeForm.id);
    if (notice) {
      notice.title = noticeForm.title;
      notice.noticeType = noticeForm.noticeType;
      notice.content = noticeForm.content;
      notice.effectAt = noticeForm.effectAt.format("YYYY-MM-DD HH:mm:ss");
      notice.active = noticeForm.active;
      message.success("公告已更新");
    }
  } else {
    noticeList.value.unshift({
      id: Date.now(),
      title: noticeForm.title,
      noticeType: noticeForm.noticeType,
      content: noticeForm.content,
      effectAt: noticeForm.effectAt.format("YYYY-MM-DD HH:mm:ss"),
      active: noticeForm.active,
      publishAt: new Date().toLocaleString("zh-CN"),
    });
    message.success("公告已创建");
  }

  noticeForm.show = false;
};

const deleteNotice = (notice) => {
  noticeList.value = noticeList.value.filter((n) => n.id !== notice.id);
  message.success("公告已删除");
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
}

.notice-tabs {
  flex: 1;
}

.notice-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.notice-title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-title-text {
  font-weight: 500;
  color: #1a1a2e;
}

.notice-content-preview {
  font-size: 12px;
  color: #888;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

:deep(.ant-table) {
  border-radius: 8px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}
</style>