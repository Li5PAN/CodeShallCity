<template>
  <div class="write-page">
    <!-- 顶部工具栏 -->
    <div class="write-header">
      <input
        v-model="title"
        class="title-input"
        placeholder="输入文章标题..."
        maxlength="100"
      />
      <div class="header-actions">
        <a-button @click="handleSaveDraft" :loading="saving">保存草稿</a-button>
        <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="publishDrawerVisible = true">发布文章</a-button>
        <a-button type="text" @click="router.back()"><CloseOutlined /></a-button>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="write-body">
      <div id="vditor" class="vditor-wrap"></div>
    </div>

    <!-- 发布抽屉 -->
    <a-drawer
      v-model:open="publishDrawerVisible"
      title="发布文章"
      placement="right"
      width="400"
      :footer-style="{ textAlign: 'right' }"
    >
      <a-form layout="vertical">
        <a-form-item label="文章分类">
          <a-select v-model:value="publishForm.category" placeholder="请选择分类" style="width:100%">
            <a-select-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="文章标签">
          <div class="tag-input-wrap">
            <a-tag
              v-for="tag in publishForm.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              color="blue"
            >{{ tag }}</a-tag>
            <a-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model:value="tagInputValue"
              size="small"
              style="width:80px"
              @blur="confirmTag"
              @keyup.enter="confirmTag"
            />
            <a-tag
              v-else-if="publishForm.tags.length < 5"
              style="cursor:pointer;border-style:dashed"
              @click="showTagInput"
            >
              <PlusOutlined /> 添加标签
            </a-tag>
          </div>
          <div class="form-tip">最多添加5个标签</div>
        </a-form-item>

        <a-form-item label="封面图片">
          <div class="cover-upload" @click="triggerCoverUpload">
            <img v-if="publishForm.coverUrl" :src="publishForm.coverUrl" class="cover-preview" />
            <div v-else class="cover-placeholder">
              <PictureOutlined style="font-size:28px;color:#ccc" />
              <span>点击上传封面</span>
            </div>
          </div>
          <input ref="coverInputRef" type="file" accept="image/*" style="display:none" @change="onCoverChange" />
        </a-form-item>

        <a-form-item label="文章摘要">
          <a-textarea
            v-model:value="publishForm.summary"
            :rows="4"
            placeholder="请输入文章摘要，不填则自动截取正文内容"
            :maxlength="200"
            show-count
          />
        </a-form-item>

        <a-form-item label="发布设置">
          <a-radio-group v-model:value="publishForm.visibility">
            <a-radio value="public">公开</a-radio>
            <a-radio value="private">仅自己可见</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button style="margin-right:8px" @click="publishDrawerVisible = false">取消</a-button>
        <a-button type="primary" style="background:#52c41a;border-color:#52c41a" @click="handlePublish">确认发布</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { CloseOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons-vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const router = useRouter()
const route = useRoute()

const title = ref('')
const saving = ref(false)
const publishDrawerVisible = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)
const coverInputRef = ref(null)
let vditorInstance = null

const categories = ['人工智能', 'Java', 'Python', 'Vue', 'React', '移动开发', '数据库', '运维', '操作系统', '其他']

const publishForm = reactive({
  category: undefined,
  tags: [],
  coverUrl: '',
  summary: '',
  visibility: 'public'
})

onMounted(() => {
  vditorInstance = new Vditor('vditor', {
    height: '100%',
    mode: 'sv',
    placeholder: '开始写作吧...',
    theme: 'classic',
    toolbar: [
      'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'upload', 'table', '|',
      'undo', 'redo', '|',
      'fullscreen'
    ],
    cache: { enable: false },
    after: () => {
      // 如果是编辑模式，从路由参数或 localStorage 恢复内容
      const draft = localStorage.getItem('article_draft')
      if (draft) {
        const parsed = JSON.parse(draft)
        title.value = parsed.title || ''
        vditorInstance.setValue(parsed.content || '')
      }
    }
  })
})

onBeforeUnmount(() => {
  if (vditorInstance) {
    vditorInstance.destroy()
    vditorInstance = null
  }
})

const handleSaveDraft = () => {
  if (!title.value.trim()) {
    message.warning('请先输入文章标题')
    return
  }
  saving.value = true
  const draft = { title: title.value, content: vditorInstance?.getValue() || '' }
  localStorage.setItem('article_draft', JSON.stringify(draft))
  setTimeout(() => {
    saving.value = false
    message.success('草稿已保存')
  }, 600)
}

const handlePublish = () => {
  if (!title.value.trim()) {
    message.warning('请输入文章标题')
    return
  }
  if (!publishForm.category) {
    message.warning('请选择文章分类')
    return
  }
  const content = vditorInstance?.getValue() || ''
  if (!content.trim()) {
    message.warning('文章内容不能为空')
    return
  }
  // 清除草稿
  localStorage.removeItem('article_draft')
  message.success('文章发布成功')
  publishDrawerVisible.value = false
  router.push('/user/tech-forum')
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

const confirmTag = () => {
  const val = tagInputValue.value.trim()
  if (val && !publishForm.tags.includes(val)) {
    publishForm.tags.push(val)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (tag) => {
  publishForm.tags = publishForm.tags.filter(t => t !== tag)
}

const triggerCoverUpload = () => coverInputRef.value?.click()

const onCoverChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { publishForm.coverUrl = ev.target.result }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.write-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.write-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.title-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  background: transparent;
}

.title-input::placeholder { color: #ccc; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.write-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vditor-wrap {
  flex: 1;
  height: 100%;
}

/* 覆盖 vditor 高度撑满 */
.vditor-wrap :deep(.vditor) { height: 100% !important; }
.vditor-wrap :deep(.vditor-content) { height: calc(100% - 38px) !important; }

/* 隐藏 vditor 内置的"复制到公众号/知乎"按钮 */
.vditor-wrap :deep(button[data-type="mp-wechat"]),
.vditor-wrap :deep(button[data-type="zhihu"]) { display: none !important; }

/* 发布面板 */
.tag-input-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.form-tip { font-size: 12px; color: #bbb; margin-top: 4px; }

.cover-upload {
  width: 100%;
  height: 140px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}
.cover-upload:hover { border-color: #52c41a; }
.cover-preview { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #bbb; font-size: 13px; }
</style>
