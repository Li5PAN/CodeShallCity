<template>
  <div class="page">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', activeTab === tab.key && 'tab-btn--active']"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- 操作日志 -->
    <div v-if="activeTab === 'operation'" class="tab-content">
      <div class="filter-bar">
        <input v-model="opFilter.user" class="filter-input" placeholder="用户名" />
        <input v-model="opFilter.dateFrom" type="date" class="filter-input" />
        <span class="filter-sep">至</span>
        <input v-model="opFilter.dateTo" type="date" class="filter-input" />
        <button class="btn-primary" @click="">搜索</button>
        <button class="btn-default" @click="resetOpFilter">重置</button>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>日志编号</th><th>操作人</th><th>操作模块</th><th>操作名</th><th>操作内容</th><th>操作时间</th><th>业务编号</th><th>操作IP</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="log in opLogs" :key="log.id">
            <td>{{ log.id }}</td>
            <td>{{ log.user }}</td>
            <td>{{ log.module }}</td>
            <td>{{ log.operationName }}</td>
            <td class="content-cell">{{ log.content }}</td>
            <td>{{ log.time }}</td>
            <td>{{ log.businessId }}</td>
            <td>{{ log.ip }}</td>
            <td><button class="btn-link" @click="viewDetail(log)">详情</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 登录日志 -->
    <div v-if="activeTab === 'login'" class="tab-content">
      <!-- 顶部操作栏 -->
      <div class="login-header">
        <a-tabs v-model:activeKey="loginStatusTab" size="small" class="login-tabs">
          <a-tab-pane key="all" tab="全部登录记录" />
          <a-tab-pane key="success" tab="登录成功" />
          <a-tab-pane key="failed" tab="登录失败" />
        </a-tabs>
        <div class="login-actions">
          <a-input
            v-model:value="loginFilter.user"
            placeholder="用户名"
            style="width: 140px"
            size="small"
            allow-clear
          />
          <a-input
            v-model:value="loginFilter.ip"
            placeholder="IP地址"
            style="width: 140px"
            size="small"
            allow-clear
          />
          <a-button type="primary" size="small" @click="handleLoginSearch">
            搜索
          </a-button>
          <a-button size="small" @click="resetLoginFilter">
            重置
          </a-button>
        </div>
      </div>

      <!-- 登录日志表格 -->
      <a-table
        :columns="loginColumns"
        :data-source="filteredLoginLogs"
        :pagination="loginPagination"
        :row-key="record => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-cell">
              <a-avatar :size="24" :style="{ backgroundColor: record.avatarColor }">
                {{ record.user[0] }}
              </a-avatar>
              <span class="user-name">{{ record.user }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'device'">
            <div class="device-info">
              <div class="device-text">{{ record.device }}</div>
              <div class="device-detail">{{ record.deviceDetail }}</div>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.success ? 'green' : 'red'" size="small">
              {{ record.success ? '成功' : '失败' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
          </template>
        </template>
      </a-table>
    </div>

    <!-- 操作日志详情（与设计图一致：详情标题、全屏、键值表样式） -->
    <a-modal
      v-model:open="detailModal.show"
      :width="detailModal.fullscreen ? '100%' : 680"
      :wrap-class-name="detailModal.fullscreen ? 'op-detail-modal op-detail-modal--fullscreen' : 'op-detail-modal'"
      :footer="null"
      :mask-closable="true"
      destroy-on-close
      :centered="!detailModal.fullscreen"
      @cancel="closeDetailModal"
    >
      <template #title>
        <div class="op-detail-header-inner">
          <span class="op-detail-title-text">详情</span>
          <button
            type="button"
            class="op-detail-fs-trigger"
            aria-label="全屏切换"
            @click.stop="detailModal.fullscreen = !detailModal.fullscreen"
          >
            <FullscreenOutlined v-if="!detailModal.fullscreen" />
            <FullscreenExitOutlined v-else />
          </button>
        </div>
      </template>
      <div class="op-detail-body">
        <div
          v-for="row in detailModal.rows"
          :key="row.label"
          class="op-detail-row"
        >
          <div class="op-detail-label">{{ row.label }}</div>
          <div class="op-detail-value">{{ row.value }}</div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'

const tabs = [
  { key: 'operation', label: '操作日志' },
  { key: 'login', label: '登录日志' }
]
const activeTab = ref('login')

const opFilter = reactive({ user: '', type: '', dateFrom: '', dateTo: '' })
const loginFilter = reactive({ user: '', ip: '' })
const loginStatusTab = ref('all')

const loginColumns = [
  { title: '日志编号', dataIndex: 'id', key: 'id', width: '10%' },
  { title: '登录账号', key: 'user', width: '15%' },
  { title: '登录密码', dataIndex: 'password', key: 'password', width: '12%' },
  { title: '登录类型', dataIndex: 'loginType', key: 'loginType', width: '10%' },
  { title: '浏览器', key: 'device', width: '25%' },
  { title: '登录状态', key: 'status', width: '10%' },
  { title: '登录时间', dataIndex: 'time', key: 'time', width: '13%' },
]

const loginPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const opLogs = ref([
  {
    id: 9195,
    operatorId: 1,
    user: '芋道源码',
    type: 'create',
    content: '创建了角色【管理员】',
    ip: '0:0:0:0:0:0:0:1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
    module: 'SYSTEM 角色',
    operationName: '创建角色',
    requestUrl: 'POST /admin-api/system/role/create',
    time: '2026-03-02 14:18:07',
    businessId: 162
  },
  {
    id: 9194,
    operatorId: 1,
    user: '管理员',
    type: 'audit',
    content: '审核通过服务商认证：张三',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    module: '服务商认证',
    operationName: '审核通过',
    requestUrl: 'POST /admin-api/provider/audit',
    time: '2025-06-03 10:22:11',
    businessId: 901
  },
  {
    id: 9193,
    operatorId: 1,
    user: '管理员',
    type: 'delete',
    content: '删除文章：Vue3最佳实践',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    module: '内容管理',
    operationName: '删除文章',
    requestUrl: 'DELETE /admin-api/article/1001',
    time: '2025-06-03 09:15:44',
    businessId: 1001
  },
  {
    id: 9192,
    operatorId: 1,
    user: '管理员',
    type: 'update',
    content: '修改用户角色：李四 → 服务商',
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    module: '用户管理',
    operationName: '更新用户',
    requestUrl: 'PUT /admin-api/user/role',
    time: '2025-06-02 16:30:00',
    businessId: 502
  },
  {
    id: 9191,
    operatorId: 1,
    user: '管理员',
    type: 'create',
    content: '新增公告：平台升级通知',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    module: '公告',
    operationName: '创建公告',
    requestUrl: 'POST /admin-api/notice/create',
    time: '2025-06-01 14:00:00',
    businessId: 88
  }
])

const loginLogs = ref([
  { 
    id: 4444, 
    user: '高管理员', 
    password: '密码登录密码1',
    loginType: 'admin',
    device: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
    deviceDetail: 'Chrome/90.0.4430.93 Safari/537.36 Edg/145.0.0.0',
    ip: '192.168.1.100',
    success: true, 
    time: '2026-02-27 16:52:58',
    avatarColor: '#1890ff'
  },
  { 
    id: 4443, 
    user: 'admin', 
    password: '密码登录密码1',
    loginType: 'admin',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    deviceDetail: 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0',
    ip: '192.168.1.1',
    success: true, 
    time: '2026-02-27 10:30:15',
    avatarColor: '#52c41a'
  },
  { 
    id: 4442, 
    user: '张三', 
    password: '密码登录密码2',
    loginType: 'user',
    device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    deviceDetail: 'AppleWebKit/537.36 Safari/537.36',
    ip: '10.0.0.5',
    success: true, 
    time: '2026-02-26 14:22:00',
    avatarColor: '#722ed1'
  },
  { 
    id: 4441, 
    user: '未知用户', 
    password: '错误密码',
    loginType: 'unknown',
    device: 'Unknown Browser',
    deviceDetail: 'Unknown Device',
    ip: '1.2.3.4',
    success: false, 
    time: '2026-02-25 23:11:00',
    avatarColor: '#ff4d4f'
  },
  { 
    id: 4440, 
    user: '李四', 
    password: '密码登录密码3',
    loginType: 'provider',
    device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    deviceDetail: 'AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    ip: '172.16.0.10',
    success: true, 
    time: '2026-02-25 09:45:30',
    avatarColor: '#fa8c16'
  }
])

const detailModal = reactive({
  show: false,
  fullscreen: false,
  rows: []
})

const operationLogDetailRows = (log) => [
  { label: '日志主键', value: log.id },
  { label: '操作人编号', value: log.operatorId },
  { label: '操作人名字', value: log.user },
  { label: '操作人 IP', value: log.ip },
  { label: '操作名', value: log.operationName ?? '—' },
  { label: '操作内容', value: log.content },
  { label: '请求 URL', value: log.requestUrl ?? '—' },
  { label: '操作时间', value: log.time },
  { label: '业务编号', value: log.businessId ?? '—' }
]

const filteredLoginLogs = computed(() => {
  let list = loginLogs.value

  if (loginStatusTab.value === 'success') {
    list = list.filter(log => log.success)
  } else if (loginStatusTab.value === 'failed') {
    list = list.filter(log => !log.success)
  }

  if (loginFilter.user.trim()) {
    const keyword = loginFilter.user.trim().toLowerCase()
    list = list.filter(log => log.user.toLowerCase().includes(keyword))
  }

  if (loginFilter.ip.trim()) {
    const keyword = loginFilter.ip.trim()
    list = list.filter(log => log.ip.includes(keyword))
  }

  loginPagination.value.total = list.length
  return list
})


const viewDetail = (log) => {
  detailModal.rows = operationLogDetailRows(log)
  detailModal.show = true
}

const closeDetailModal = () => {
  detailModal.show = false
  detailModal.fullscreen = false
}

watch(
  () => detailModal.show,
  (open) => {
    if (!open) detailModal.fullscreen = false
  }
)

const handleLoginSearch = () => {
  message.info('搜索功能已触发')
}

const resetOpFilter = () => { 
  opFilter.user = ''
  opFilter.type = ''
  opFilter.dateFrom = ''
  opFilter.dateTo = '' 
}

const resetLoginFilter = () => { 
  loginFilter.user = ''
  loginFilter.ip = ''
  message.success('筛选条件已重置')
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.tabs { display: flex; gap: 4px; border-bottom: 2px solid #e8e8e8; }
.tab-btn { padding: 10px 20px; border: none; background: none; font-size: 14px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.tab-btn--active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 600; }

.tab-content { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 16px; }

.filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-input { padding: 7px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; outline: none; width: 140px; }
.filter-input:focus { border-color: #4f46e5; }
.filter-select { padding: 7px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; outline: none; }
.filter-sep { color: #888; font-size: 13px; }

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: #f8f8f8; padding: 10px 12px; text-align: left; color: #555; font-weight: 600; border-bottom: 1px solid #e8e8e8; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.data-table tr:last-child td { border-bottom: none; }
.content-cell { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }


.status-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status-tag--green { background: #dcfce7; color: #16a34a; }
.status-tag--red { background: #fee2e2; color: #dc2626; }

.btn-primary { padding: 8px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-default { padding: 7px 14px; background: #f0f0f0; color: #555; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-link { background: none; border: none; color: #4f46e5; cursor: pointer; font-size: 13px; padding: 0; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 10px; padding: 24px; width: 480px; }
.modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.op-detail-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 36px;
  box-sizing: border-box;
}
.op-detail-title-text { font-size: 16px; font-weight: 600; color: rgba(0, 0, 0, 0.88); }
.op-detail-fs-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.2s, background 0.2s;
}
.op-detail-fs-trigger:hover { color: rgba(0, 0, 0, 0.88); background: rgba(0, 0, 0, 0.04); }

.op-detail-body {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5715;
}
.op-detail-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #ebeef5;
}
.op-detail-row:last-child { border-bottom: none; }
.op-detail-label {
  flex: 0 0 140px;
  max-width: 40%;
  padding: 12px 16px;
  background: #f5f7fa;
  color: rgba(0, 0, 0, 0.65);
  text-align: right;
  border-right: 1px solid #ebeef5;
  box-sizing: border-box;
}
.op-detail-value {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  background: #fff;
  color: rgba(0, 0, 0, 0.88);
  word-break: break-word;
  white-space: pre-wrap;
}

.detail-content { max-height: 400px; overflow-y: auto; }
.modal-footer { display: flex; justify-content: flex-end; margin-top: 16px; }

.login-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.login-tabs :deep(.ant-tabs-nav) { margin: 0; }
.login-tabs :deep(.ant-tabs-nav::before) { border: none; }
.login-actions { display: flex; gap: 8px; align-items: center; }

.user-cell { display: flex; align-items: center; gap: 8px; }
.user-name { font-size: 14px; color: #333; }

.device-info { display: flex; flex-direction: column; gap: 2px; }
.device-text { font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
.device-detail { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
</style>

<style>
/* 详情弹窗 wrap-class 挂在 body 下，需非 scoped */
.ant-modal-wrap.op-detail-modal--fullscreen .ant-modal {
  top: 0;
  max-width: 100vw;
  padding-bottom: 0;
  margin: 0;
}
.ant-modal-wrap.op-detail-modal--fullscreen .ant-modal-content {
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  border-radius: 0;
}
.ant-modal-wrap.op-detail-modal--fullscreen .ant-modal-body {
  flex: 1;
  overflow: auto;
}
</style>
