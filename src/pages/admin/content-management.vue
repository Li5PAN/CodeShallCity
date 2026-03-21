<template>
  <div class="page">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', activeTab === tab.key && 'tab-btn--active']"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 文章管理 -->
    <div v-if="activeTab === 'articles'" class="tab-content">
      <div class="toolbar">
        <input
          v-model="articleSearch"
          class="search-input"
          placeholder="搜索标题 / 作者"
        />
        <button class="btn-default" @click="batchAudit('reject')" :disabled="selectedArticles.length === 0">批量驳回</button>
        <button class="btn-success" @click="batchAudit('pass')" :disabled="selectedArticles.length === 0">批量通过</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>标题</th>
            <th>作者</th>
            <th>分类</th>
            <th>审核状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filteredArticleList" :key="a.id">
            <td><input type="checkbox" v-model="selectedArticles" :value="a.id" /></td>
            <td>{{ a.title }}</td>
            <td>{{ a.author }}</td>
            <td>{{ a.category }}</td>
            <td>
              <span
                :class="[
                  'status-tag',
                  a.status === 'approved' ? 'status-tag--green' :
                  a.status === 'rejected' ? 'status-tag--red' : 'status-tag--gray',
                ]"
              >
                {{ a.status === 'approved' ? '已通过' : a.status === 'rejected' ? '已驳回' : '待审核' }}
              </span>
            </td>
            <td>{{ a.publishAt }}</td>
            <td class="action-cell">
              <button class="btn-link" @click="viewArticleDetail(a)">查看</button>
              <button class="btn-link btn-link--red" @click="deleteArticle(a)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分类管理 -->
    <div v-if="activeTab === 'categories'" class="tab-content">
      <div class="category-mgmt-top">
        <div class="category-mgmt-top-left">
          <span class="section-title">分类管理</span>
          <div class="forum-cat-beside">
            <span class="forum-cat-beside-label">论坛管理</span>
            <!-- <span
              v-for="c in forumCategories"
              :key="c.id"
              class="forum-cat-chip"
            >{{ c.name }}</span> -->
          </div>
        </div>
        <button type="button" class="btn-primary" @click="openForumCategoryModal('add')">
          + 新增
        </button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>分类名称</th>
            <th>分类描述</th>
            <th>版主</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in forumCategories" :key="cat.id">
            <td>{{ cat.name }}</td>
            <td>{{ cat.description || '—' }}</td>
            <td>{{ formatModeratorSummary(cat.moderators) }}</td>
            <td class="action-cell">
              <button type="button" class="btn-link" @click="openForumCategoryModal('edit', cat)">编辑</button>
              <button type="button" class="btn-link btn-link--red" @click="deleteForumCategory(cat)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="category-section category-section--service">
        <div class="section-header">
          <span class="section-title">服务 / 需求分类</span>
          <button type="button" class="btn-primary" @click="openAddServiceCategory">
            + 新增
          </button>
        </div>
        <div class="tree-list">
          <div class="tree-item" v-for="cat in serviceCategories" :key="cat.id">
            <span class="tree-icon">📁</span>
            <span class="tree-name">{{ cat.name }}</span>
            <div class="tree-actions">
              <button type="button" class="btn-link" @click="editServiceCategory(cat)">编辑</button>
              <button type="button" class="btn-link btn-link--red" @click="deleteServiceCategory(cat)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 论坛分类：新建 / 编辑 -->
    <a-modal
      v-model:open="forumCatModal.open"
      :title="forumCatModal.mode === 'add' ? '新建分类' : '编辑分类'"
      :width="560"
      :footer="null"
      destroy-on-close
      @cancel="closeForumCategoryModal"
    >
      <div class="forum-cat-form">
        <div class="forum-cat-form-item">
          <label class="forum-cat-label"><span class="forum-cat-req">*</span>分类名称</label>
          <a-input
            v-model:value="forumCatModal.name"
            placeholder="请输入分类名称"
            allow-clear
          />
        </div>
        <div class="forum-cat-form-item">
          <label class="forum-cat-label">分类描述</label>
          <a-textarea
            v-model:value="forumCatModal.description"
            placeholder="请输入分类描述（选填）"
            :rows="4"
            allow-clear
          />
        </div>
        <div class="forum-cat-form-item">
          <label class="forum-cat-label">版主及权限设置</label>
          <div
            v-if="forumCatModal.moderators.length === 0"
            class="forum-mod-empty"
          >
            暂无版主，请从下方添加
          </div>
          <div v-else class="forum-mod-list">
            <div
              v-for="m in forumCatModal.moderators"
              :key="m._key"
              class="forum-mod-list-row"
            >
              <span class="forum-mod-name">{{ m.userName }}</span>
              <span v-if="m.canDelete" class="forum-mod-badge">删帖</span>
              <span v-if="m.canPin" class="forum-mod-badge">置顶</span>
              <button type="button" class="btn-link btn-link--small" @click="removeForumModeratorRow(m._key)">移除</button>
            </div>
          </div>
          <div class="forum-mod-add">
            <a-select
              v-model:value="forumCatModal.pendingUserId"
              placeholder="选择用户"
              allow-clear
              class="forum-mod-select"
              :options="moderatorUserOptionsFiltered"
            />
            <a-checkbox v-model:checked="forumCatModal.pendingCanDelete">默认删帖权限</a-checkbox>
            <a-checkbox v-model:checked="forumCatModal.pendingCanPin">默认置顶权限</a-checkbox>
            <a-button type="primary" @click="addForumModeratorRow">添加版主</a-button>
          </div>
        </div>
      </div>
      <div class="forum-cat-modal-actions">
        <a-button @click="closeForumCategoryModal">取消</a-button>
        <a-button type="primary" @click="submitForumCategory">保存</a-button>
      </div>
    </a-modal>

    <!-- 审核弹窗 -->
    <div
      v-if="auditModal.show"
      class="modal-mask"
      @click.self="auditModal.show = false"
    >
      <div class="modal">
        <div class="modal-title">
          {{ auditModal.type === "pass" ? "通过审核" : "驳回审核" }}
        </div>
        <textarea
          v-model="auditModal.remark"
          class="modal-textarea"
          :placeholder="
            auditModal.type === 'pass' ? '备注（选填）' : '驳回原因（必填）'
          "
          :style="{ borderColor: auditModal.type === 'reject' ? '#dc2626' : '#e0e0e0' }"
        ></textarea>
        <div class="modal-footer">
          <button class="btn-default" @click="auditModal.show = false">
            取消
          </button>
          <button
            :class="auditModal.type === 'pass' ? 'btn-success' : 'btn-danger'"
            @click="submitAudit"
          >
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 批量驳回弹窗 -->
    <div
      v-if="batchRejectModal.show"
      class="modal-mask"
      @click.self="batchRejectModal.show = false"
    >
      <div class="modal">
        <div class="modal-title">批量驳回</div>
        <div class="form-group">
          <label class="form-label">驳回原因（必填）</label>
          <textarea
            v-model="batchRejectModal.reason"
            class="modal-textarea"
            placeholder="请输入驳回原因"
            style="border-color: #dc2626"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="batchRejectModal.show = false">
            取消
          </button>
          <button class="btn-danger" @click="confirmBatchReject">
            确认驳回
          </button>
        </div>
      </div>
    </div>

    <!-- 文章详情弹窗 -->
    <div
      v-if="articleDetail.visible"
      class="modal-mask"
      @click.self="articleDetail.visible = false"
    >
      <div class="article-detail-modal" @click.stop>
        <div class="detail-header">
          <div class="detail-header-info">
            <h2 class="detail-title">{{ articleDetail.data?.title }}</h2>
            <div class="detail-meta">
              <div class="meta-author">
                <a-avatar :size="28" :style="{ backgroundColor: articleDetail.data?.authorColor }">
                  {{ articleDetail.data?.author?.[0] }}
                </a-avatar>
                <span class="author-name">{{ articleDetail.data?.author }}</span>
              </div>
              <span class="meta-sep">|</span>
              <span class="meta-time">{{ articleDetail.data?.publishAt }}</span>
            </div>
            <div class="detail-tags">
              <a-tag v-for="tag in articleDetail.data?.tags" :key="tag" color="blue" size="small">{{ tag }}</a-tag>
            </div>
          </div>
        </div>

        <a-divider style="margin: 16px 0" />

        <div class="detail-cover" v-if="articleDetail.data?.cover">
          <img :src="articleDetail.data?.cover" alt="封面" />
        </div>

        <div class="detail-content">
          <div class="article-body" v-html="formatContent(articleDetail.data?.content)"></div>
        </div>

        <a-divider style="margin: 16px 0" />

        <div class="detail-audit">
          <div class="audit-title">审核操作</div>
          <textarea
            v-model="auditModal.remark"
            class="modal-textarea"
            :placeholder="auditModal.type === 'reject' ? '驳回原因（必填）' : '备注（选填）'"
            style="border-color: #e0e0e0"
          ></textarea>
          <div class="audit-actions">
            <button class="btn-success" @click="submitAuditFromDetail('pass')">通过</button>
            <button class="btn-danger" @click="submitAuditFromDetail('reject')">驳回</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { Button, message, Modal } from "ant-design-vue";

