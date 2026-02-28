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
      <div class="filter-bar">
        <input v-model="loginFilter.user" class="filter-input" placeholder="用户名" />
        <input v-model="loginFilter.ip" class="filter-input" placeholder="IP地址" />
        <input v-model="loginFilter.dateFrom" type="date" class="filter-input" />
        <span class="filter-sep">至</span>
        <input v-model="loginFilter.dateTo" type="date" class="filter-input" />
        <button class="btn-primary" @click="">搜索</button>
        <button class="btn-default" @click="resetLoginFilter">重置</button>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>用户名</th><th>登录IP</th><th>登录设备</th><th>登录状态</th><th>登录时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="log in loginLogs" :key="log.id">
            <td>{{ log.user }}</td>
            <td>{{ log.ip }}</td>
            <td>{{ log.device }}</td>
            <td>
              <span :class="['status-tag', log.success ? 'status-tag--green' : 'status-tag--red']">
                {{ log.success ? '成功' : '失败' }}
              </span>
            </td>
            <td>{{ log.time }}</td>
            <td><button class="btn-link" @click="viewDetail(log)">详情</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="detailModal.show" class="modal-mask" @click.self="detailModal.show = false">
      <div class="modal">
        <div class="modal-title">日志详情</div>
        <div class="detail-content">
          <pre>{{ JSON.stringify(detailModal.data, null, 2) }}</pre>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="detailModal.show = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const tabs = [
  { key: 'operation', label: '操作日志' },
  { key: 'login', label: '登录日志' }
]
const activeTab = ref('operation')

const opFilter = reactive({ user: '', type: '', dateFrom: '', dateTo: '' })
const loginFilter = reactive({ user: '', ip: '', dateFrom: '', dateTo: '' })

const opLogs = ref([
  { id: 1, user: '管理员', type: 'audit', content: '审核通过服务商认证：张三', ip: '192.168.1.1', time: '2025-06-03 10:22:11' },
  { id: 2, user: '管理员', type: 'delete', content: '删除文章：Vue3最佳实践', ip: '192.168.1.1', time: '2025-06-03 09:15:44' },
  { id: 3, user: '管理员', type: 'update', content: '修改用户角色：李四 → 服务商', ip: '192.168.1.2', time: '2025-06-02 16:30:00' },
  { id: 4, user: '管理员', type: 'create', content: '新增公告：平台升级通知', ip: '192.168.1.1', time: '2025-06-01 14:00:00' }
])

const loginLogs = ref([
  { id: 1, user: '管理员', ip: '192.168.1.1', device: 'Chrome / Windows', success: true, time: '2025-06-03 09:00:00' },
  { id: 2, user: '张三', ip: '10.0.0.5', device: 'Safari / macOS', success: true, time: '2025-06-03 08:45:00' },
  { id: 3, user: '未知用户', ip: '1.2.3.4', device: 'Unknown', success: false, time: '2025-06-02 23:11:00' }
])

const detailModal = reactive({ show: false, data: null })

const opTagClass = t => ({ create: 'op-tag--blue', update: 'op-tag--yellow', delete: 'op-tag--red', audit: 'op-tag--green' }[t])
const opTypeLabel = t => ({ create: '新增', update: '修改', delete: '删除', audit: '审核' }[t])

const viewDetail = (log) => { detailModal.data = log; detailModal.show = true }
const resetOpFilter = () => { opFilter.user = ''; opFilter.type = ''; opFilter.dateFrom = ''; opFilter.dateTo = '' }
const resetLoginFilter = () => { loginFilter.user = ''; loginFilter.ip = ''; loginFilter.dateFrom = ''; loginFilter.dateTo = '' }
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
.detail-content { background: #f8f8f8; border-radius: 6px; padding: 12px; max-height: 300px; overflow-y: auto; }
.detail-content pre { font-size: 13px; color: #333; margin: 0; white-space: pre-wrap; }
.modal-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
