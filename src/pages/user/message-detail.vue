<template>
  <div class="message-detail-page">
    <div class="detail-header">
      <a-button type="text" @click="router.back()">
        <template #icon><ArrowLeftOutlined /></template>
        返回
      </a-button>
      <span class="detail-header-title">消息详情</span>
    </div>

    <div class="detail-card">
      <div class="detail-title-row">
        <div class="detail-type-icon" :style="{ background: typeConfig[detail.type]?.bg }">
          <component :is="typeConfig[detail.type]?.icon" style="color: #fff; font-size: 18px" />
        </div>
        <div class="detail-title-info">
          <div class="detail-title">{{ detail.title }}</div>
          <div class="detail-meta">
            <a-tag size="small" :color="typeConfig[detail.type]?.tagColor">{{ typeConfig[detail.type]?.label }}</a-tag>
            <span class="detail-time">{{ detail.createTime }}</span>
          </div>
        </div>
      </div>

      <a-divider style="margin: 16px 0" />

      <div class="detail-body">{{ detail.content }}</div>

      <div v-if="detail.bizType && detail.bizId" class="detail-footer">
        <a-button type="primary" @click="goToBiz">
          查看详情
          <template #icon><ArrowRightOutlined /></template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LikeOutlined,
  ShoppingCartOutlined,
  NotificationOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();

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

// 模拟数据（后续对接 GET /api/message/{id}）
const mockMessages = {
  1001: {
    id: 1001,
    type: "INTERACTION",
    title: "张三点赞了您的文章",
    content:
      '用户"张三"点赞了您的文章《Vue3最佳实践》。您的文章已获得 128 次点赞，继续创作优质内容，吸引更多读者关注。',
    readStatus: true,
    createTime: "2026-03-16 14:30:00",
    bizType: "POST",
    bizId: 2001,
  },
  1002: {
    id: 1002,
    type: "INTERACTION",
    title: "李明关注了您",
    content:
      '用户"李明"关注了您。他是一名全栈开发工程师，对您发布的技术文章和服务很感兴趣。快去看看他的主页吧。',
    readStatus: true,
    createTime: "2026-03-16 13:20:00",
    bizType: "USER",
    bizId: 3001,
  },
  1003: {
    id: 1003,
    type: "ORDER",
    title: "订单已接单",
    content:
      '您的订单 #ORD20260316001 已被服务商"码上拿offer"接单。服务商将在约定时间内开始交付，请耐心等待。如有疑问，可通过订单详情页联系服务商。',
    readStatus: true,
    createTime: "2026-03-16 11:00:00",
    bizType: "ORDER",
    bizId: 10001,
  },
  1004: {
    id: 1004,
    type: "ORDER",
    title: "订单已完成",
    content:
      "您的订单 #ORD20260314002 已完成交付。请在7天内确认验收，逾期将自动确认。如对交付结果有异议，可发起申诉。",
    readStatus: true,
    createTime: "2026-03-15 18:00:00",
    bizType: "ORDER",
    bizId: 10002,
  },
  1005: {
    id: 1005,
    type: "ANNOUNCEMENT",
    title: "3月创作激励计划开启",
    content:
      "亲爱的创作者，3月创作激励计划正式开启！本月发布的优质文章可获得额外流量扶持，单篇最高奖励500积分。活动时间：2026年3月1日至3月31日。参与方式：正常发布技术文章即可自动参与评选，平台将根据文章质量、阅读量、互动数据综合评定。",
    readStatus: true,
    createTime: "2026-03-15 10:00:00",
    bizType: null,
    bizId: null,
  },
  1006: {
    id: 1006,
    type: "INTERACTION",
    title: "王哈哈评论了您的文章",
    content:
      '用户"王哈哈"评论了您的文章《Docker容器化部署实战指南》："写得很详细，收藏了！特别是关于多阶段构建的部分，解决了我一直以来的困惑。"',
    readStatus: true,
    createTime: "2026-03-14 16:45:00",
    bizType: "POST",
    bizId: 2002,
  },
  1007: {
    id: 1007,
    type: "ORDER",
    title: "需求悬赏有新参与者",
    content:
      '您发布的需求"MiniMax智能客服系统开发"有新的服务商参与。目前已有3位服务商提交了方案，请及时查看并选择合适的服务商。',
    readStatus: true,
    createTime: "2026-03-14 14:00:00",
    bizType: "DEMAND",
    bizId: 1,
  },
  1008: {
    id: 1008,
    type: "ANNOUNCEMENT",
    title: "平台维护通知",
    content:
      "尊敬的用户，平台将于2026年3月20日凌晨2:00-4:00进行系统维护升级。届时部分功能可能暂时不可用，包括：订单支付、服务发布、消息推送等。维护完成后所有功能将恢复正常，给您带来的不便敬请谅解。",
    readStatus: true,
    createTime: "2026-03-13 09:00:00",
    bizType: null,
    bizId: null,
  },
  1009: {
    id: 1009,
    type: "INTERACTION",
    title: "您的文章被推荐到首页",
    content:
      '恭喜！您的文章《深入解析CPU调度：操作系统的核心资源分配机制》已被编辑推荐到首页。预计将获得更多曝光和阅读量，继续保持优质创作。',
    readStatus: true,
    createTime: "2026-03-12 16:30:00",
    bizType: "POST",
    bizId: 2003,
  },
  1010: {
    id: 1010,
    type: "ORDER",
    title: "订单待付款提醒",
    content:
      "您有一笔订单 #ORD20260312003 待付款，订单金额 ¥299.00。请在24小时内完成支付，逾期订单将自动取消。",
    readStatus: true,
    createTime: "2026-03-12 10:00:00",
    bizType: "ORDER",
    bizId: 10003,
  },
  1011: {
    id: 1011,
    type: "INTERACTION",
    title: "收藏达到里程碑",
    content:
      '恭喜！您的服务"Java大厂面试课，一套搞定offer"已被收藏超过100次。优质的服务内容正在吸引越来越多的用户关注，继续加油！',
    readStatus: true,
    createTime: "2026-03-11 15:00:00",
    bizType: "SERVICE",
    bizId: 1,
  },
  1012: {
    id: 1012,
    type: "ANNOUNCEMENT",
    title: "新功能上线：需求悬赏",
    content:
      "平台全新上线需求悬赏功能！您可以发布技术需求并设置悬赏金额，吸引优质服务商为您解决问题。支持多种需求类型：人工智能、前端开发、后端开发、移动开发等。立即体验，让专业的人做专业的事。",
    readStatus: true,
    createTime: "2026-03-10 09:00:00",
    bizType: null,
    bizId: null,
  },
};

