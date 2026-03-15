<template>
  <div class="messages-page">
    <div class="msg-layout">
      <!-- 左侧会话列表 -->
      <div class="msg-sidebar">
        <div class="msg-sidebar-header">
          <a-input-search v-model:value="searchText" placeholder="搜索联系人" size="small" allow-clear />
        </div>
        <a-tabs v-model:activeKey="tabKey" size="small" class="msg-tabs" centered>
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane key="system" tab="系统通知" />
          <a-tab-pane key="order" tab="订单消息" />
          <a-tab-pane key="chat" tab="私信" />
        </a-tabs>
        <div class="conversation-list">
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            :class="['conversation-item', { active: currentConv?.id === conv.id }]"
            @click="selectConversation(conv)"
          >
            <a-badge :count="conv.unread" :offset="[-4, 4]" size="small">
              <a-avatar v-if="conv.type === 'system'" :size="40" :style="{ backgroundColor: conv.avatarColor }">
                <template #icon><BellOutlined /></template>
              </a-avatar>
              <a-avatar v-else-if="conv.type === 'order'" :size="40" :style="{ backgroundColor: conv.avatarColor }">
                <template #icon><ShoppingCartOutlined /></template>
              </a-avatar>
              <a-avatar v-else :size="40" :style="{ backgroundColor: conv.avatarColor }">{{ conv.name[0] }}</a-avatar>
            </a-badge>
            <div class="conv-info">
              <div class="conv-top">
                <span class="conv-name">{{ conv.name }}</span>
                <span class="conv-time">{{ conv.lastTime }}</span>
              </div>
              <div class="conv-last">{{ conv.lastMsg }}</div>
            </div>
          </div>
          <div v-if="filteredConversations.length === 0" class="empty-conv">暂无消息</div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="msg-main">
        <template v-if="currentConv">
          <div class="msg-main-header">
            <span class="msg-main-title">{{ currentConv.name }}</span>
            <a-tag v-if="currentConv.type === 'system'" color="blue">系统</a-tag>
            <a-tag v-else-if="currentConv.type === 'order'" color="orange">订单</a-tag>
          </div>

          <!-- 消息列表 -->
          <div class="msg-list" ref="msgListRef">
            <div
              v-for="msg in currentMessages"
              :key="msg.id"
              :class="['msg-item', { 'msg-self': msg.fromSelf }]"
            >
              <!-- 系统通知样式 -->
              <div v-if="msg.msgType === 'system'" class="msg-system-notice">
                <BellOutlined class="notice-icon" />
                <div class="notice-content">
                  <div class="notice-title">{{ msg.title }}</div>
                  <div class="notice-text">{{ msg.content }}</div>
                  <div class="notice-time">{{ msg.time }}</div>
                </div>
              </div>

              <!-- 订单消息样式 -->
              <div v-else-if="msg.msgType === 'order'" class="msg-order-card">
                <div class="order-card-header">
                  <ShoppingCartOutlined />
                  <span>{{ msg.title }}</span>
                  <a-tag :color="msg.statusColor" size="small">{{ msg.status }}</a-tag>
                </div>
                <div class="order-card-body">{{ msg.content }}</div>
                <div class="order-card-footer">
                  <span class="order-card-time">{{ msg.time }}</span>
                  <a-button v-if="msg.actionText" type="link" size="small">{{ msg.actionText }}</a-button>
                </div>
              </div>

              <!-- 普通聊天消息 -->
              <template v-else>
                <a-avatar
                  v-if="!msg.fromSelf"
                  :size="36"
                  :style="{ backgroundColor: currentConv.avatarColor, flexShrink: 0 }"
                >{{ currentConv.name[0] }}</a-avatar>
                <div class="msg-bubble-wrap">
                  <div class="msg-bubble">
                    <img v-if="msg.image" :src="msg.image" class="msg-image" />
                    <span v-else>{{ msg.content }}</span>
                  </div>
                  <div class="msg-time">{{ msg.time }}</div>
                </div>
                <a-avatar
                  v-if="msg.fromSelf"
                  :size="36"
                  style="background-color: #52c41a; flex-shrink: 0"
                >我</a-avatar>
              </template>
            </div>
          </div>

          <!-- 输入区域 -->
          <div v-if="currentConv.type === 'chat'" class="msg-input-area">
            <div class="msg-toolbar">
              <SmileOutlined class="toolbar-icon" title="表情" />
              <PictureOutlined class="toolbar-icon" title="图片" @click="imageInputRef?.click()" />
              <FolderOutlined class="toolbar-icon" title="文件" />
            </div>
            <div class="msg-input-wrap">
              <a-textarea
                v-model:value="inputText"
                :rows="3"
                placeholder="输入消息，按 Enter 发送"
                :auto-size="false"
                @keydown.enter.exact.prevent="sendMessage"
              />
            </div>
            <div class="msg-send-row">
              <span class="send-hint">Enter 发送，Shift+Enter 换行</span>
              <a-button type="primary" size="small" @click="sendMessage" :disabled="!inputText.trim()">发送</a-button>
            </div>
            <input ref="imageInputRef" type="file" accept="image/*" style="display:none" @change="onImageSelect" />
          </div>
        </template>

        <!-- 未选择会话 -->
        <div v-else class="msg-empty">
          <MessageOutlined style="font-size: 48px; color: #d9d9d9" />
          <p>选择一个会话开始聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import {
  BellOutlined, ShoppingCartOutlined, SmileOutlined,
  PictureOutlined, FolderOutlined, MessageOutlined
} from '@ant-design/icons-vue'

