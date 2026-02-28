<template>
  <div class="my-services-page">
    <div class="page-header">
      <h2 class="page-title">我的服务</h2>
      <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="openPublishDrawer()">
        <PlusOutlined /> 发布新服务
      </a-button>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-num" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- 筛选 + 搜索 -->
    <div class="filter-bar">
      <a-tabs v-model:activeKey="statusFilter" class="status-tabs" @change="onStatusChange">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="on" tab="已上架" />
        <a-tab-pane key="off" tab="已下架" />
        <a-tab-pane key="review" tab="审核中" />
      </a-tabs>
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="搜索服务名称"
        style="width:220px"
        @search="onSearch"
      />
    </div>

    <!-- 服务列表 -->
    <div class="service-list">
      <div v-if="filteredList.length === 0" class="empty-state">
        <ShopOutlined style="font-size:48px;color:#e0e0e0" />
        <p>暂无服务，点击右上角发布新服务</p>
      </div>

      <div class="service-item" v-for="item in filteredList" :key="item.id">
        <img :src="item.cover" class="service-cover" />
        <div class="service-info">
          <div class="service-title">{{ item.title }}</div>
          <div class="service-desc">{{ item.desc }}</div>
          <div class="service-tags">
            <a-tag v-for="tag in item.tags" :key="tag" size="small" color="blue">{{ tag }}</a-tag>
            <a-tag size="small" color="orange">{{ item.category }}</a-tag>
          </div>
          <div class="service-meta">
            <span>创建时间：{{ item.createTime }}</span>
            <span>更新时间：{{ item.updateTime }}</span>
          </div>
        </div>
        <div class="service-data">
          <div class="data-item">
            <div class="data-num">{{ item.orders }}</div>
            <div class="data-label">成交订单</div>
          </div>
          <div class="data-item">
            <div class="data-num">{{ item.views }}</div>
            <div class="data-label">浏览量</div>
          </div>
          <div class="data-item">
            <div class="data-num">{{ item.rating }}</div>
            <div class="data-label">评分</div>
          </div>
        </div>
        <div class="service-price">¥ {{ item.price }}</div>
        <div class="service-status">
          <a-badge
            :status="statusMap[item.status].badge"
            :text="statusMap[item.status].text"
          />
        </div>
        <div class="service-actions">
          <a-button size="small" @click="openPublishDrawer(item)">编辑</a-button>
          <a-button
            size="small"
            :type="item.status === 'on' ? 'default' : 'primary'"
            :danger="item.status === 'on'"
            :disabled="item.status === 'review'"
            @click="toggleStatus(item)"
          >
            {{ item.status === 'on' ? '下架' : '上架' }}
          </a-button>
          <a-popconfirm title="确认删除该服务？" ok-text="删除" cancel-text="取消" @confirm="deleteService(item.id)">
            <a-button size="small" danger>删除</a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>

    <!-- 发布/编辑服务抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="editingItem ? '编辑服务' : '发布新服务'"
      placement="right"
      width="480"
    >
      <a-form layout="vertical">
        <a-form-item label="服务标题" required>
          <a-input v-model:value="form.title" placeholder="请输入服务标题，建议20字以内" :maxlength="50" show-count />
        </a-form-item>
        <a-form-item label="服务描述" required>
          <a-textarea v-model:value="form.desc" :rows="3" placeholder="简要描述服务内容" :maxlength="200" show-count />
        </a-form-item>
        <a-form-item label="服务分类" required>
          <a-select v-model:value="form.category" placeholder="请选择分类" style="width:100%">
            <a-select-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="服务价格（元）" required>
          <a-input-number v-model:value="form.price" :min="1" :max="99999" style="width:100%" placeholder="请输入价格" />
        </a-form-item>
        <a-form-item label="服务标签">
          <div class="tag-input-wrap">
            <a-tag v-for="tag in form.tags" :key="tag" closable @close="removeTag(tag)" color="blue">{{ tag }}</a-tag>
            <a-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model:value="tagInputValue"
              size="small"
              style="width:80px"
              @blur="confirmTag"
              @keyup.enter="confirmTag"
            />
            <a-tag v-else-if="form.tags.length < 5" style="cursor:pointer;border-style:dashed" @click="showTagInput">
              <PlusOutlined /> 添加标签
            </a-tag>
          </div>
        </a-form-item>
        <a-form-item label="封面图片">
          <div class="cover-upload" @click="coverInputRef?.click()">
            <img v-if="form.coverUrl" :src="form.coverUrl" class="cover-preview" />
            <div v-else class="cover-placeholder">
              <PictureOutlined style="font-size:28px;color:#ccc" />
              <span>点击上传封面（推荐 4:3）</span>
            </div>
          </div>
          <input ref="coverInputRef" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
        </a-form-item>
        <a-form-item label="服务详情">
          <a-textarea v-model:value="form.detail" :rows="6" placeholder="详细描述服务内容、交付物、服务流程等" :maxlength="2000" show-count />
        </a-form-item>
        <a-form-item label="交付周期">
          <a-select v-model:value="form.deliveryDays" style="width:100%">
            <a-select-option :value="1">1天内交付</a-select-option>
            <a-select-option :value="3">3天内交付</a-select-option>
            <a-select-option :value="7">7天内交付</a-select-option>
            <a-select-option :value="14">14天内交付</a-select-option>
            <a-select-option :value="30">30天内交付</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="handleSubmit">
            {{ editingItem ? '保存修改' : '提交审核' }}
          </a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ShopOutlined, PictureOutlined } from '@ant-design/icons-vue'

