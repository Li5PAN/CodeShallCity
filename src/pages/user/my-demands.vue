<template>
  <div class="my-demands-page">
    <div class="page-header">
      <h2 class="page-title">我的悬赏</h2>
      <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="openDrawer()">
        <PlusOutlined /> 发布悬赏
      </a-button>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-num" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <a-tabs v-model:activeKey="statusFilter" class="status-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="open" tab="招募中" />
        <a-tab-pane key="progress" tab="进行中" />
        <a-tab-pane key="done" tab="已完成" />
        <a-tab-pane key="closed" tab="已关闭" />
      </a-tabs>
      <a-input-search v-model:value="searchKeyword" placeholder="搜索悬赏标题" style="width:220px" />
    </div>

    <!-- 列表 -->
    <div class="demand-list">
      <div v-if="filteredList.length === 0" class="empty-state">
        <TrophyOutlined style="font-size:48px;color:#e0e0e0" />
        <p>暂无悬赏需求，点击右上角发布</p>
      </div>

      <div class="demand-item" v-for="item in filteredList" :key="item.id">
        <div class="demand-main">
          <div class="demand-title">{{ item.title }}</div>
          <div class="demand-desc">{{ item.desc }}</div>
          <div class="demand-tags">
            <a-tag size="small" color="orange">{{ item.category }}</a-tag>
            <a-tag v-for="tag in item.tags" :key="tag" size="small">{{ tag }}</a-tag>
          </div>
          <div class="demand-meta">
            <span>发布时间：{{ item.publishTime }}</span>
            <span>截止时间：{{ item.deadline }}</span>
            <span>报名人数：<strong>{{ item.applyCount }}</strong> 人</span>
          </div>
        </div>
        <div class="demand-right">
          <div class="demand-budget">¥ {{ item.budget }}</div>
          <div class="demand-status">
            <a-badge :status="statusMap[item.status].badge" :text="statusMap[item.status].text" />
          </div>
          <div class="demand-actions">
            <a-button size="small" @click="openDrawer(item)">编辑</a-button>
            <a-button size="small" v-if="item.status === 'open'" @click="item.status = 'closed'; message.success('已关闭')">关闭</a-button>
            <a-popconfirm title="确认删除？" ok-text="删除" cancel-text="取消" @confirm="deleteItem(item.id)">
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布/编辑抽屉 -->
    <a-drawer v-model:open="drawerVisible" :title="editingItem ? '编辑悬赏' : '发布悬赏'" placement="right" width="480">
      <a-form layout="vertical">
        <a-form-item label="悬赏标题" required>
          <a-input v-model:value="form.title" placeholder="请输入悬赏标题" :maxlength="80" show-count />
        </a-form-item>
        <a-form-item label="需求描述" required>
          <a-textarea v-model:value="form.desc" :rows="4" placeholder="详细描述需求内容、技术要求、交付标准等" :maxlength="500" show-count />
        </a-form-item>
        <a-form-item label="需求分类" required>
          <a-select v-model:value="form.category" placeholder="请选择分类" style="width:100%">
            <a-select-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="悬赏金额（元）" required>
          <a-input-number v-model:value="form.budget" :min="100" :max="999999" style="width:100%" placeholder="请输入金额" />
        </a-form-item>
        <a-form-item label="截止时间">
          <a-date-picker v-model:value="form.deadline" style="width:100%" placeholder="请选择截止日期" />
        </a-form-item>
        <a-form-item label="技术标签">
          <div class="tag-input-wrap">
            <a-tag v-for="tag in form.tags" :key="tag" closable @close="removeTag(tag)" color="orange">{{ tag }}</a-tag>
            <a-input v-if="tagInputVisible" ref="tagInputRef" v-model:value="tagInputValue" size="small" style="width:80px" @blur="confirmTag" @keyup.enter="confirmTag" />
            <a-tag v-else-if="form.tags.length < 5" style="cursor:pointer;border-style:dashed" @click="showTagInput"><PlusOutlined /> 添加</a-tag>
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="handleSubmit">
            {{ editingItem ? '保存修改' : '发布悬赏' }}
          </a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, TrophyOutlined } from '@ant-design/icons-vue'

const route = useRoute()

const statusFilter = ref('all')
const searchKeyword = ref('')
const drawerVisible = ref(false)
const editingItem = ref(null)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

const categories = ['人工智能', 'Java', 'Python', 'Vue/React', '移动开发', '数据库', '运维部署', '大数据', '其他']

const statusMap = {
  open:     { badge: 'success', text: '招募中' },
  progress: { badge: 'processing', text: '进行中' },
  done:     { badge: 'default', text: '已完成' },
  closed:   { badge: 'error', text: '已关闭' }
}

const statCards = ref([
  { label: '发布总数', value: 4, color: '#1890ff' },
  { label: '招募中', value: 2, color: '#52c41a' },
  { label: '进行中', value: 1, color: '#fa8c16' },
  { label: '已完成', value: 1, color: '#722ed1' }
])