const searchText = ref('')
const tabKey = ref('all')
const inputText = ref('')
const msgListRef = ref(null)
const imageInputRef = ref(null)
const currentConv = ref(null)

// 会话列表
const conversations = ref([
  {
    id: 1, type: 'system', name: '系统通知', avatarColor: '#1890ff',
    lastMsg: '您的服务"Java面试辅导"已通过审核', lastTime: '10:30', unread: 3
  },
  {
    id: 2, type: 'order', name: '订单助手', avatarColor: '#fa8c16',
    lastMsg: '您有一笔新订单待确认', lastTime: '09:15', unread: 1
  },
  {
    id: 3, type: 'chat', name: '李明', avatarColor: '#52c41a',
    lastMsg: '好的，我看一下需求文档', lastTime: '昨天', unread: 2
  },
  {
    id: 4, type: 'chat', name: '王哈哈', avatarColor: '#722ed1',
    lastMsg: '项目进度怎么样了？', lastTime: '昨天', unread: 0
  },
  {
    id: 5, type: 'system', name: '审核通知', avatarColor: '#13c2c2',
    lastMsg: '您的文章"深入解析CPU调度"审核已通过', lastTime: '03-12', unread: 0
  },
  {
    id: 6, type: 'order', name: '需求订单', avatarColor: '#eb2f96',
    lastMsg: '需求"AI大模型开发"已有服务商参与', lastTime: '03-11', unread: 0
  },
  {
    id: 7, type: 'chat', name: '张工程师', avatarColor: '#f5222d',
    lastMsg: '技术方案已经发你邮箱了', lastTime: '03-10', unread: 0
  },
  {
    id: 8, type: 'chat', name: '向前开', avatarColor: '#2f54eb',
    lastMsg: '收到，明天开始对接', lastTime: '03-09', unread: 0
  }
])

