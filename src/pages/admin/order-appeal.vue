<template>
  <div class="page">
    <!-- 列表视图 -->
    <div v-if="!detailItem" class="tab-content">
      <div class="toolbar">
        <span class="page-title">待处理申诉列表</span>
        <div class="filter-group">
          <select v-model="filterStatus" class="filter-select">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="success">申诉成功</option>
            <option value="failed">申诉失败</option>
          </select>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>申诉编号</th><th>订单编号</th><th>申诉人</th><th>申诉原因</th><th>提交时间</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td>{{ item.appealNo }}</td>
            <td>{{ item.orderNo }}</td>
            <td>{{ item.applicant }}</td>
            <td class="reason-cell">{{ item.reason }}</td>
            <td>{{ item.submitAt }}</td>
            <td>
              <span :class="['status-tag', statusClass(item.status)]">{{ statusLabel(item.status) }}</span>
            </td>
            <td>
              <button class="btn-link" @click="detailItem = item">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 详情视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <button class="btn-back" @click="detailItem = null">← 返回列表</button>
        <span class="detail-title">申诉详情 - {{ detailItem.appealNo }}</span>
      </div>

      <div class="detail-grid">
        <!-- 订单信息 -->
        <div class="detail-card">
          <div class="card-title">订单信息</div>
          <div class="info-row"><span class="info-label">订单编号</span><span>{{ detailItem.orderNo }}</span></div>
          <div class="info-row"><span class="info-label">服务名称</span><span>{{ detailItem.serviceName }}</span></div>
          <div class="info-row"><span class="info-label">买家</span><span>{{ detailItem.buyer }}</span></div>
          <div class="info-row"><span class="info-label">卖家</span><span>{{ detailItem.seller }}</span></div>
          <div class="info-row"><span class="info-label">订单金额</span><span>¥{{ detailItem.amount }}</span></div>
          <div class="info-row"><span class="info-label">订单状态</span><span>{{ detailItem.orderStatus }}</span></div>
        </div>

        <!-- 申诉信息 -->
        <div class="detail-card">
          <div class="card-title">申诉信息</div>
          <div class="info-row"><span class="info-label">申诉人</span><span>{{ detailItem.applicant }}</span></div>
          <div class="info-row"><span class="info-label">申诉原因</span><span>{{ detailItem.reason }}</span></div>
          <div class="info-row"><span class="info-label">提交时间</span><span>{{ detailItem.submitAt }}</span></div>
          <div class="info-row">
            <span class="info-label">举证材料</span>
            <div class="evidence-list">
              <a v-for="(e, i) in detailItem.evidence" :key="i" href="#" class="evidence-link">
                📎 {{ e }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 处理操作（仅待处理状态显示） -->
      <div v-if="detailItem.status === 'pending'" class="action-card">
        <div class="card-title">处理申诉</div>
        <textarea v-model="handleRemark" class="remark-textarea" placeholder="填写处理备注（必填）"></textarea>
        <div class="action-btns">
          <button class="btn-success btn-lg" @click="handleAppeal('success')">申诉成功</button>
          <button class="btn-danger btn-lg" @click="handleAppeal('failed')">申诉失败</button>
        </div>
      </div>

      <div v-else class="action-card">
        <div class="card-title">处理结果</div>
        <div class="info-row">
          <span class="info-label">处理结果</span>
          <span :class="['status-tag', statusClass(detailItem.status)]">{{ statusLabel(detailItem.status) }}</span>
        </div>
        <div class="info-row"><span class="info-label">处理备注</span><span>{{ detailItem.remark || '—' }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filterStatus = ref('')
const detailItem = ref(null)
const handleRemark = ref('')

const appealList = ref([
  {
    id: 1, appealNo: 'AP202506001', orderNo: 'ORD202506001',
    applicant: '张三', reason: '服务未按约定完成，要求退款',
    submitAt: '2025-06-01', status: 'pending',
    serviceName: 'Vue3全栈开发', buyer: '张三', seller: '李四',
    amount: 2000, orderStatus: '已完成',
    evidence: ['截图1.png', '聊天记录.pdf'],
    remark: ''
  },
  {
    id: 2, appealNo: 'AP202506002', orderNo: 'ORD202505088',
    applicant: '王五', reason: '交付物质量不符合要求',
    submitAt: '2025-05-30', status: 'success',
    serviceName: 'Python爬虫服务', buyer: '王五', seller: '赵六',
    amount: 1500, orderStatus: '申诉成功',
    evidence: ['对比截图.png'],
    remark: '经核实，服务商未按约定交付，申诉成立'
  },
  {
    id: 3, appealNo: 'AP202506003', orderNo: 'ORD202505055',
    applicant: '孙七', reason: '对方无故拖延交付时间',
    submitAt: '2025-05-28', status: 'failed',
    serviceName: 'UI设计服务', buyer: '孙七', seller: '周八',
    amount: 800, orderStatus: '申诉失败',
    evidence: [],
    remark: '经核实，延迟原因为买家需求变更，申诉不成立'
  }
])

const filteredList = computed(() =>
  filterStatus.value ? appealList.value.filter(a => a.status === filterStatus.value) : appealList.value
)

const statusClass = s => ({ pending: 'status-tag--yellow', success: 'status-tag--green', failed: 'status-tag--red' }[s])
const statusLabel = s => ({ pending: '待处理', success: '申诉成功', failed: '申诉失败' }[s])

const handleAppeal = (result) => {
  if (!handleRemark.value.trim()) { alert('请填写处理备注'); return }
  detailItem.value.status = result
  detailItem.value.remark = handleRemark.value
  handleRemark.value = ''
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.tab-content { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }

.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-title { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.filter-group { display: flex; gap: 10px; }
.filter-select { padding: 7px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; outline: none; }

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: #f8f8f8; padding: 10px 12px; text-align: left; color: #555; font-weight: 600; border-bottom: 1px solid #e8e8e8; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.data-table tr:last-child td { border-bottom: none; }
.reason-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.status-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status-tag--green { background: #dcfce7; color: #16a34a; }
.status-tag--red { background: #fee2e2; color: #dc2626; }
.status-tag--yellow { background: #fef9c3; color: #ca8a04; }

.btn-link { background: none; border: none; color: #4f46e5; cursor: pointer; font-size: 13px; padding: 0; }

/* 详情视图 */
.detail-view { display: flex; flex-direction: column; gap: 16px; }

.detail-header { display: flex; align-items: center; gap: 16px; }
.btn-back { background: none; border: 1px solid #e0e0e0; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 14px; color: #555; transition: all 0.2s; }
.btn-back:hover { background: #f0f0f0; }
.detail-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.detail-card, .action-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.card-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }

.info-row { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f8f8f8; font-size: 14px; }
.info-row:last-child { border-bottom: none; }
.info-label { width: 80px; color: #888; flex-shrink: 0; }

.evidence-list { display: flex; flex-direction: column; gap: 4px; }
.evidence-link { color: #4f46e5; text-decoration: none; font-size: 13px; }
.evidence-link:hover { text-decoration: underline; }

.remark-textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; resize: none; box-sizing: border-box; margin-bottom: 16px; }
.remark-textarea:focus { outline: none; border-color: #4f46e5; }

.action-btns { display: flex; gap: 12px; }
.btn-success { padding: 5px 12px; background: #16a34a; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-danger { padding: 5px 12px; background: #dc2626; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-lg { padding: 10px 28px; font-size: 15px; border-radius: 6px; }
</style>