const tabs = [
  { key: "articles", label: "文章管理" },
  { key: "categories", label: "分类管理" },
];
const activeTab = ref("articles");

const articleSearch = ref("");
const selectAll = ref(false);
const selectedArticles = ref([]);

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedArticles.value = filteredArticleList.value.map(a => a.id);
  } else {
    selectedArticles.value = [];
  }
};

// 过滤后的文章列表
const filteredArticleList = computed(() => {
  if (!articleSearch.value) return articleList.value;
  const keyword = articleSearch.value.toLowerCase();
  return articleList.value.filter(a =>
    a.title.toLowerCase().includes(keyword) ||
    a.author.toLowerCase().includes(keyword)
  );
});

const articleList = ref([
  {
    id: 1,
    title: "Vue3最佳实践",
    author: "张三",
    authorColor: "#1890ff",
    category: "前端",
    top: true,
    publishAt: "2025-05-20",
    readCount: "1.5k",
    likeCount: 128,
    collectCount: 45,
    cover: "https://placehold.co/120x90/42b883/FFFFFF?text=Vue3",
    content: `## 一、引言

Vue3 是 Vue.js 的最新主要版本，带来了众多新特性和性能提升。本文将深入探讨 Vue3 的最佳实践，帮助开发者更好地构建现代应用。

## 二、组合式 API

Vue3 引入了 Composition API，这是一种组织组件逻辑的新方式。相比于 Options API，组合式 API 提供了更好的逻辑复用性和类型推导支持。

### 2.1 setup 函数

\`\`\`javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)

    onMounted(() => {
      console.log('Component mounted')
    })

    return { count, doubleCount }
  }
}
\`\`\`

### 2.2 响应式系统

Vue3 的响应式系统基于 Proxy 实现，提供了更完善的响应式追踪。

## 三、性能优化

### 3.1 Tree Shaking

Vue3 支持 Tree Shaking，可以大幅减少打包体积。

### 3.2 懒加载组件

使用 \`defineAsyncComponent\` 实现组件懒加载。

## 四、总结

Vue3 带来了众多优秀特性，合理运用这些特性可以显著提升开发效率和用户体验。`,
    tags: ["Vue3", "前端", "JavaScript"]
  },
  {
    id: 2,
    title: "Python异步编程",
    author: "李四",
    authorColor: "#52c41a",
    category: "后端",
    top: false,
    publishAt: "2025-05-22",
    readCount: "2.3k",
    likeCount: 89,
    collectCount: 32,
    cover: "https://placehold.co/120x90/3776AB/FFFFFF?text=Python",
    content: `## 一、异步编程概述

异步编程是一种并发编程模式，允许在等待某些操作完成时执行其他任务。Python 提供了 asyncio 模块来支持异步编程。

## 二、async/await 语法

\`\`\`python
import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return {"data": "result"}

async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
\`\`\`

## 三、并发任务

使用 \`asyncio.gather\` 可以并发执行多个异步任务。

## 四、实践建议

1. 合理使用异步，避免过度封装
2. 注意异常处理
3. 使用连接池管理资源

## 五、总结

Python 的异步编程能力强大，掌握这些技能可以显著提升应用的并发性能。`,
    tags: ["Python", "后端", "异步编程"]
  },
  {
    id: 5,
    title: "Docker容器化部署实战指南",
    author: "王六",
    authorColor: "#fa8c16",
    category: "DevOps",
    top: false,
    publishAt: "2025-05-25",
    readCount: "3.1k",
    likeCount: 156,
    collectCount: 67,
    cover: "https://placehold.co/120x90/2496ED/FFFFFF?text=Docker",
    content: `## 一、Docker 简介

Docker 是一个开源的容器化平台，可以帮助开发者打包、分发和运行应用程序。

## 二、核心概念

### 2.1 镜像（Image）
镜像是一个只读模板，包含运行应用程序所需的所有依赖。

### 2.2 容器（Container）
容器是镜像的运行实例，可以创建、启动、停止、删除。

### 2.3 仓库（Repository）
仓库用于存储和分发镜像。

## 三、Dockerfile 最佳实践

\`\`\`dockerfile
# 使用多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

## 四、总结

Docker 是现代云原生应用开发的重要工具，掌握其使用对于开发者至关重要。`,
    tags: ["Docker", "DevOps", "容器化"]
  }
])