// 消息数据（按会话ID存储）
const messagesMap = ref({
  1: [
    { id: 1, msgType: 'system', title: '服务审核通过', content: '您发布的服务"Java大厂面试辅导"已通过平台审核，现已上架服务市场。', time: '2026-03-15 09:00' },
    { id: 2, msgType: 'system', title: '新增粉丝', content: '用户"王哈哈"关注了您，快去看看吧。', time: '2026-03-15 09:45' },
    { id: 3, msgType: 'system', title: '收藏提醒', content: '您的服务"Python数据分析实战"被收藏了 5 次，持续优化可以获得更多曝光。', time: '2026-03-15 10:30' }
  ],
  2: [
    { id: 1, msgType: 'order', title: '新订单通知', content: '用户"李明"购买了您的服务"Java大厂面试辅导"，请尽快确认订单。', status: '待确认', statusColor: 'orange', actionText: '查看订单', time: '2026-03-15 08:30' },
    { id: 2, msgType: 'order', title: '订单完成', content: '订单 #20260314001 已完成，买家已确认收货。收入 ¥399 已到账。', status: '已完成', statusColor: 'green', time: '2026-03-14 18:00' },
    { id: 3, msgType: 'order', title: '订单待确认', content: '您有一笔新的需求悬赏订单待确认，需求："AI智能客服系统开发"。', status: '待确认', statusColor: 'orange', actionText: '查看详情', time: '2026-03-15 09:15' }
  ],
  3: [
    { id: 1, fromSelf: false, content: '你好，我看到你发布的AI大模型开发需求', time: '09:00' },
    { id: 2, fromSelf: true, content: '你好，是的，你对这个需求感兴趣吗？', time: '09:02' },
    { id: 3, fromSelf: false, content: '是的，我有相关的开发经验，之前做过类似的项目', time: '09:05' },
    { id: 4, fromSelf: true, content: '太好了，能简单介绍一下你之前的项目经验吗？', time: '09:08' },
    { id: 5, fromSelf: false, content: '我之前在某大厂做过智能客服系统，使用的是GPT-4的API，支持多轮对话和意图识别', time: '09:12' },
    { id: 6, fromSelf: true, content: '听起来很不错，你看一下我的需求文档，看看是否能满足', time: '09:15' },
    { id: 7, fromSelf: false, content: '好的，我看一下需求文档', time: '09:20' }
  ],
  4: [
    { id: 1, fromSelf: false, content: '最近在忙什么项目？', time: '昨天 14:00' },
    { id: 2, fromSelf: true, content: '在做一个技术服务平台，快上线了', time: '昨天 14:05' },
    { id: 3, fromSelf: false, content: '项目进度怎么样了？', time: '昨天 14:10' }
  ],
  5: [
    { id: 1, msgType: 'system', title: '文章审核通过', content: '您的文章"深入解析CPU调度：操作系统的核心资源分配机制"已通过审核，已发布到技术论坛。', time: '2026-03-12 15:00' },
    { id: 2, msgType: 'system', title: '文章被推荐', content: '您的文章已被推荐到首页，预计将获得更多曝光。', time: '2026-03-12 16:30' }
  ],
  6: [
    { id: 1, msgType: 'order', title: '需求参与通知', content: '服务商"张工程师"已参与您的需求"AI大模型开发"，请查看其方案。', status: '进行中', statusColor: 'blue', actionText: '查看方案', time: '2026-03-11 10:00' },
    { id: 2, msgType: 'order', title: '需求参与通知', content: '服务商"向前开"已参与您的需求"AI大模型开发"。', status: '进行中', statusColor: 'blue', actionText: '查看方案', time: '2026-03-11 14:00' }
  ],
  7: [
    { id: 1, fromSelf: false, content: '你好，关于AI大模型的需求我很感兴趣', time: '03-10 09:00' },
    { id: 2, fromSelf: true, content: '好的，你可以先看看需求详情', time: '03-10 09:10' },
    { id: 3, fromSelf: false, content: '技术方案已经发你邮箱了', time: '03-10 10:30' }
  ],
  8: [
    { id: 1, fromSelf: true, content: '你好，看到你参与了我的需求', time: '03-09 11:00' },
    { id: 2, fromSelf: false, content: '是的，我对这个项目很有信心', time: '03-09 11:15' },
    { id: 3, fromSelf: false, content: '收到，明天开始对接', time: '03-09 15:00' }
  ]
})

const filteredConversations = computed(() => {
  let list = conversations.value
  if (tabKey.value !== 'all') {
    list = list.filter(c => c.type === tabKey.value)
  }
  if (searchText.value.trim()) {
    const kw = searchText.value.trim().toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(kw) || c.lastMsg.toLowerCase().includes(kw))
  }
  return list
})

const currentMessages = computed(() => {
  if (!currentConv.value) return []
  return messagesMap.value[currentConv.value.id] || []
})

const selectConversation = (conv) => {
  currentConv.value = conv
  conv.unread = 0
  nextTick(() => scrollToBottom())
}

