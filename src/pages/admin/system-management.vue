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
        <select v-model="opFilter.type" class="filter-select">
          <option value="">全部操作类型</option>
          <option value="create">新增</option>
          <option value="update">修改</option>
          <option value="delete">删除</option>
          <option value="audit">审核</option>
        </select>
        <input v-model="opFilter.dateFrom" type="date" class="filter-input" />
        <span class="filter-sep">至</span>
        <input v-model="opFilter.dateTo" type="date" class="filter-input" />
        <button class="btn-primary" @click="">搜索</button>
        <button class="btn-default" @click="resetOpFilter">重置</button>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>操作人</th><th>操作类型</th><th>操作内容</th><th>IP地址</th><th>操作时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="log in opLogs" :key="log.id">
            <td>{{ log.user }}</td>
            <td><span :class="['op-tag', opTagClass(log.type)]">{{ opTypeLabel(log.type) }}</span></td>
            <td class="content-cell">{{ log.content }}</td>
            <td>{{ log.ip }}</td>
            <td>{{ log.time }}</td>
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
            <a-button type="link" size="small" @click="viewLoginDetail(record)">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailModal.show"
      title="日志详情"
      @ok="detailModal.show = false"
      ok-text="关闭"
      :cancel-button-props="{ style: { display: 'none' } }"
      width="600px"
    >
      <div class="detail-content">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item v-for="(value, key) in detailModal.data" :key="key" :label="key">
            {{ value }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

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
  { title: '操作', key: 'action', width: '5%' }
]

const loginPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const opLogs = ref([
  { id: 1, user: '管理员', type: 'audit', content: '审核通过服务商认证：张三', ip: '192.168.1.1', time: '2025-06-03 10:22:11' },
  { id: 2, user: '管理员', type: 'delete', content: '删除文章：Vue3最佳实践', ip: '192.168.1.1', time: '2025-06-03 09:15:44' },
  { id: 3, user: '管理员', type: 'update', content: '修改用户角色：李四 → 服务商', ip: '192.168.1.2', time: '2025-06-02 16:30:00' },
  { id: 4, user: '管理员', type: 'create', content: '新增公告：平台升级通知', ip: '192.168.1.1', time: '2025-06-01 14:00:00' }
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

const detailModal = reactive({ show: false, data: null })

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

const opTagClass = t => ({ create: 'op-tag--blue', update: 'op-tag--yellow', delete: 'op-tag--red', audit: 'op-tag--green' }[t])
const opTypeLabel = t => ({ create: '新增', update: '修改', delete: '删除', audit: '审核' }[t])

const viewDetail = (log) => { 
  detailModal.data = log
  detailModal.show = true 
}

const viewLoginDetail = (log) => {
  detailModal.data = {
    '日志编号': log.id,
    '登录账号': log.user,
    '登录密码': log.password,
    '登录类型': log.loginType,
    '浏览器': log.device,
    '设备详情': log.deviceDetail,
    'IP地址': log.ip,
    '登录状态': log.success ? '成功' : '失败',
    '登录时间': log.time
  }
  detailModal.show = true
}

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

.op-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.op-tag--blue { background: #dbeafe; color: #1d4ed8; }
.op-tag--yellow { background: #fef9c3; color: #ca8a04; }
.op-tag--red { background: #fee2e2; color: #dc2626; }
.op-tag--green { background: #dcfce7; color: #16a34a; }

.status-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status-tag--green { background: #dcfce7; color: #16a34a; }
.status-tag--red { background: #fee2e2; color: #dc2626; }

.btn-primary { padding: 8px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-default { padding: 7px 14px; background: #f0f0f0; color: #555; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-link { background: none; border: none; color: #4f46e5; cursor: pointer; font-size: 13px; padding: 0; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 10px; padding: 24px; width: 480px; }
.modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
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