const serviceCategories = ref([
  { id: 1, name: "前端开发" },
  { id: 2, name: "后端开发" },
  { id: 3, name: "UI设计" },
]);

const forumCategories = ref([
  {
    id: 4,
    name: "技术教程",
    description: "技术分享与教程",
    moderators: [
      { userId: 1, userName: "张三", canDelete: true, canPin: true },
    ],
  },
  {
    id: 5,
    name: "行业资讯",
    description: "",
    moderators: [],
  },
]);

const moderatorUserPool = [
  { label: "张三", value: 1 },
  { label: "李四", value: 2 },
  { label: "王五", value: 3 },
  { label: "赵六", value: 4 },
];

let forumModeratorKeySeq = 1;
const genModeratorKey = () => `m-${++forumModeratorKeySeq}`;

const forumCatModal = reactive({
  open: false,
  mode: "add",
  editingId: null,
  name: "",
  description: "",
  moderators: [],
  pendingUserId: undefined,
  pendingCanDelete: true,
  pendingCanPin: true,
});

const moderatorUserOptionsFiltered = computed(() => {
  const taken = new Set(
    forumCatModal.moderators.map((m) => m.userId)
  );
  return moderatorUserPool.filter((o) => !taken.has(o.value));
});

const formatModeratorSummary = (mods) => {
  if (!mods || mods.length === 0) return "—";
  return mods.map((m) => m.userName).join("、");
};