const statusFilter = ref('all')
const searchKeyword = ref('')
const drawerVisible = ref(false)
const editingItem = ref(null)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)
const coverInputRef = ref(null)

const categories = ['人工智能', 'Java', 'Python', 'Vue/React', '移动开发', '数据库', '运维部署', '大数据', '区块链', '其他']

const statusMap = {
  on:     { badge: 'success', text: '已上架' },
  off:    { badge: 'default', text: '已下架' },
  review: { badge: 'processing', text: '审核中' }
}

const statCards = ref([
  { label: '服务总数', value: 5, color: '#1890ff' },
  { label: '已上架', value: 3, color: '#52c41a' },
  { label: '累计成交', value: 286, color: '#ff4d4f' },
  { label: '累计收入', value: '¥ 12,480', color: '#fa8c16' },
  { label: '平均评分', value: '4.9', color: '#722ed1' }
])

const services = ref([
  { id: 1, title: 'Java大厂面试课，一套搞定offer', desc: '覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟', price: 399, cover: 'https://placehold.co/120x80/FFD700/000000?text=Java', tags: ['平台保障', '商家认证'], category: 'Java', status: 'on', orders: 128, views: '3.2k', rating: '4.9', createTime: '2026-01-10', updateTime: '2026-02-25' },
  { id: 2, title: 'Vue3 + TypeScript 企业级实战', desc: '从零搭建企业级前端项目，涵盖架构设计、性能优化、工程化实践', price: 299, cover: 'https://placehold.co/120x80/42b883/FFFFFF?text=Vue3', tags: ['平台保障'], category: 'Vue/React', status: 'on', orders: 86, views: '2.1k', rating: '4.8', createTime: '2026-01-20', updateTime: '2026-02-18' },
  { id: 3, title: 'Python 数据分析实战项目', desc: '基于真实业务数据，手把手带你完成数据清洗、分析、可视化全流程', price: 199, cover: 'https://placehold.co/120x80/3776AB/FFFFFF?text=Python', tags: ['一对一辅导'], category: 'Python', status: 'off', orders: 42, views: '980', rating: '4.7', createTime: '2025-12-05', updateTime: '2026-01-15' },
  { id: 4, title: 'Docker + K8s 容器化部署实战', desc: '从Docker基础到Kubernetes集群管理，企业级DevOps实践', price: 499, cover: 'https://placehold.co/120x80/0db7ed/FFFFFF?text=Docker', tags: ['平台保障', '源码解析'], category: '运维部署', status: 'review', orders: 0, views: '0', rating: '-', createTime: '2026-03-01', updateTime: '2026-03-01' },
  { id: 5, title: 'MySQL 性能优化深度实战', desc: '从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表', price: 349, cover: 'https://placehold.co/120x80/FF6600/FFFFFF?text=MySQL', tags: ['平台保障', '售后答疑'], category: '数据库', status: 'on', orders: 30, views: '1.5k', rating: '4.9', createTime: '2026-02-01', updateTime: '2026-02-20' }
])

const form = reactive({
  title: '', desc: '', category: undefined, price: null,
  tags: [], coverUrl: '', detail: '', deliveryDays: 7
})

const filteredList = computed(() => {
  let list = services.value
  if (statusFilter.value !== 'all') list = list.filter(s => s.status === statusFilter.value)
  if (searchKeyword.value.trim()) list = list.filter(s => s.title.includes(searchKeyword.value.trim()))
  return list
})