const scrollToBottom = () => {
  if (msgListRef.value) {
    msgListRef.value.scrollTop = msgListRef.value.scrollHeight
  }
}

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text || !currentConv.value) return
  const convId = currentConv.value.id
  if (!messagesMap.value[convId]) messagesMap.value[convId] = []
  const newMsg = {
    id: Date.now(),
    fromSelf: true,
    content: text,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  messagesMap.value[convId].push(newMsg)
  currentConv.value.lastMsg = text
  currentConv.value.lastTime = newMsg.time
  inputText.value = ''
  nextTick(() => scrollToBottom())

  // 模拟自动回复
  setTimeout(() => {
    const replies = [
      '好的，我知道了',
      '收到，稍后回复你',
      '没问题，我来处理',
      '了解，我看看',
      '可以的，我们继续沟通'
    ]
    const reply = {
      id: Date.now() + 1,
      fromSelf: false,
      content: replies[Math.floor(Math.random() * replies.length)],
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messagesMap.value[convId].push(reply)
    currentConv.value.lastMsg = reply.content
    currentConv.value.lastTime = reply.time
    nextTick(() => scrollToBottom())
  }, 1000 + Math.random() * 1500)
}

const onImageSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file || !currentConv.value) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const convId = currentConv.value.id
    if (!messagesMap.value[convId]) messagesMap.value[convId] = []
    messagesMap.value[convId].push({
      id: Date.now(),
      fromSelf: true,
      image: ev.target.result,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    currentConv.value.lastMsg = '[图片]'
    currentConv.value.lastTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    nextTick(() => scrollToBottom())
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// 默认选中第一个有未读的会话
const firstUnread = conversations.value.find(c => c.unread > 0)
if (firstUnread) selectConversation(firstUnread)
</script>

<style scoped>
.messages-page { width: 100%; height: calc(100vh - 120px); }
.msg-layout { display: flex; height: 100%; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #f0f0f0; }

/* 左侧会话列表 */
.msg-sidebar { width: 280px; border-right: 1px solid #f0f0f0; display: flex; flex-direction: column; flex-shrink: 0; }
.msg-sidebar-header { padding: 12px; border-bottom: 1px solid #f0f0f0; }
.msg-tabs { flex-shrink: 0; }
.msg-tabs :deep(.ant-tabs-nav) { margin: 0; padding: 0 8px; }
.msg-tabs :deep(.ant-tabs-tab) { padding: 8px 6px; font-size: 13px; }

.conversation-list { flex: 1; overflow-y: auto; }
.conversation-item {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #fafafa;
}
.conversation-item:hover { background: #f5f5f5; }
.conversation-item.active { background: #e6f7ff; }
.conv-info { flex: 1; min-width: 0; }
.conv-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.conv-name { font-size: 14px; font-weight: 500; color: #333; }
.conv-time { font-size: 11px; color: #bbb; flex-shrink: 0; }
.conv-last { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-conv { padding: 40px; text-align: center; color: #ccc; font-size: 13px; }

/* 右侧聊天区域 */
.msg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.msg-main-header {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}
.msg-main-title { font-size: 15px; font-weight: 600; color: #333; }

.msg-list { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }

/* 消息项 */
.msg-item { display: flex; gap: 10px; align-items: flex-start; }
.msg-item.msg-self { flex-direction: row-reverse; }

.msg-bubble-wrap { max-width: 60%; }
.msg-bubble {
  padding: 10px 14px; border-radius: 8px; font-size: 14px; line-height: 1.6;
  background: #f5f5f5; color: #333; word-break: break-word;
}
.msg-self .msg-bubble { background: #52c41a; color: #fff; }
.msg-time { font-size: 11px; color: #bbb; margin-top: 4px; }
.msg-self .msg-time { text-align: right; }
.msg-image { max-width: 200px; max-height: 200px; border-radius: 6px; cursor: pointer; }

/* 系统通知 */
.msg-system-notice {
  display: flex; gap: 12px; padding: 14px 16px; background: #f6ffed;
  border: 1px solid #b7eb8f; border-radius: 8px; width: 100%;
}
.notice-icon { font-size: 20px; color: #52c41a; margin-top: 2px; flex-shrink: 0; }
.notice-content { flex: 1; }
.notice-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; }
.notice-text { font-size: 13px; color: #666; line-height: 1.5; }
.notice-time { font-size: 11px; color: #bbb; margin-top: 6px; }

/* 订单消息 */
.msg-order-card {
  width: 100%; border: 1px solid #ffe7ba; border-radius: 8px;
  background: #fffbe6; overflow: hidden;
}
.order-card-header {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  border-bottom: 1px solid #ffe7ba; font-size: 14px; font-weight: 500; color: #333;
}
.order-card-body { padding: 12px 14px; font-size: 13px; color: #666; line-height: 1.5; }
.order-card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 14px; border-top: 1px solid #ffe7ba;
}
.order-card-time { font-size: 11px; color: #bbb; }

/* 输入区域 */
.msg-input-area { border-top: 1px solid #f0f0f0; flex-shrink: 0; }
.msg-toolbar { display: flex; gap: 16px; padding: 8px 16px; border-bottom: 1px solid #f5f5f5; }
.toolbar-icon { font-size: 18px; color: #999; cursor: pointer; transition: color 0.2s; }
.toolbar-icon:hover { color: #333; }
.msg-input-wrap { padding: 0; }
.msg-input-wrap :deep(.ant-input) { border: none; resize: none; box-shadow: none; padding: 10px 16px; }
.msg-input-wrap :deep(.ant-input:focus) { box-shadow: none; }
.msg-send-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 16px 10px;
}
.send-hint { font-size: 11px; color: #ccc; }

/* 空状态 */
.msg-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; color: #ccc; font-size: 14px;
}
</style>