const resetForumCatModal = () => {
  forumCatModal.mode = "add";
  forumCatModal.editingId = null;
  forumCatModal.name = "";
  forumCatModal.description = "";
  forumCatModal.moderators = [];
  forumCatModal.pendingUserId = undefined;
  forumCatModal.pendingCanDelete = true;
  forumCatModal.pendingCanPin = true;
};

const openForumCategoryModal = (mode, cat) => {
  resetForumCatModal();
  forumCatModal.mode = mode;
  if (mode === "edit" && cat) {
    forumCatModal.editingId = cat.id;
    forumCatModal.name = cat.name;
    forumCatModal.description = cat.description || "";
    forumCatModal.moderators = (cat.moderators || []).map((m) => ({
      _key: genModeratorKey(),
      userId: m.userId,
      userName: m.userName,
      canDelete: !!m.canDelete,
      canPin: !!m.canPin,
    }));
  }
  forumCatModal.open = true;
};

const closeForumCategoryModal = () => {
  forumCatModal.open = false;
  resetForumCatModal();
};

const addForumModeratorRow = () => {
  if (forumCatModal.pendingUserId == null) {
    message.warning("请选择用户");
    return;
  }
  const opt = moderatorUserPool.find(
    (o) => o.value === forumCatModal.pendingUserId
  );
  if (!opt) return;
  if (forumCatModal.moderators.some((m) => m.userId === opt.value)) {
    message.warning("该用户已是版主");
    return;
  }
  forumCatModal.moderators.push({
    _key: genModeratorKey(),
    userId: opt.value,
    userName: opt.label,
    canDelete: forumCatModal.pendingCanDelete,
    canPin: forumCatModal.pendingCanPin,
  });
  forumCatModal.pendingUserId = undefined;
};