const onStatusChange = () => { searchKeyword.value = '' }
const onSearch = () => {}

const openPublishDrawer = (item = null) => {
  editingItem.value = item
  if (item) {
    Object.assign(form, { title: item.title, desc: item.desc, category: item.category, price: item.price, tags: [...item.tags], coverUrl: item.cover, detail: '', deliveryDays: 7 })
  } else {
    Object.assign(form, { title: '', desc: '', category: undefined, price: null, tags: [], coverUrl: '', detail: '', deliveryDays: 7 })
  }
  drawerVisible.value = true
}

const handleSubmit = () => {
  if (!form.title.trim()) { message.warning('请输入服务标题'); return }
  if (!form.category) { message.warning('请选择服务分类'); return }
  if (!form.price) { message.warning('请输入服务价格'); return }

  if (editingItem.value) {
    const idx = services.value.findIndex(s => s.id === editingItem.value.id)
    if (idx !== -1) {
      services.value[idx] = { ...services.value[idx], title: form.title, desc: form.desc, category: form.category, price: form.price, tags: [...form.tags], cover: form.coverUrl || services.value[idx].cover, updateTime: new Date().toISOString().slice(0, 10) }
    }
    message.success('修改已保存')
  } else {
    services.value.unshift({ id: Date.now(), title: form.title, desc: form.desc, price: form.price, cover: form.coverUrl || `https://placehold.co/120x80/52c41a/FFFFFF?text=新服务`, tags: form.tags, category: form.category, status: 'review', orders: 0, views: '0', rating: '-', createTime: new Date().toISOString().slice(0, 10), updateTime: new Date().toISOString().slice(0, 10) })
    statCards.value[0].value++
    message.success('已提交审核，审核通过后自动上架')
  }
  drawerVisible.value = false
}

const toggleStatus = (item) => {
  item.status = item.status === 'on' ? 'off' : 'on'
  statCards.value[1].value = services.value.filter(s => s.status === 'on').length
  message.success(item.status === 'on' ? '已上架' : '已下架')
}

const deleteService = (id) => {
  const idx = services.value.findIndex(s => s.id === id)
  if (idx !== -1) services.value.splice(idx, 1)
  statCards.value[0].value = services.value.length
  statCards.value[1].value = services.value.filter(s => s.status === 'on').length
  message.success('已删除')
}

const showTagInput = () => { tagInputVisible.value = true; nextTick(() => tagInputRef.value?.focus()) }
const confirmTag = () => {
  const val = tagInputValue.value.trim()
  if (val && !form.tags.includes(val)) form.tags.push(val)
  tagInputVisible.value = false
  tagInputValue.value = ''
}
const removeTag = (tag) => { form.tags = form.tags.filter(t => t !== tag) }

const onCoverChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { form.coverUrl = ev.target.result }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.my-services-page { width: 100%; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0; }

/* 统计卡片 */
.stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-card { flex: 1; background: #fff; border-radius: 8px; padding: 16px 20px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: #999; }

/* 筛选栏 */
.filter-bar { background: #fff; border-radius: 8px 8px 0 0; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.status-tabs { margin-bottom: 0; }
.status-tabs :deep(.ant-tabs-nav) { margin: 0; }
.status-tabs :deep(.ant-tabs-nav::before) { border: none; }
.status-tabs :deep(.ant-tabs-nav-operations) { display: none !important; }

/* 服务列表 */
.service-list { background: #fff; border-radius: 0 0 8px 8px; }
.empty-state { padding: 60px; text-align: center; color: #ccc; display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 14px; }

.service-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; }
.service-item:last-child { border-bottom: none; }

.service-cover { width: 120px; height: 80px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }

.service-info { flex: 1; min-width: 0; }
.service-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.service-desc { font-size: 13px; color: #999; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.service-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.service-meta { display: flex; gap: 16px; font-size: 12px; color: #bbb; }

.service-data { display: flex; gap: 20px; flex-shrink: 0; }
.data-item { text-align: center; }
.data-num { font-size: 16px; font-weight: 700; color: #333; }
.data-label { font-size: 12px; color: #999; margin-top: 2px; }

.service-price { font-size: 18px; font-weight: 700; color: #ff4d4f; flex-shrink: 0; width: 80px; text-align: right; }
.service-status { flex-shrink: 0; width: 70px; }
.service-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }

/* 抽屉表单 */
.tag-input-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cover-upload { width: 100%; height: 140px; border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s; }
.cover-upload:hover { border-color: #52c41a; }
.cover-preview { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #bbb; font-size: 13px; }
</style>
