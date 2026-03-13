<template>
  <div class="goods-management-page">
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">服务待审核</span>
          <span class="stat-value pending">{{ servicePendingCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">需求待审核</span>
          <span class="stat-value pending">{{ demandPendingCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已通过</span>
          <span class="stat-value success">{{ approvedCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已驳回</span>
          <span class="stat-value danger">{{ rejectedCount }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model:activeKey="activeTab" class="management-tabs">
      <a-tab-pane key="service" tab="服务订单审核">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-left">
            <a-tabs v-model:activeKey="serviceStatusFilter" size="small">
              <a-tab-pane key="all" tab="全部" />
              <a-tab-pane key="pending" tab="待审核" />
              <a-tab-pane key="approved" tab="已通过" />
              <a-tab-pane key="rejected" tab="已驳回" />
            </a-tabs>
          </div>
          <div class="filter-right">
            <a-select v-model:value="serviceCategoryFilter" style="width: 120px" size="small" placeholder="服务分类">
              <a-select-option value="">全部分类</a-select-option>
              <a-select-option value="前端开发">前端开发</a-select-option>
              <a-select-option value="后端开发">后端开发</a-select-option>
              <a-select-option value="数据分析">数据分析</a-select-option>
              <a-select-option value="人工智能">人工智能</a-select-option>
            </a-select>
            <a-input-search
              v-model:value="serviceSearchKeyword"
              placeholder="搜索服务名称或服务商"
              style="width: 240px"
              size="small"
            />
          </div>
        </div>

        <!-- 服务列表 -->
        <a-table
          :columns="serviceColumns"
          :data-source="filteredServices"
          :pagination="servicePagination"
          :row-key="record => record.id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'service'">
              <div class="goods-info">
                <img :src="record.cover" class="goods-cover" />
                <div class="goods-detail">
                  <div class="goods-name">{{ record.name }}</div>
                  <div class="goods-desc">{{ record.description }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'provider'">
              <div class="provider-info">
                <a-avatar :size="24" :style="{ backgroundColor: record.providerColor }">
                  {{ record.provider[0] }}
                </a-avatar>
                <span>{{ record.provider }}</span>
              </div>
            </template>

            <template v-else-if="column.key === 'category'">
              <a-tag color="blue" size="small">{{ record.category }}</a-tag>
            </template>

            <template v-else-if="column.key === 'price'">
              <span class="price-text">¥{{ record.price }}</span>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="statusColorMap[record.status]" size="small">
                {{ statusTextMap[record.status] }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button type="link" size="small" @click="viewDetail(record, 'service')">查看</a-button>
                <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  style="color: #52c41a"
                  @click="openAuditModal(record, 'approve', 'service')"
                >通过</a-button>
                <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  danger
                  @click="openAuditModal(record, 'reject', 'service')"
                >驳回</a-button>
                <a-button
                  v-if="record.status === 'approved'"
                  type="link"
                  size="small"
                  danger
                  @click="offlineItem(record, 'service')"
                >下架</a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="demand" tab="需求审核">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-left">
            <a-tabs v-model:activeKey="demandStatusFilter" size="small">
              <a-tab-pane key="all" tab="全部" />
              <a-tab-pane key="pending" tab="待审核" />
              <a-tab-pane key="approved" tab="已通过" />
              <a-tab-pane key="rejected" tab="已驳回" />
            </a-tabs>
          </div>
          <div class="filter-right">
            <a-select v-model:value="demandTypeFilter" style="width: 120px" size="small" placeholder="需求类型">
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="人工智能">人工智能</a-select-option>
              <a-select-option value="移动开发">移动开发</a-select-option>
              <a-select-option value="Web开发">Web开发</a-select-option>
              <a-select-option value="数据分析">数据分析</a-select-option>
            </a-select>
            <a-input-search
              v-model:value="demandSearchKeyword"
              placeholder="搜索需求标题或发布者"
              style="width: 240px"
              size="small"
            />
          </div>
        </div>

        <!-- 需求列表 -->
        <a-table
          :columns="demandColumns"
          :data-source="filteredDemands"
          :pagination="demandPagination"
          :row-key="record => record.id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'demand'">
              <div class="goods-info">
                <div class="demand-icon">
                  <TrophyOutlined :style="{ fontSize: '24px', color: record.iconColor }" />
                </div>
                <div class="goods-detail">
                  <div class="goods-name">{{ record.title }}</div>
                  <div class="goods-desc">{{ record.description }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'publisher'">
              <div class="provider-info">
                <a-avatar :size="24" :style="{ backgroundColor: record.publisherColor }">
                  {{ record.publisher[0] }}
                </a-avatar>
                <span>{{ record.publisher }}</span>
              </div>
            </template>

            <template v-else-if="column.key === 'type'">
              <a-tag color="orange" size="small">{{ record.type }}</a-tag>
            </template>

            <template v-else-if="column.key === 'budget'">
              <span class="price-text">¥{{ record.budget }}</span>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="statusColorMap[record.status]" size="small">
                {{ statusTextMap[record.status] }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button type="link" size="small" @click="viewDetail(record, 'demand')">查看</a-button>
                <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  style="color: #52c41a"
                  @click="openAuditModal(record, 'approve', 'demand')"
                >通过</a-button>
                <a-button
                  v-if="record.status === 'pending'"
                  type="link"
                  size="small"
                  danger
                  @click="openAuditModal(record, 'reject', 'demand')"
                >驳回</a-button>
                <a-button
                  v-if="record.status === 'approved'"
                  type="link"
                  size="small"
                  danger
                  @click="offlineItem(record, 'demand')"
                >下架</a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="auditModal.visible"
      :title="auditModal.type === 'approve' ? '审核通过' : '审核驳回'"
      @ok="handleAudit"
      ok-text="确认"
      cancel-text="取消"
    >
      <a-form layout="vertical">
        <a-form-item :label="auditModal.type === 'approve' ? '审核备注（选填）' : '驳回原因（必填）'">
          <a-textarea
            v-model:value="auditModal.remark"
            :placeholder="auditModal.type === 'approve' ? '填写审核备注' : '请填写驳回原因'"
            :rows="4"
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { TrophyOutlined } from '@ant-design/icons-vue'

const activeTab = ref('service')
const serviceStatusFilter = ref('all')
const serviceCategoryFilter = ref('')
const serviceSearchKeyword = ref('')
const demandStatusFilter = ref('all')
const demandTypeFilter = ref('')
const demandSearchKeyword = ref('')

const statusColorMap = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red'
}

const statusTextMap = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回'
}

const serviceColumns = [
  { title: '服务信息', key: 'service', width: '35%' },
  { title: '服务商', key: 'provider', width: '12%' },
  { title: '分类', key: 'category', width: '10%' },
  { title: '价格', key: 'price', width: '10%' },
  { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime', width: '13%' },
  { title: '状态', key: 'status', width: '10%' },
  { title: '操作', key: 'action', width: '10%' }
]

const demandColumns = [
  { title: '需求信息', key: 'demand', width: '35%' },
  { title: '发布者', key: 'publisher', width: '12%' },
  { title: '类型', key: 'type', width: '10%' },
  { title: '预算', key: 'budget', width: '10%' },
  { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime', width: '13%' },
  { title: '状态', key: 'status', width: '10%' },
  { title: '操作', key: 'action', width: '10%' }
]

const servicePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const demandPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const serviceList = ref([
  {
    id: 1,
    name: 'Vue3全栈开发实战课程',
    description: '从零搭建企业级Vue3项目，包含组件库、状态管理、路由等核心技术',
    cover: 'https://placehold.co/60x45/42b883/FFFFFF?text=Vue3',
    provider: '前端大师',
    providerColor: '#1890ff',
    category: '前端开发',
    price: 399,
    submitTime: '2026-03-05 10:30',
    status: 'pending'
  },
  {
    id: 2,
    name: 'Python爬虫数据采集服务',
    description: '提供专业的网页数据采集服务，支持动态网页、反爬虫处理',
    cover: 'https://placehold.co/60x45/3776AB/FFFFFF?text=Python',
    provider: '数据专家',
    providerColor: '#52c41a',
    category: '数据分析',
    price: 1500,
    submitTime: '2026-03-04 14:20',
    status: 'approved'
  },
  {
    id: 3,
    name: 'Java微服务架构设计',
    description: 'Spring Cloud微服务架构设计与实现，包含服务治理、配置中心等',
    cover: 'https://placehold.co/60x45/FF6600/FFFFFF?text=Java',
    provider: '架构师',
    providerColor: '#722ed1',
    category: '后端开发',
    price: 2999,
    submitTime: '2026-03-03 09:15',
    status: 'approved'
  },
  {
    id: 4,
    name: 'AI大模型应用开发',
    description: '基于GPT、Claude等大模型的应用开发，包含Prompt工程、RAG等',
    cover: 'https://placehold.co/60x45/52c41a/FFFFFF?text=AI',
    provider: 'AI专家',
    providerColor: '#fa8c16',
    category: '人工智能',
    price: 4999,
    submitTime: '2026-03-02 16:45',
    status: 'pending'
  },
  {
    id: 5,
    name: 'React Native移动端开发',
    description: '跨平台移动应用开发，一套代码同时支持iOS和Android',
    cover: 'https://placehold.co/60x45/61DAFB/000000?text=RN',
    provider: '移动开发者',
    providerColor: '#13c2c2',
    category: '前端开发',
    price: 899,
    submitTime: '2026-03-01 11:00',
    status: 'rejected'
  }
])

const demandList = ref([
  {
    id: 1,
    title: 'MiniMax-M2.1 智能客服系统开发',
    description: '基于MiniMax大模型开发智能客服系统，需要支持多轮对话、知识库检索',
    publisher: '科技公司HR',
    publisherColor: '#ff4d4f',
    type: '人工智能',
    budget: 3800,
    submitTime: '2026-03-05 14:00',
    status: 'pending',
    iconColor: '#faad14'
  },
  {
    id: 2,
    title: 'React Native 跨平台移动端应用',
    description: '开发一款跨平台的移动应用，包含用户系统、支付功能、数据统计',
    publisher: '创业团队',
    publisherColor: '#13c2c2',
    type: '移动开发',
    budget: 12000,
    submitTime: '2026-03-04 10:30',
    status: 'approved',
    iconColor: '#52c41a'
  },
  {
    id: 3,
    title: 'Vue3企业级后台管理系统',
    description: '开发一套完整的企业级后台管理系统，包含权限管理、数据可视化等',
    publisher: '互联网公司',
    publisherColor: '#1890ff',
    type: 'Web开发',
    budget: 8000,
    submitTime: '2026-03-03 16:20',
    status: 'pending',
    iconColor: '#faad14'
  },
  {
    id: 4,
    title: '电商数据分析与可视化',
    description: '对电商平台的销售数据进行深度分析，制作可视化报表和预测模型',
    publisher: '电商平台',
    publisherColor: '#722ed1',
    type: '数据分析',
    budget: 5000,
    submitTime: '2026-03-02 09:45',
    status: 'rejected',
    iconColor: '#ff4d4f'
  }
])

const auditModal = ref({
  visible: false,
  type: 'approve',
  remark: '',
  target: null,
  itemType: 'service'
})

const filteredServices = computed(() => {
  let list = serviceList.value

  if (serviceStatusFilter.value !== 'all') {
    list = list.filter(item => item.status === serviceStatusFilter.value)
  }

  if (serviceCategoryFilter.value) {
    list = list.filter(item => item.category === serviceCategoryFilter.value)
  }

  if (serviceSearchKeyword.value.trim()) {
    const keyword = serviceSearchKeyword.value.trim().toLowerCase()
    list = list.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.provider.toLowerCase().includes(keyword)
    )
  }

  servicePagination.value.total = list.length
  return list
})

const filteredDemands = computed(() => {
  let list = demandList.value

  if (demandStatusFilter.value !== 'all') {
    list = list.filter(item => item.status === demandStatusFilter.value)
  }

  if (demandTypeFilter.value) {
    list = list.filter(item => item.type === demandTypeFilter.value)
  }

  if (demandSearchKeyword.value.trim()) {
    const keyword = demandSearchKeyword.value.trim().toLowerCase()
    list = list.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.publisher.toLowerCase().includes(keyword)
    )
  }

  demandPagination.value.total = list.length
  return list
})

const servicePendingCount = computed(() => serviceList.value.filter(s => s.status === 'pending').length)
const demandPendingCount = computed(() => demandList.value.filter(d => d.status === 'pending').length)
const approvedCount = computed(() => 
  serviceList.value.filter(s => s.status === 'approved').length + 
  demandList.value.filter(d => d.status === 'approved').length
)
const rejectedCount = computed(() => 
  serviceList.value.filter(s => s.status === 'rejected').length + 
  demandList.value.filter(d => d.status === 'rejected').length
)

const viewDetail = (record, type) => {
  message.info(`查看${type === 'service' ? '服务' : '需求'}详情：${record.name || record.title}`)
}

const openAuditModal = (record, type, itemType) => {
  auditModal.value = {
    visible: true,
    type,
    remark: '',
    target: record,
    itemType
  }
}

const handleAudit = () => {
  if (auditModal.value.type === 'reject' && !auditModal.value.remark.trim()) {
    message.warning('请填写驳回原因')
    return
  }

  const target = auditModal.value.target
  if (target) {
    target.status = auditModal.value.type === 'approve' ? 'approved' : 'rejected'
    message.success(auditModal.value.type === 'approve' ? '审核通过' : '已驳回')
  }

  auditModal.value.visible = false
}

const offlineItem = (record, type) => {
  record.status = 'rejected'
  message.success(`${type === 'service' ? '服务' : '需求'}已下架`)
}
</script>

<style scoped>
.goods-management-page { display: flex; flex-direction: column; gap: 16px; height: 100%; }

.page-header { background: #fff; border-radius: 8px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; color: #333; margin: 0; }

.header-stats { display: flex; gap: 32px; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-label { font-size: 12px; color: #999; }
.stat-value { font-size: 20px; font-weight: 700; }
.stat-value.pending { color: #fa8c16; }
.stat-value.success { color: #52c41a; }
.stat-value.danger { color: #ff4d4f; }

.management-tabs { background: #fff; border-radius: 8px; padding: 0 24px; flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.management-tabs :deep(.ant-tabs-nav) { margin-bottom: 0; }
.management-tabs :deep(.ant-tabs-content-holder) { overflow: auto; }

.filter-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
.filter-left :deep(.ant-tabs-nav) { margin: 0; }
.filter-left :deep(.ant-tabs-nav::before) { border: none; }
.filter-right { display: flex; gap: 12px; align-items: center; }

.goods-info { display: flex; gap: 12px; align-items: center; }
.goods-cover { width: 60px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.demand-icon { width: 60px; height: 45px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 6px; flex-shrink: 0; }
.goods-detail { flex: 1; min-width: 0; }
.goods-name { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.goods-desc { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.provider-info { display: flex; align-items: center; gap: 8px; }

.price-text { font-size: 15px; font-weight: 600; color: #ff4d4f; }

.action-buttons { display: flex; gap: 4px; }
</style>
