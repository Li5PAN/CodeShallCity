<template>
  <div class="user-management-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">总用户数</span>
          <span class="stat-value">{{ totalUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">普通用户</span>
          <span class="stat-value">{{ normalUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">服务商</span>
          <span class="stat-value">{{ providerUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待审核</span>
          <span class="stat-value pending">{{ pendingAudits }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model:activeKey="activeTab" class="management-tabs">
      <a-tab-pane key="users" tab="用户列表">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-left">
            <a-select v-model:value="roleFilter" style="width: 120px" size="small" placeholder="用户角色">
              <a-select-option value="">全部角色</a-select-option>
              <a-select-option value="user">普通用户</a-select-option>
              <a-select-option value="provider">服务商</a-select-option>
              <a-select-option value="admin">管理员</a-select-option>
            </a-select>
            <a-select v-model:value="statusFilter" style="width: 120px" size="small" placeholder="账号状态">
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="enabled">启用</a-select-option>
              <a-select-option value="disabled">禁用</a-select-option>
            </a-select>
          </div>
          <a-input-search
            v-model:value="userSearch"
            placeholder="搜索用户名或手机号"
            style="width: 240px"
            size="small"
            @search="handleUserSearch"
          />
        </div>

        <!-- 用户列表 -->
        <a-table
          :columns="userColumns"
          :data-source="filteredUsers"
          :pagination="userPagination"
          :row-key="record => record.id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'user'">
              <div class="user-info">
                <a-avatar :size="32" :style="{ backgroundColor: record.avatarColor }">
                  {{ record.name[0] }}
                </a-avatar>
                <div class="user-detail">
                  <div class="user-name">{{ record.name }}</div>
                  <div class="user-phone">{{ record.phone }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'role'">
              <a-tag :color="roleColorMap[record.role]" size="small">
                {{ roleTextMap[record.role] }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.enabled ? 'green' : 'red'" size="small">
                {{ record.enabled ? '启用' : '禁用' }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button type="link" size="small" @click="editRole(record)">修改角色</a-button>
                <a-button
                  type="link"
                  size="small"
                  :danger="record.enabled"
                  @click="toggleUser(record)"
                >
                  {{ record.enabled ? '禁用' : '启用' }}
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="provider-audit" tab="服务商认证审核">
        <!-- 认证审核列表 -->
        <a-table
          :columns="auditColumns"
          :data-source="providerAuditList"
          :pagination="auditPagination"
          :row-key="record => record.applyId"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="auditStatusColorMap[record.status] || 'default'" size="small">
                {{ auditStatusTextMap[record.status] || record.status }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button type="link" size="small" @click="openAuditDetail(record)">详情</a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 认证详情弹窗 -->
    <a-modal
      v-model:open="auditDetail.visible"
      title="服务商认证申请详情"
      width="760px"
      ok-text="关闭"
      cancel-text="关闭"
      :footer="null"
    >
      <div v-if="auditDetail.data" class="audit-detail">
        <div class="detail-head">
          <a-avatar :size="48" :src="auditDetail.data.avatar">
            {{ auditDetail.data.nickname?.[0] || auditDetail.data.username?.[0] || 'U' }}
          </a-avatar>
          <div class="detail-head-main">
            <div class="detail-title">
              <span class="detail-name">{{ auditDetail.data.nickname }}（{{ auditDetail.data.username }}）</span>
              <a-tag
                :color="auditStatusColorMap[auditDetail.data.status] || 'default'"
                style="margin-left: 8px"
              >
                {{ auditStatusTextMap[auditDetail.data.status] || auditDetail.data.status }}
              </a-tag>
            </div>
            <div class="detail-sub">
              申请ID：{{ auditDetail.data.applyId }} ｜ 用户ID：{{ auditDetail.data.userId }} ｜ 申请时间：{{ auditDetail.data.applyTime }}
            </div>
          </div>
        </div>

        <a-divider style="margin: 16px 0" />

        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="真实姓名">{{ auditDetail.data.realName }}</a-descriptions-item>
          <a-descriptions-item label="身份证号">{{ auditDetail.data.idCard }}</a-descriptions-item>
          <a-descriptions-item label="申请理由" :span="2">{{ auditDetail.data.reason }}</a-descriptions-item>
          <a-descriptions-item label="证明材料" :span="2">
            <div class="files-list" v-if="auditDetail.data.files?.length">
              <div v-for="(u, idx) in auditDetail.data.files" :key="u + idx" class="file-item">
                <a :href="u" target="_blank" rel="noreferrer">{{ u }}</a>
              </div>
            </div>
            <span v-else>—</span>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider style="margin: 16px 0" />

        <div class="detail-section-title">审核历史</div>
        <a-table
          :columns="auditHistoryColumns"
          :data-source="auditDetail.data.auditHistory || []"
          :pagination="false"
          size="small"
          :row-key="(r) => r.auditId"
        />

        <template v-if="auditDetail.data?.status === 'PENDING'">
          <a-divider style="margin: 16px 0" />
          <div class="audit-action-bar">
            <a-form layout="vertical" class="audit-action-form">
              <a-form-item label="审核备注" style="margin-bottom: 0">
                <a-textarea
                  v-model:value="auditDetail.remark"
                  placeholder="请填写审核备注（驳回时必填原因）"
                  :rows="2"
                  :maxlength="200"
                  show-count
                />
              </a-form-item>
            </a-form>
            <div class="audit-action-buttons">
              <a-button type="primary" style="background-color: #52c41a; border-color: #52c41a" @click="handleProviderAudit('approve')">
                通过
              </a-button>
              <a-button danger @click="handleProviderAudit('reject')">
                驳回
              </a-button>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="empty-tip">暂无详情数据</div>
    </a-modal>

    <!-- 修改角色弹窗 -->
    <a-modal
      v-model:open="roleModal.visible"
      title="修改用户角色"
      @ok="handleRoleChange"
      ok-text="确认"
      cancel-text="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="选择角色">
          <a-radio-group v-model:value="roleModal.role">
            <a-radio value="user">普通用户</a-radio>
            <a-radio value="provider">服务商</a-radio>
            <a-radio value="admin">管理员</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('users')
const userSearch = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const auditStatusColorMap = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
  DISABLED: 'default'
}

const auditStatusTextMap = {
  PENDING: '待审',
  APPROVED: '通过',
  REJECTED: '拒绝',
  DISABLED: '禁用'
}

const roleColorMap = {
  user: 'blue',
  provider: 'green',
  admin: 'red'
}

const roleTextMap = {
  user: '普通用户',
  provider: '服务商',
  admin: '管理员'
}

const userColumns = [
  { title: '用户信息', key: 'user', width: '25%' },
  { title: '角色', key: 'role', width: '15%' },
  { title: '状态', key: 'status', width: '10%' },
  { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt', width: '15%' },
  { title: '最后登录', dataIndex: 'lastLogin', key: 'lastLogin', width: '15%' },
  { title: '操作', key: 'action', width: '20%' }
]

const auditColumns = [
  { title: '申请ID', dataIndex: 'applyId', key: 'applyId', width: '12%' },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: '10%' },
  { title: '用户名', dataIndex: 'username', key: 'username', width: '16%' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname', width: '16%' },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime', width: '18%' },
  { title: '状态', key: 'status', width: '12%' },
  { title: '操作', key: 'action', width: '16%' }
]

const auditHistoryColumns = [
  { title: '审核ID', dataIndex: 'auditId', key: 'auditId', width: '14%' },
  { title: '审核人', dataIndex: 'auditor', key: 'auditor', width: '16%' },
  { title: '结果', dataIndex: 'result', key: 'result', width: '14%' },
  { title: '原因', dataIndex: 'reason', key: 'reason', width: '36%' },
  { title: '审核时间', dataIndex: 'auditTime', key: 'auditTime', width: '20%' }
]

const userPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const auditPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const userList = ref([
  {
    id: 1,
    name: '张三',
    phone: '138****0001',
    role: 'user',
    enabled: true,
    createdAt: '2025-01-10',
    lastLogin: '2026-03-07 10:30',
    avatarColor: '#1890ff'
  },
  {
    id: 2,
    name: '李四',
    phone: '139****0002',
    role: 'provider',
    enabled: true,
    createdAt: '2025-02-15',
    lastLogin: '2026-03-06 15:20',
    avatarColor: '#52c41a'
  },
  {
    id: 3,
    name: '王五',
    phone: '137****0003',
    role: 'user',
    enabled: false,
    createdAt: '2025-03-01',
    lastLogin: '2026-02-28 09:15',
    avatarColor: '#722ed1'
  },
  {
    id: 4,
    name: '赵六',
    phone: '136****0004',
    role: 'provider',
    enabled: true,
    createdAt: '2025-04-12',
    lastLogin: '2026-03-07 14:45',
    avatarColor: '#fa8c16'
  },
  {
    id: 5,
    name: '孙七',
    phone: '135****0005',
    role: 'admin',
    enabled: true,
    createdAt: '2024-12-01',
    lastLogin: '2026-03-07 16:00',
    avatarColor: '#13c2c2'
  }
])

const providerAuditList = ref([
  {
    applyId: 10001,
    userId: 123,
    username: 'zhangsan',
    nickname: '张三',
    applyTime: '2026-03-16 10:23:45',
    status: 'PENDING'
  },
  {
    applyId: 10002,
    userId: 124,
    username: 'lisi',
    nickname: '李四',
    applyTime: '2026-03-15 14:30:00',
    status: 'PENDING'
  },
  {
    applyId: 10003,
    userId: 125,
    username: 'wangwu',
    nickname: '王五',
    applyTime: '2026-03-10 09:20:00',
    status: 'REJECTED'
  }
])

const auditDetail = ref({
  visible: false,
  data: null,
  remark: ''
})

const roleModal = ref({
  visible: false,
  role: '',
  target: null
})

const filteredUsers = computed(() => {
  let list = userList.value

  if (roleFilter.value) {
    list = list.filter(u => u.role === roleFilter.value)
  }

  if (statusFilter.value) {
    const enabled = statusFilter.value === 'enabled'
    list = list.filter(u => u.enabled === enabled)
  }

  if (userSearch.value.trim()) {
    const keyword = userSearch.value.trim().toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.phone.includes(keyword)
    )
  }

  userPagination.value.total = list.length
  return list
})

const totalUsers = computed(() => userList.value.length)
const normalUsers = computed(() => userList.value.filter(u => u.role === 'user').length)
const providerUsers = computed(() => userList.value.filter(u => u.role === 'provider').length)
const pendingAudits = computed(() => providerAuditList.value.filter(a => a.status === 'PENDING').length)

const handleUserSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const viewUser = (user) => {
  message.info(`查看用户详情：${user.name}`)
}

const toggleUser = (user) => {
  user.enabled = !user.enabled
  message.success(user.enabled ? '用户已启用' : '用户已禁用')
}

const editRole = (user) => {
  roleModal.value = {
    visible: true,
    role: user.role,
    target: user
  }
}

const handleRoleChange = () => {
  const target = roleModal.value.target
  if (target) {
    target.role = roleModal.value.role
    message.success(`已将 ${target.name} 的角色更改为 ${roleTextMap[target.role]}`)
  }
  roleModal.value.visible = false
}

const openAuditDetail = (record) => {
  // 这里按你给的详情接口返回结构做展示；后续接后端时，把这段替换成真实请求即可
  const mockDetailByApplyId = {
    10001: {
      applyId: 10001,
      userId: 123,
      username: "zhangsan",
      nickname: "张三",
      avatar: "http://example.com/avatar.jpg",
      realName: "张三",
      idCard: "123456199001011234",
      reason: "我有5年Java开发经验，希望成为服务商",
      files: [
        "http://example.com/idcard.jpg",
        "http://example.com/cert.pdf"
      ],
      applyTime: "2026-03-16 10:23:45",
      status: "PENDING",
      auditHistory: [
        {
          auditId: 5001,
          auditor: "admin01",
          result: "REJECTED",
          reason: "材料不全，请补充身份证照片",
          auditTime: "2026-03-15 14:30:00"
        }
      ]
    },
    10002: {
      applyId: 10002,
      userId: 124,
      username: "lisi",
      nickname: "李四",
      avatar: "http://example.com/avatar2.jpg",
      realName: "李四",
      idCard: "123456199202021234",
      reason: "我有3年UI设计经验，希望成为服务商",
      files: [
        "http://example.com/idcard2.jpg"
      ],
      applyTime: "2026-03-15 14:30:00",
      status: "PENDING",
      auditHistory: []
    }
  }

  auditDetail.value = {
    visible: true,
    data: mockDetailByApplyId[record.applyId] || null,
    remark: ''
  }
}

const handleProviderAudit = (type) => {
  if (type === 'reject' && !auditDetail.value.remark.trim()) {
    message.warning('请填写驳回原因')
    return
  }

  const record = providerAuditList.value.find(item => item.applyId === auditDetail.value.data?.applyId)
  if (record) {
    record.status = type === 'approve' ? 'APPROVED' : 'REJECTED'
    message.success(type === 'approve' ? '认证已通过' : '认证已驳回')
  }

  auditDetail.value.visible = false
}
</script>

<style scoped>
.user-management-page { display: flex; flex-direction: column; gap: 16px; height: 100%; }

.page-header { background: #fff; border-radius: 8px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; color: #333; margin: 0; }

.header-stats { display: flex; gap: 32px; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-label { font-size: 12px; color: #999; }
.stat-value { font-size: 20px; font-weight: 700; color: #333; }
.stat-value.pending { color: #fa8c16; }

.management-tabs { background: #fff; border-radius: 8px; padding: 0 24px; flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.management-tabs :deep(.ant-tabs-nav) { margin-bottom: 0; }
.management-tabs :deep(.ant-tabs-content-holder) { overflow: auto; }

.filter-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
.filter-left { display: flex; gap: 12px; }

.user-info { display: flex; align-items: center; gap: 12px; }
.user-detail { flex: 1; min-width: 0; }
.user-name { font-size: 14px; font-weight: 600; color: #333; }
.user-phone { font-size: 12px; color: #999; margin-top: 2px; }

.action-buttons { display: flex; gap: 4px; }

.audit-detail { display: flex; flex-direction: column; }
.detail-head { display: flex; gap: 12px; align-items: center; }
.detail-head-main { flex: 1; min-width: 0; }
.detail-title { display: flex; align-items: center; flex-wrap: wrap; }
.detail-name { font-size: 15px; font-weight: 700; color: #1f2937; }
.detail-sub { margin-top: 4px; font-size: 12px; color: #6b7280; }
.detail-section-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; }
.files-list { display: flex; flex-direction: column; gap: 6px; }
.file-item a { word-break: break-all; }
.empty-tip { color: #999; padding: 8px 0; }

.audit-action-bar { display: flex; gap: 16px; align-items: flex-end; }
.audit-action-form { flex: 1; }
.audit-action-buttons { display: flex; gap: 8px; flex-shrink: 0; }
</style>
