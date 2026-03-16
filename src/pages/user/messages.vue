<template>
  <div class="messages-page">
    <h2 class="page-title">消息中心</h2>

    <div class="msg-toolbar">
      <a-tabs v-model:activeKey="tabKey" size="small" class="msg-tabs">
        <a-tab-pane key="ALL" tab="全部" />
        <a-tab-pane key="UNREAD" tab="未读" />
      </a-tabs>
      <div class="toolbar-actions">
        <a-button v-if="!batchMode" size="small" @click="batchMode = true">
          <template #icon><DeleteOutlined /></template>
          批量删除
        </a-button>
        <a-button v-if="!batchMode" size="small" @click="markAllRead">
          <template #icon><CheckOutlined /></template>
          全部标记已读
        </a-button>
        <a-button v-if="batchMode" size="small" @click="batchMode = false; selectedIds = []">取消</a-button>
      </div>
    </div>

    <div class="msg-list">
      <div v-if="filteredMessages.length === 0" class="empty-state">
        <BellOutlined class="empty-icon" />
        <p>暂无消息</p>
      </div>
      <div
        v-for="msg in pagedMessages"
        :key="msg.id"
        :class="['msg-item', { unread: !msg.readStatus }]"
        @click="!batchMode && goDetail(msg)"
      >
        <a-checkbox
          v-if="batchMode"
          :checked="selectedIds.includes(msg.id)"
          @change="toggleSelect(msg.id)"
          @click.stop
          class="msg-checkbox"
        />
        <div class="msg-icon-wrap">
          <div class="msg-type-icon" :style="{ background: typeConfig[msg.type].bg }">
            <component :is="typeConfig[msg.type].icon" style="color: #fff; font-size: 16px" />
          </div>
          <span v-if="!msg.readStatus" class="unread-dot"></span>
        </div>
        <div class="msg-content">
          <div class="msg-title-row">
            <span class="msg-title">{{ msg.title }}</span>
            <a-tag size="small" :color="typeConfig[msg.type].tagColor">{{ typeConfig[msg.type].label }}</a-tag>
          </div>
          <div class="msg-summary">{{ msg.content }}</div>
          <div class="msg-time">{{ msg.createTime }}</div>
        </div>
        <div v-if="!batchMode" class="msg-actions">
          <a-button v-if="!msg.readStatus" type="link" size="small" @click.stop="markRead(msg)">标记已读</a-button>
          <a-button type="link" size="small" danger @click.stop="deleteMsg(msg.id)">删除</a-button>
        </div>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="batchMode" class="batch-bar">
      <span>已选择 {{ selectedIds.length }} 条</span>
      <a-button type="primary" size="small" danger :disabled="selectedIds.length === 0" @click="batchDelete">
        删除选中
      </a-button>
    </div>

    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="filteredMessages.length"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