const detail = ref({});

onMounted(() => {
  const id = Number(route.params.id);
  detail.value = mockMessages[id] || {
    id,
    type: "ANNOUNCEMENT",
    title: "消息不存在",
    content: "该消息可能已被删除",
    readStatus: true,
    createTime: "-",
    bizType: null,
    bizId: null,
  };
  // 自动标记已读（后续对接 POST /api/message/read/{id}）
  detail.value.readStatus = true;
});

const bizRouteMap = {
  ORDER: (bizId) => ({ name: "OrderManage" }),
  DEMAND: (bizId) => ({ name: "DemandDetail", params: { id: bizId } }),
  SERVICE: (bizId) => ({ name: "ServiceDetail", params: { id: bizId } }),
  POST: (bizId) => ({ name: "ForumDetail", params: { id: bizId } }),
};

const goToBiz = () => {
  const { bizType, bizId } = detail.value;
  const routeFn = bizRouteMap[bizType];
  if (routeFn) {
    router.push(routeFn(bizId));
  }
};
</script>

<style scoped>
.message-detail-page { width: 100%; }

.detail-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.detail-header-title { font-size: 18px; font-weight: 700; color: #333; }

.detail-card {
  background: #fff; border-radius: 8px; padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.detail-title-row { display: flex; align-items: center; gap: 14px; }
.detail-type-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.detail-title-info { flex: 1; }
.detail-title { font-size: 17px; font-weight: 700; color: #333; margin-bottom: 6px; }
.detail-meta { display: flex; align-items: center; gap: 10px; }
.detail-time { font-size: 13px; color: #999; }

.detail-body {
  font-size: 14px; color: #555; line-height: 1.8;
  white-space: pre-wrap;
}

.detail-footer {
  margin-top: 24px; padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex; justify-content: flex-end;
}
</style>