const removeForumModeratorRow = (_key) => {
  forumCatModal.moderators = forumCatModal.moderators.filter(
    (m) => m._key !== _key
  );
};

const nextForumCategoryId = () => {
  const ids = forumCategories.value.map((c) => c.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
};

const stripModeratorKeys = (mods) =>
  mods.map(({ userId, userName, canDelete, canPin }) => ({
    userId,
    userName,
    canDelete,
    canPin,
  }));

const submitForumCategory = () => {
  const name = forumCatModal.name.trim();
  if (!name) {
    message.warning("请输入分类名称");
    return;
  }
  const description = forumCatModal.description.trim();
  const moderators = stripModeratorKeys(forumCatModal.moderators);
  if (forumCatModal.mode === "add") {
    forumCategories.value.push({
      id: nextForumCategoryId(),
      name,
      description,
      moderators,
    });
    message.success("新建成功");
  } else {
    const cat = forumCategories.value.find(
      (c) => c.id === forumCatModal.editingId
    );
    if (cat) {
      cat.name = name;
      cat.description = description;
      cat.moderators = moderators;
    }
    message.success("保存成功");
  }
  forumCatModal.open = false;
  resetForumCatModal();
};

const deleteForumCategory = (cat) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除论坛分类「${cat.name}」吗？`,
    okText: "确认",
    cancelText: "取消",
    okType: "danger",
    onOk() {
      forumCategories.value = forumCategories.value.filter(
        (c) => c.id !== cat.id
      );
      message.success("已删除");
    },
  });
};

const openAddServiceCategory = () => {
  message.info("服务分类新增可对接后台接口后实现");
};

const editServiceCategory = (cat) => {
  message.info(`编辑服务分类：${cat.name}（可对接表单）`);
};

const deleteServiceCategory = (cat) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除「${cat.name}」吗？`,
    okText: "确认",
    cancelText: "取消",
    okType: "danger",
    onOk() {
      serviceCategories.value = serviceCategories.value.filter(
        (c) => c.id !== cat.id
      );
      message.success("已删除");
    },
  });
};

const auditModal = reactive({
  show: false,
  type: "",
  remark: "",
  target: null,
});

const batchRejectModal = reactive({
  show: false,
  reason: "",
});

const articleDetail = reactive({
  visible: false,
  data: null
});

const formatContent = (content) => {
  if (!content) return ''
  return content
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/`{3}(\w*)\n([\s\S]*?)`{3}/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hpu])/gm, '')
    .replace(/\n/g, '<br/>')
}

