<template>
  <div class="page">
    <!-- 标签页 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', activeTab === tab.key && 'tab-btn--active']"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- 用户管理 -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="toolbar">
        <input v-model="userSearch" class="search-input" placeholder="搜索用户名 / 手机号" />
        <button class="btn-primary" @click="handleUserSearch">搜索</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>用户名</th><th>手机号</th><th>角色</th><th>状态</th><th>注册时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <select v-model="user.role" class="role-select" @change="changeRole(user)">
                <option value="user">普通用户</option>
                <option value="provider">服务商</option>
                <option value="admin">管理员</option>
              </select>
            </td>
            <td>
              <span :class="['status-tag', user.enabled ? 'status-tag--green' : 'status-tag--red']">
                {{ user.enabled ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ user.createdAt }}</td>
            <td class="action-cell">
              <button class="btn-link" @click="viewUser(user)">详情</button>
              <button class="btn-link" @click="toggleUser(user)">
                {{ user.enabled ? '禁用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 服务商认证审核 -->
    <div v-if="activeTab === 'provider-audit'" class="tab-content">
      <table class="data-table">
        <thead>
          <tr>
            <th>申请人</th><th>手机号</th><th>提交时间</th><th>资质材料</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in providerList" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.submitAt }}</td>
            <td><a href="#" class="btn-link">查看材料</a></td>
            <td>
              <span :class="['status-tag', statusClass(item.status)]">{{ statusLabel(item.status) }}</span>
            </td>
            <td class="action-cell" v-if="item.status === 'pending'">
              <button class="btn-success" @click="openAudit(item, 'pass')">通过</button>
              <button class="btn-danger" @click="openAudit(item, 'reject')">驳回</button>
            </td>
            <td v-else>—</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 商品审核 -->
    <div v-if="activeTab === 'goods-audit'" class="tab-content">
      <table class="data-table">
        <thead>
          <tr>
            <th>商品名称</th><th>服务商</th><th>分类</th><th>价格</th><th>提交时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in goodsList" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.provider }}</td>
            <td>{{ item.category }}</td>
            <td>¥{{ item.price }}</td>
            <td>{{ item.submitAt }}</td>
            <td class="action-cell">
              <button class="btn-success" @click="openAudit(item, 'pass')">通过</button>
              <button class="btn-danger" @click="openAudit(item, 'reject')">驳回</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 审核弹窗 -->
    <div v-if="auditModal.show" class="modal-mask" @click.self="auditModal.show = false">
      <div class="modal">
        <div class="modal-title">{{ auditModal.type === 'pass' ? '通过审核' : '驳回审核' }}</div>
        <textarea
          v-model="auditModal.remark"
          class="modal-textarea"
          :placeholder="auditModal.type === 'pass' ? '填写备注（选填）' : '填写驳回原因（必填）'"
        ></textarea>
        <div class="modal-footer">
          <button class="btn-default" @click="auditModal.show = false">取消</button>
          <button
            :class="auditModal.type === 'pass' ? 'btn-success' : 'btn-danger'"
            @click="submitAudit"
          >确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const tabs = [
  { key: 'users', label: '用户管理' },
  { key: 'provider-audit', label: '服务商认证审核' },
  { key: 'goods-audit', label: '商品审核' }
]
const activeTab = ref('users')
const userSearch = ref('')

const userList = ref([
  { id: 1, name: '张三', phone: '138****0001', role: 'user', enabled: true, createdAt: '2025-01-10' },
  { id: 2, name: '李四', phone: '139****0002', role: 'provider', enabled: true, createdAt: '2025-02-15' },
  { id: 3, name: '王五', phone: '137****0003', role: 'user', enabled: false, createdAt: '2025-03-01' }
])

const providerList = ref([
  { id: 1, name: '赵六', phone: '136****0004', submitAt: '2025-06-01', status: 'pending' },
  { id: 2, name: '孙七', phone: '135****0005', submitAt: '2025-05-28', status: 'passed' }
])

const goodsList = ref([
  { id: 1, name: 'Vue3全栈开发', provider: '李四', category: '前端开发', price: 2000, submitAt: '2025-06-02' },
  { id: 2, name: 'Python爬虫服务', provider: '赵六', category: '数据分析', price: 1500, submitAt: '2025-06-03' }
])

const auditModal = reactive({ show: false, type: '', remark: '', target: null })

const statusClass = s => ({ pending: 'status-tag--yellow', passed: 'status-tag--green', rejected: 'status-tag--red' }[s])
const statusLabel = s => ({ pending: '待审核', passed: '已通过', rejected: '已驳回' }[s])

const handleUserSearch = () => { /* 调用接口 */ }
const viewUser = (user) => { alert(`查看用户：${user.name}`) }
const toggleUser = (user) => { user.enabled = !user.enabled }
const changeRole = (user) => { console.log('变更角色', user) }

const openAudit = (item, type) => {
  auditModal.show = true
  auditModal.type = type
  auditModal.remark = ''
  auditModal.target = item
}

const submitAudit = () => {
  if (auditModal.type === 'reject' && !auditModal.remark.trim()) {
    alert('请填写驳回原因')
    return
  }
  if (auditModal.target) {
    auditModal.target.status = auditModal.type === 'pass' ? 'passed' : 'rejected'
  }
  auditModal.show = false
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.tabs { display: flex; gap: 4px; border-bottom: 2px solid #e8e8e8; padding-bottom: 0; }

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn--active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 600; }

.tab-content { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }

.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }

.search-input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 260px;
  outline: none;
}

.search-input:focus { border-color: #4f46e5; }

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: #f8f8f8; padding: 10px 12px; text-align: left; color: #555; font-weight: 600; border-bottom: 1px solid #e8e8e8; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.data-table tr:last-child td { border-bottom: none; }

.action-cell { display: flex; gap: 8px; align-items: center; }

.role-select { padding: 4px 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 13px; }

.status-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status-tag--green { background: #dcfce7; color: #16a34a; }
.status-tag--red { background: #fee2e2; color: #dc2626; }
.status-tag--yellow { background: #fef9c3; color: #ca8a04; }

.btn-primary { padding: 8px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-success { padding: 5px 12px; background: #16a34a; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-danger { padding: 5px 12px; background: #dc2626; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-default { padding: 5px 12px; background: #f0f0f0; color: #555; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-link { background: none; border: none; color: #4f46e5; cursor: pointer; font-size: 13px; padding: 0; }

.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}

.modal { background: #fff; border-radius: 10px; padding: 24px; width: 400px; }
.modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.modal-textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; resize: none; box-sizing: border-box; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
</style>