import {
  LikeOutlined,
  ShoppingCartOutlined,
  NotificationOutlined,
  BellOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const tabKey = ref("ALL");
const batchMode = ref(false);
const selectedIds = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

const typeConfig = {
  INTERACTION: {
    icon: LikeOutlined,
    label: "互动提醒",
    tagColor: "blue",
    bg: "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)",
  },
  ORDER: {
    icon: ShoppingCartOutlined,
    label: "订单变更",
    tagColor: "orange",
    bg: "linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)",
  },
  ANNOUNCEMENT: {
    icon: NotificationOutlined,
    label: "系统公告",
    tagColor: "green",
    bg: "linear-gradient(135deg, #52c41a 0%, #95de64 100%)",
  },
};

// 模拟数据
const messages = ref([
  {
    id: 1001,
    type: "INTERACTION",
    title: "张三点赞了您的文章",
    content: '用户"张三"点赞了您的文章《Vue3最佳实践》',
    readStatus: false,
    createTime: "2026-03-16 14:30:00",
    bizType: "POST",
    bizId: 2001,
  },
  {
    id: 1002,
    type: "INTERACTION",
    title: "李明关注了您",
    content: '用户"李明"关注了您，快去看看他的主页吧',
    readStatus: false,
    createTime: "2026-03-16 13:20:00",
    bizType: "USER",
    bizId: 3001,
  },
  {
    id: 1003,
    type: "ORDER",
    title: "订单已接单",
    content: "您的订单 #ORD20260316001 已被服务商接单，请耐心等待交付",
    readStatus: false,
    createTime: "2026-03-16 11:00:00",
    bizType: "ORDER",
    bizId: 10001,
  },
  {
    id: 1004,
    type: "ORDER",
    title: "订单已完成",
    content: "您的订单 #ORD20260314002 已完成交付，请确认验收",
    readStatus: true,
    createTime: "2026-03-15 18:00:00",
    bizType: "ORDER",
    bizId: 10002,
  },
  {
    id: 1005,
    type: "ANNOUNCEMENT",
    title: "3月创作激励计划开启",
    content: "优质文章可获得额外流量扶持，单篇最高奖励500积分，快来参与吧",
    readStatus: true,
    createTime: "2026-03-15 10:00:00",
    bizType: null,
    bizId: null,
  },
  {
    id: 1006,
    type: "INTERACTION",
    title: "王哈哈评论了您的文章",
    content: '用户"王哈哈"评论了您的文章《Docker容器化部署实战指南》："写得很详细，收藏了"',
    readStatus: true,
    createTime: "2026-03-14 16:45:00",
    bizType: "POST",
    bizId: 2002,
  },
  {
    id: 1007,
    type: "ORDER",
    title: "需求悬赏有新参与者",
    content: '您发布的需求"MiniMax智能客服系统开发"有新的服务商参与，快去查看方案',
    readStatus: false,
    createTime: "2026-03-14 14:00:00",
    bizType: "DEMAND",
    bizId: 1,
  },
  {
    id: 1008,
    type: "ANNOUNCEMENT",
    title: "平台维护通知",
    content: "平台将于3月20日凌晨2:00-4:00进行系统维护升级，届时部分功能可能暂时不可用",
    readStatus: true,
    createTime: "2026-03-13 09:00:00",
    bizType: null,
    bizId: null,
  },
  {
    id: 1009,
    type: "INTERACTION",
    title: "您的文章被推荐到首页",
    content: '您的文章《深入解析CPU调度》已被推荐到首页，预计将获得更多曝光',
    readStatus: true,
    createTime: "2026-03-12 16:30:00",
    bizType: "POST",
    bizId: 2003,
  },
  {
    id: 1010,
    type: "ORDER",
    title: "订单待付款提醒",
    content: "您有一笔订单 #ORD20260312003 待付款，请在24小时内完成支付",
    readStatus: false,
    createTime: "2026-03-12 10:00:00",
    bizType: "ORDER",
    bizId: 10003,
  },
  {
    id: 1011,
    type: "INTERACTION",
    title: "收藏达到里程碑",
    content: "您的服务「Java大厂面试课」已被收藏超过100次，继续加油",
    readStatus: true,
    createTime: "2026-03-11 15:00:00",
    bizType: "SERVICE",
    bizId: 1,
  },
  {
    id: 1012,
    type: "ANNOUNCEMENT",
    title: "新功能上线：需求悬赏",
    content: "平台全新上线需求悬赏功能，发布需求即可吸引优质服务商为您解决问题",
    readStatus: true,
    createTime: "2026-03-10 09:00:00",
    bizType: null,
    bizId: null,
  },
]);

const filteredMessages = computed(() => {
  if (tabKey.value === "UNREAD") {
    return messages.value.filter((m) => !m.readStatus);
  }
  return messages.value;
});

const pagedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredMessages.value.slice(start, start + pageSize.value);
});

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
};

const markRead = (msg) => {
  msg.readStatus = true;
  message.success("已标记为已读");
};

const markAllRead = () => {
  Modal.confirm({
    title: "确认操作",
    content: "确定将所有消息标记为已读吗？",
    onOk() {
      messages.value.forEach((m) => (m.readStatus = true));
      message.success("已全部标记为已读");
    },
  });
};

const deleteMsg = (id) => {
  messages.value = messages.value.filter((m) => m.id !== id);
  message.success("已删除");
};

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const batchDelete = () => {
  Modal.confirm({
    title: "确认删除",
    content: `确定删除选中的 ${selectedIds.value.length} 条消息吗？`,
    onOk() {
      messages.value = messages.value.filter(
        (m) => !selectedIds.value.includes(m.id)
      );
      selectedIds.value = [];
      batchMode.value = false;
      message.success("已删除");
    },
  });
};

const goDetail = (msg) => {
  router.push({ name: "MessageDetail", params: { id: msg.id } });
};
</script>

<style scoped>
.messages-page { width: 100%; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 16px; }

.msg-toolbar {
  background: #fff; border-radius: 8px; padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.msg-tabs { flex: 1; }
.msg-tabs :deep(.ant-tabs-nav) { margin-bottom: 0; }
.toolbar-actions { display: flex; gap: 8px; flex-shrink: 0; }

.msg-list { display: flex; flex-direction: column; gap: 8px; }

.msg-item {
  background: #fff; border-radius: 8px; padding: 16px 20px;
  display: flex; align-items: center; gap: 14px;
  cursor: pointer; transition: all 0.2s;
  border: 1px solid transparent;
}
.msg-item:hover { border-color: #e6f7ff; background: #fafafa; }
.msg-item.unread { border-left: 3px solid #1890ff; }

.msg-checkbox { flex-shrink: 0; }

.msg-icon-wrap { position: relative; flex-shrink: 0; }
.msg-type-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.unread-dot {
  position: absolute; top: -2px; right: -2px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #ff4d4f; border: 1px solid #fff;
}

.msg-content { flex: 1; min-width: 0; }
.msg-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.msg-title { font-size: 14px; font-weight: 600; color: #333; }
.msg-summary {
  font-size: 13px; color: #999; margin-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.msg-time { font-size: 12px; color: #bbb; }

.msg-actions { display: flex; gap: 4px; flex-shrink: 0; }

.batch-bar {
  background: #fff; border-radius: 8px; padding: 12px 20px;
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px; border: 1px solid #f0f0f0;
}

.empty-state { background: #fafafa; border-radius: 8px; padding: 60px; text-align: center; color: #ccc; }
.empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

.pagination-wrapper { display: flex; justify-content: flex-end; padding: 20px 0; }
</style>