const toggleTop = (a) => {
  a.top = !a.top;
};
const deleteArticle = (a) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文章"${a.title}"吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      articleList.value = articleList.value.filter((x) => x.id !== a.id);
      message.success('删除成功');
    }
  });
};

const openAudit = (item, type) => {
  auditModal.show = true;
  auditModal.type = type;
  auditModal.remark = "";
  auditModal.target = item;
};

// 批量审核
const batchAudit = (type) => {
  if (selectedArticles.value.length === 0) {
    message.warning('请先选择要审核的文章');
    return;
  }

  if (type === 'reject') {
    // 驳回：弹出填写原因的弹窗
    batchRejectModal.show = true;
    batchRejectModal.reason = "";
  } else {
    // 通过：直接确认
    Modal.confirm({
      title: '批量通过',
      content: `确定要通过选中的 ${selectedArticles.value.length} 篇文章吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        articleList.value.forEach(article => {
          if (selectedArticles.value.includes(article.id)) {
            article.status = 'approved';
          }
        });
        message.success('批量通过成功');
        selectedArticles.value = [];
        selectAll.value = false;
      }
    });
  }
};

// 确认批量驳回
const confirmBatchReject = () => {
  if (!batchRejectModal.reason.trim()) {
    message.warning('请填写驳回原因');
    return;
  }
  articleList.value.forEach(article => {
    if (selectedArticles.value.includes(article.id)) {
      article.status = 'rejected';
      article.rejectReason = batchRejectModal.reason;
    }
  });
  message.success(`批量驳回成功，共驳回 ${selectedArticles.value.length} 篇文章`);
  selectedArticles.value = [];
  selectAll.value = false;
  batchRejectModal.show = false;
};

const submitAudit = () => {
  if (auditModal.type === "reject" && !auditModal.remark.trim()) {
    message.warning('请填写驳回原因');
    return;
  }
  // 更新文章状态
  const article = articleList.value.find(a => a.id === auditModal.target.id);
  if (article) {
    article.status = auditModal.type === "pass" ? "approved" : "rejected";
    article.remark = auditModal.remark;
    message.success(auditModal.type === "pass" ? '审核通过' : '已驳回');
  }
  auditModal.show = false;
};

const viewArticleDetail = (article) => {
  auditModal.target = article;
  auditModal.remark = article.rejectReason || article.remark || '';
  articleDetail.data = article
  articleDetail.visible = true
};

// 从详情页提交审核
const submitAuditFromDetail = (type) => {
  if (type === 'reject' && !auditModal.remark.trim()) {
    message.warning('请填写驳回原因');
    return;
  }
  const article = articleList.value.find(a => a.id === auditModal.target.id);
  if (article) {
    article.status = type === 'pass' ? 'approved' : 'rejected';
    if (type === 'reject') {
      article.rejectReason = auditModal.remark;
    } else {
      article.remark = auditModal.remark;
    }
    message.success(type === 'pass' ? '审核通过' : '已驳回');
  }
  articleDetail.visible = false;
  auditModal.remark = '';
};

</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #e8e8e8;
}
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
.tab-btn--active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
  font-weight: 600;
}

.tab-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-tabs {
  display: flex;
  gap: 8px;
}
.sub-tab-btn {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}
.sub-tab-btn--active {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
}

.toolbar {
  display: flex;
  gap: 10px;
}
.search-input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 260px;
  outline: none;
}
.search-input:focus {
  border-color: #4f46e5;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th {
  background: #f8f8f8;
  padding: 10px 12px;
  text-align: left;
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #e8e8e8;
}
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}
.data-table tr:last-child td {
  border-bottom: none;
}
.action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.category-mgmt-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.category-mgmt-top-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.forum-cat-beside {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.forum-cat-beside-label {
  font-size: 14px;
  color: #888;
}
.forum-cat-chip {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f0f5;
  border-radius: 16px;
  font-size: 13px;
  color: #4f46e5;
  border: 1px solid #e0e0f0;
}
.category-section--service {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.forum-cat-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.forum-cat-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.forum-cat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
}
.forum-cat-req {
  color: #ff4d4f;
  margin-right: 4px;
}
.forum-mod-empty {
  padding: 20px 16px;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
  color: #999;
}
.forum-mod-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.forum-mod-list-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
}
.forum-mod-name {
  font-weight: 500;
  color: #333;
  margin-right: auto;
}
.forum-mod-badge {
  padding: 2px 8px;
  background: #e6e8ff;
  color: #4f46e5;
  border-radius: 4px;
  font-size: 12px;
}
.forum-mod-add {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.forum-mod-select {
  min-width: 160px;
}
.forum-cat-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tree-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f8f8;
  border-radius: 6px;
}
.tree-icon {
  font-size: 16px;
}
.tree-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}
.tree-actions {
  display: flex;
  gap: 8px;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.status-tag--green {
  background: #dcfce7;
  color: #16a34a;
}
.status-tag--gray {
  background: #f0f0f0;
  color: #888;
}
.status-tag--red {
  background: #fee2e2;
  color: #dc2626;
}
.status-tag--purple {
  background: #ede9fe;
  color: #7c3aed;
}

.btn-primary {
  padding: 8px 16px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn-success {
  padding: 5px 12px;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-danger {
  padding: 5px 12px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-default {
  padding: 5px 12px;
  background: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-link {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}
.btn-link--small {
  font-size: 12px;
}
.btn-link--red {
  color: #dc2626;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  width: 400px;
}
.modal--wide {
  width: 520px;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.modal-textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.form-label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}
.form-input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.form-input:focus {
  border-color: #4f46e5;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* 文章详情弹窗 */
.article-detail-wrapper {
  position: relative;
  background: #fff;
  border-radius: 12px;
  width: 800px;
  max-height: 85vh;
}

.article-detail-modal {
  position: relative;
  background: #fff;
  border-radius: 12px;
  width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px 32px;
  box-sizing: border-box;
}

.modal-close {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  right: calc(50% - 460px);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  font-size: 18px;
  transition: all 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
}

.article-detail-modal .detail-header {
  display: flex;
  gap: 16px;
}

.article-detail-modal .detail-header-info {
  flex: 1;
}

.article-detail-modal .detail-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.article-detail-modal .detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.article-detail-modal .meta-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.article-detail-modal .author-name {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.article-detail-modal .meta-sep {
  color: #d1d5db;
}

.article-detail-modal .meta-time,
.article-detail-modal .meta-count {
  font-size: 13px;
  color: #9ca3af;
}

.article-detail-modal .detail-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.article-detail-modal .detail-cover {
  margin-bottom: 20px;
}

.article-detail-modal .detail-cover img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.article-detail-modal .detail-content {
  padding: 0;
}

.article-detail-modal .article-body {
  font-size: 15px;
  color: #374151;
  line-height: 1.8;
}

.article-detail-modal .article-body :deep(h2) {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 24px 0 12px 0;
  padding-left: 12px;
  border-left: 4px solid #4f46e5;
}

.article-detail-modal .article-body :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 20px 0 10px 0;
}

.article-detail-modal .article-body :deep(p) {
  margin: 0 0 12px 0;
}

.article-detail-modal .article-body :deep(pre) {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}

.article-detail-modal .article-body :deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #e11d48;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.article-detail-modal .article-body :deep(pre code) {
  background: none;
  padding: 0;
  color: #374151;
}

.article-detail-modal .article-body :deep(ul) {
  padding-left: 24px;
  margin: 12px 0;
}

.article-detail-modal .article-body :deep(li) {
  margin-bottom: 6px;
  line-height: 1.6;
}

.article-detail-modal .article-body :deep(br) {
  display: block;
  margin-bottom: 8px;
  content: "";
}

/* 详情页审核区域 */
.detail-audit {
  padding-top: 8px;
}
.detail-audit .audit-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.audit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
</style>
