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

    <!-- 文章管理 -->
    <div v-if="activeTab === 'articles'" class="tab-content">
      <div class="sub-tabs">
        <button
          v-for="s in articleSubTabs"
          :key="s.key"
          :class="['sub-tab-btn', articleSub === s.key && 'sub-tab-btn--active']"
          @click="articleSub = s.key"
        >{{ s.label }}</button>
      </div>

      <!-- 文章列表 -->
      <div v-if="articleSub === 'list'">
        <div class="toolbar">
          <input v-model="articleSearch" class="search-input" placeholder="搜索标题 / 作者" />
          <button class="btn-primary" @click="">搜索</button>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>标题</th><th>作者</th><th>分类</th><th>状态</th><th>发布时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in articleList" :key="a.id">
              <td>{{ a.title }}</td>
              <td>{{ a.author }}</td>
              <td>{{ a.category }}</td>
              <td>
                <span :class="['status-tag', a.top ? 'status-tag--purple' : 'status-tag--gray']">
                  {{ a.top ? '已置顶' : '普通' }}
                </span>
              </td>
              <td>{{ a.publishAt }}</td>
              <td class="action-cell">
                <button class="btn-link" @click="">编辑</button>
                <button class="btn-link btn-link--red" @click="deleteArticle(a)">删除</button>
                <button class="btn-link" @click="toggleTop(a)">{{ a.top ? '取消置顶' : '置顶' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 文章审核 -->
      <div v-if="articleSub === 'audit'">
        <table class="data-table">
          <thead>
            <tr><th>标题</th><th>作者</th><th>提交时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in pendingArticles" :key="a.id">
              <td>{{ a.title }}</td>
              <td>{{ a.author }}</td>
              <td>{{ a.submitAt }}</td>
              <td class="action-cell">
                <button class="btn-link" @click="viewArticleDetail(a)">详情</button>
                <button class="btn-success" @click="openAudit(a, 'pass')">通过</button>
                <button class="btn-danger" @click="openAudit(a, 'reject')">驳回</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分类管理 -->
    <div v-if="activeTab === 'categories'" class="tab-content">
      <div class="category-section" v-for="group in categoryGroups" :key="group.key">
        <div class="section-header">
          <span class="section-title">{{ group.label }}</span>
          <button class="btn-primary" @click="openAddCategory(group.key)">+ 新增分类</button>
        </div>
        <div class="tree-list">
          <div class="tree-item" v-for="cat in group.items" :key="cat.id">
            <span class="tree-icon">📁</span>
            <span class="tree-name">{{ cat.name }}</span>
            <div class="tree-actions">
              <button class="btn-link" @click="editCategory(cat)">编辑</button>
              <button class="btn-link btn-link--red" @click="deleteCategory(cat)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告管理 -->
    <div v-if="activeTab === 'notices'" class="tab-content">
      <!-- 顶部操作栏 -->
      <div class="notice-header">
        <a-tabs v-model:activeKey="noticeStatusTab" size="small" class="notice-tabs">
          <a-tab-pane key="all" tab="全部公告" />
          <a-tab-pane key="active" tab="生效中" />
          <a-tab-pane key="expired" tab="已过期" />
        </a-tabs>
        <div class="notice-actions">
          <a-input-search
            v-model:value="noticeSearch"
            placeholder="搜索公告标题"
            style="width: 200px"
            size="small"
          />
          <a-button type="primary" size="small" @click="openNoticeForm(null)">
            + 新增公告
          </a-button>
        </div>
      </div>

      <!-- 公告表格 -->
      <a-table
        :columns="noticeColumns"
        :data-source="filteredNotices"
        :pagination="noticePagination"
        :row-key="record => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div class="notice-title-cell">
              <div class="notice-title-text">{{ record.title }}</div>
              <div class="notice-content-preview">{{ record.content }}</div>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.active ? 'green' : 'default'" size="small">
              {{ record.active ? '生效中' : '已过期' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button type="link" size="small" @click="viewNotice(record)">详情</a-button>
              <a-button type="link" size="small" @click="openNoticeForm(record)">编辑</a-button>
              <a-popconfirm
                title="确认删除该公告？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="deleteNotice(record)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 审核弹窗 -->
    <div v-if="auditModal.show" class="modal-mask" @click.self="auditModal.show = false">
      <div class="modal">
        <div class="modal-title">{{ auditModal.type === 'pass' ? '通过审核' : '驳回审核' }}</div>
        <textarea v-model="auditModal.remark" class="modal-textarea"
          :placeholder="auditModal.type === 'pass' ? '备注（选填）' : '驳回原因（必填）'"></textarea>
        <div class="modal-footer">
          <button class="btn-default" @click="auditModal.show = false">取消</button>
          <button :class="auditModal.type === 'pass' ? 'btn-success' : 'btn-danger'" @click="submitAudit">确认</button>
        </div>
      </div>
    </div>

    <!-- 公告表单弹窗 -->
    <a-modal
      v-model:open="noticeForm.show"
      :title="noticeForm.id ? '编辑公告' : '新增公告'"
      @ok="submitNotice"
      ok-text="保存"
      cancel-text="取消"
      width="600px"
    >
      <a-form layout="vertical" style="margin-top: 16px">
        <a-form-item label="公告标题" required>
          <a-input v-model:value="noticeForm.title" placeholder="请输入公告标题" :maxlength="100" show-count />
        </a-form-item>
        <a-form-item label="公告内容" required>
          <a-textarea
            v-model:value="noticeForm.content"
            placeholder="请输入公告内容"
            :rows="6"
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="生效时间" required>
          <a-date-picker
            v-model:value="noticeForm.effectAt"
            style="width: 100%"
            placeholder="选择生效时间"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="noticeForm.active" checked-children="生效" un-checked-children="关闭" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const tabs = [
  { key: 'articles', label: '文章管理' },
  { key: 'categories', label: '分类管理' },
  { key: 'notices', label: '公告管理' }
]
const activeTab = ref('articles')

const articleSubTabs = [
  { key: 'list', label: '文章列表' },
  { key: 'audit', label: '文章审核' }
]
const articleSub = ref('list')
const articleSearch = ref('')

const articleList = ref([
  { id: 1, title: 'Vue3最佳实践', author: '张三', category: '前端', top: true, publishAt: '2025-05-20' },
  { id: 2, title: 'Python异步编程', author: '李四', category: '后端', top: false, publishAt: '2025-05-22' }
])

const pendingArticles = ref([
  { id: 3, title: 'Docker入门指南', author: '王五', submitAt: '2025-06-01' },
  { id: 4, title: 'MySQL优化技巧', author: '赵六', submitAt: '2025-06-02' }
])

const categoryGroups = ref([
  {
    key: 'service',
    label: '服务 / 需求分类',
    items: [
      { id: 1, name: '前端开发' },
      { id: 2, name: '后端开发' },
      { id: 3, name: 'UI设计' }
    ]
  },
  {
    key: 'article',
    label: '文章分类',
    items: [
      { id: 4, name: '技术教程' },
      { id: 5, name: '行业资讯' }
    ]
  }
])

const noticeStatusTab = ref('all')
const noticeSearch = ref('')

const noticeColumns = [
  { title: '公告编号', dataIndex: 'id', key: 'id', width: '10%' },
  { title: '公告标题', key: 'title', width: '35%' },
  { title: '状态', key: 'status', width: '10%' },
  { title: '创建时间', dataIndex: 'publishAt', key: 'publishAt', width: '15%' },
  { title: '生效时间', dataIndex: 'effectAt', key: 'effectAt', width: '15%' },
  { title: '操作', key: 'action', width: '15%' }
]

const noticePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const noticeList = ref([
  { 
    id: 1, 
    title: '建好网站公告：2018-07-01 系统更新维护通知', 
    content: '为了提升系统性能和用户体验，我们将在2018年7月1日进行系统维护更新...',
    active: true, 
    effectAt: '2026-03-01', 
    publishAt: '2026-02-28 17:03:40' 
  },
  { 
    id: 2, 
    title: '平台功能升级公告', 
    content: '平台将新增多项功能，包括智能推荐、数据分析等，敬请期待...',
    active: true, 
    effectAt: '2026-03-05', 
    publishAt: '2026-03-04 10:20:15' 
  },
  { 
    id: 3, 
    title: '春节放假通知', 
    content: '春节期间客服工作时间调整通知，祝大家新春快乐...',
    active: false, 
    effectAt: '2026-01-28', 
    publishAt: '2026-01-20 09:30:00' 
  }
])

const auditModal = reactive({ show: false, type: '', remark: '', target: null })
const noticeForm = reactive({ 
  show: false, 
  id: null, 
  title: '', 
  content: '', 
  effectAt: '', 
  active: true 
})

const filteredNotices = computed(() => {
  let list = noticeList.value

  if (noticeStatusTab.value === 'active') {
    list = list.filter(n => n.active)
  } else if (noticeStatusTab.value === 'expired') {
    list = list.filter(n => !n.active)
  }

  if (noticeSearch.value.trim()) {
    const keyword = noticeSearch.value.trim().toLowerCase()
    list = list.filter(n => n.title.toLowerCase().includes(keyword))
  }

  noticePagination.value.total = list.length
  return list
})

const toggleTop = (a) => { a.top = !a.top }
const deleteArticle = (a) => { 
  if (confirm('确认删除？')) {
    articleList.value = articleList.value.filter(x => x.id !== a.id)
  }
}

const openAudit = (item, type) => {
  auditModal.show = true; auditModal.type = type; auditModal.remark = ''; auditModal.target = item
}
const submitAudit = () => {
  if (auditModal.type === 'reject' && !auditModal.remark.trim()) { alert('请填写驳回原因'); return }
  auditModal.show = false
}

const viewArticleDetail = (article) => {
  message.info(`查看文章详情：${article.title}`)
}

const openAddCategory = (groupKey) => { alert(`新增 ${groupKey} 分类`) }
const editCategory = (cat) => { alert(`编辑分类：${cat.name}`) }
const deleteCategory = (cat) => { alert(`删除分类：${cat.name}`) }

const viewNotice = (notice) => {
  message.info(`查看公告详情：${notice.title}`)
}

const openNoticeForm = (n) => {
  noticeForm.show = true
  noticeForm.id = n?.id || null
  noticeForm.title = n?.title || ''
  noticeForm.content = n?.content || ''
  noticeForm.effectAt = n?.effectAt || ''
  noticeForm.active = n?.active ?? true
}

const submitNotice = () => {
  if (!noticeForm.title.trim()) {
    message.warning('请输入公告标题')
    return
  }
  if (!noticeForm.content.trim()) {
    message.warning('请输入公告内容')
    return
  }
  if (!noticeForm.effectAt) {
    message.warning('请选择生效时间')
    return
  }

  if (noticeForm.id) {
    const notice = noticeList.value.find(n => n.id === noticeForm.id)
    if (notice) {
      notice.title = noticeForm.title
      notice.content = noticeForm.content
      notice.effectAt = noticeForm.effectAt
      notice.active = noticeForm.active
      message.success('公告已更新')
    }
  } else {
    noticeList.value.unshift({
      id: Date.now(),
      title: noticeForm.title,
      content: noticeForm.content,
      effectAt: noticeForm.effectAt,
      active: noticeForm.active,
      publishAt: new Date().toLocaleString('zh-CN')
    })
    message.success('公告已创建')
  }

  noticeForm.show = false
}

const deleteNotice = (notice) => {
  noticeList.value = noticeList.value.filter(n => n.id !== notice.id)
  message.success('公告已删除')
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.tabs { display: flex; gap: 4px; border-bottom: 2px solid #e8e8e8; }
.tab-btn { padding: 10px 20px; border: none; background: none; font-size: 14px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.tab-btn--active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 600; }

.tab-content { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 16px; }

.sub-tabs { display: flex; gap: 8px; }
.sub-tab-btn { padding: 6px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 20px; font-size: 13px; cursor: pointer; color: #555; transition: all 0.2s; }
.sub-tab-btn--active { background: #4f46e5; color: #fff; border-color: #4f46e5; }

.toolbar { display: flex; gap: 10px; }
.search-input { padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; width: 260px; outline: none; }
.search-input:focus { border-color: #4f46e5; }

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: #f8f8f8; padding: 10px 12px; text-align: left; color: #555; font-weight: 600; border-bottom: 1px solid #e8e8e8; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.data-table tr:last-child td { border-bottom: none; }
.action-cell { display: flex; gap: 8px; align-items: center; }

.category-section { display: flex; flex-direction: column; gap: 12px; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a2e; }

.tree-list { display: flex; flex-direction: column; gap: 4px; }
.tree-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8f8f8; border-radius: 6px; }
.tree-icon { font-size: 16px; }
.tree-name { flex: 1; font-size: 14px; color: #333; }
.tree-actions { display: flex; gap: 8px; }

.status-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status-tag--green { background: #dcfce7; color: #16a34a; }
.status-tag--gray { background: #f0f0f0; color: #888; }
.status-tag--purple { background: #ede9fe; color: #7c3aed; }

.btn-primary { padding: 8px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-success { padding: 5px 12px; background: #16a34a; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-danger { padding: 5px 12px; background: #dc2626; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-default { padding: 5px 12px; background: #f0f0f0; color: #555; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-link { background: none; border: none; color: #4f46e5; cursor: pointer; font-size: 13px; padding: 0; }
.btn-link--red { color: #dc2626; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 10px; padding: 24px; width: 400px; }
.modal--wide { width: 520px; }
.modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.modal-textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; resize: none; box-sizing: border-box; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #555; font-weight: 500; }
.form-input { padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; outline: none; }
.form-input:focus { border-color: #4f46e5; }

.notice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.notice-tabs :deep(.ant-tabs-nav) { margin: 0; }
.notice-tabs :deep(.ant-tabs-nav::before) { border: none; }
.notice-actions { display: flex; gap: 12px; align-items: center; }

.notice-title-cell { display: flex; flex-direction: column; gap: 4px; }
.notice-title-text { font-size: 14px; font-weight: 600; color: #333; }
.notice-content-preview { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 400px; }

.action-buttons { display: flex; gap: 4px; }
</style>