const demands = ref([
  { id: 1, title: 'MiniMax-M2.1 智能客服系统开发', desc: '需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别、知识库接入', budget: '3800.00', category: '人工智能', tags: ['Python', 'LLM'], status: 'open', applyCount: 12, publishTime: '2026-03-03', deadline: '2026-03-31' },
  { id: 2, title: 'React Native 跨平台移动端应用开发', desc: '开发一款电商类App，需要支持iOS和Android双端，包含商品浏览、购物车、支付功能', budget: '12000.00', category: '移动开发', tags: ['React Native', 'TypeScript'], status: 'progress', applyCount: 7, publishTime: '2026-02-28', deadline: '2026-04-15' },
  { id: 3, title: 'MySQL 数据库性能优化咨询', desc: '现有系统查询慢，需要专业DBA对数据库进行诊断和优化，提供优化报告', budget: '2000.00', category: '数据库', tags: ['MySQL', '性能优化'], status: 'done', applyCount: 5, publishTime: '2026-02-10', deadline: '2026-02-28' },
  { id: 4, title: 'Vue3 后台管理系统开发', desc: '基于Vue3+Element Plus开发一套通用后台管理系统，包含权限管理、数据可视化', budget: '8000.00', category: 'Vue/React', tags: ['Vue3', 'TypeScript'], status: 'open', applyCount: 9, publishTime: '2026-03-01', deadline: '2026-04-01' }
])

const form = reactive({ title: '', desc: '', category: undefined, budget: null, deadline: null, tags: [] })

const filteredList = computed(() => {
  let list = demands.value
  if (statusFilter.value !== 'all') list = list.filter(d => d.status === statusFilter.value)
  if (searchKeyword.value.trim()) list = list.filter(d => d.title.includes(searchKeyword.value.trim()))
  return list
})

const openDrawer = (item = null) => {
  editingItem.value = item
  if (item) Object.assign(form, { title: item.title, desc: item.desc, category: item.category, budget: parseFloat(item.budget), deadline: null, tags: [...item.tags] })
  else Object.assign(form, { title: '', desc: '', category: undefined, budget: null, deadline: null, tags: [] })
  drawerVisible.value = true
}

const handleSubmit = () => {
  if (!form.title.trim()) { message.warning('请输入悬赏标题'); return }
  if (!form.category) { message.warning('请选择需求分类'); return }
  if (!form.budget) { message.warning('请输入悬赏金额'); return }
  if (editingItem.value) {
    const idx = demands.value.findIndex(d => d.id === editingItem.value.id)
    if (idx !== -1) Object.assign(demands.value[idx], { title: form.title, desc: form.desc, category: form.category, budget: form.budget.toFixed(2), tags: [...form.tags] })
    message.success('修改已保存')
  } else {
    demands.value.unshift({ id: Date.now(), title: form.title, desc: form.desc, budget: form.budget.toFixed(2), category: form.category, tags: [...form.tags], status: 'open', applyCount: 0, publishTime: new Date().toISOString().slice(0, 10), deadline: '待定' })
    statCards.value[0].value++
    statCards.value[1].value++
    message.success('悬赏发布成功')
  }
  drawerVisible.value = false
}

const deleteItem = (id) => {
  demands.value = demands.value.filter(d => d.id !== id)
  statCards.value[0].value = demands.value.length
  message.success('已删除')
}

const showTagInput = () => { tagInputVisible.value = true; nextTick(() => tagInputRef.value?.focus()) }
const confirmTag = () => {
  const val = tagInputValue.value.trim()
  if (val && !form.tags.includes(val)) form.tags.push(val)
  tagInputVisible.value = false; tagInputValue.value = ''
}
const removeTag = (tag) => { form.tags = form.tags.filter(t => t !== tag) }

onMounted(() => { if (route.query.action === 'create') openDrawer() })
</script>

<style scoped>
.my-demands-page { width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #333; margin: 0; }

.stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-card { flex: 1; background: #fff; border-radius: 8px; padding: 16px 20px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: #999; }

.filter-bar { background: #fff; border-radius: 8px 8px 0 0; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.status-tabs :deep(.ant-tabs-nav) { margin: 0; }
.status-tabs :deep(.ant-tabs-nav::before) { border: none; }
.status-tabs :deep(.ant-tabs-nav-operations) { display: none !important; }

.demand-list { background: #fff; border-radius: 0 0 8px 8px; }
.empty-state { padding: 60px; text-align: center; color: #ccc; display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 14px; }

.demand-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; }
.demand-item:last-child { border-bottom: none; }
.demand-main { flex: 1; min-width: 0; }
.demand-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 6px; }
.demand-desc { font-size: 13px; color: #999; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.demand-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.demand-meta { display: flex; gap: 20px; font-size: 12px; color: #bbb; }
.demand-meta strong { color: #fa8c16; }

.demand-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 120px; }
.demand-budget { font-size: 20px; font-weight: 700; color: #ff4d4f; }
.demand-actions { display: flex; gap: 6px; }

.tag-input-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
</style>
