<template>
  <div class="write-page">
    <!-- 顶部操作栏 -->
    <div class="write-toolbar">
      <div class="toolbar-actions">
        <a-button
          type="primary"
          style="background: #52c41a; border-color: #52c41a"
          @click="publishDrawerVisible = true"
          >发布文章</a-button
        >
        <a-button type="text" @click="router.back()"
          ><CloseOutlined
        /></a-button>
      </div>
    </div>

    <!-- 标题输入 -->
    <div class="write-title-bar">
      <input
        v-model="title"
        class="title-input"
        placeholder="输入文章标题..."
        maxlength="100"
      />
    </div>

    <!-- 编辑器区域 -->
    <div class="write-body">
      <div id="vditor" class="vditor-wrap"></div>
    </div>

    <!-- 发布抽屉 -->
    <a-drawer
      v-model:open="publishDrawerVisible"
      :title="isEditMode ? '更新文章' : '发布文章'"
      placement="right"
      width="400"
    >
      <a-form layout="vertical">
        <a-form-item label="文章分类">
          <a-select
            v-model:value="publishForm.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <a-select-option v-for="c in categories" :key="c" :value="c">{{
              c
            }}</a-select-option>
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
              >{{ tag }}</a-tag
            >
            <a-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model:value="tagInputValue"
              size="small"
              style="width: 80px"
              @blur="confirmTag"
              @keyup.enter="confirmTag"
            />
            <a-tag
              v-else-if="publishForm.tags.length < 5"
              style="cursor: pointer; border-style: dashed"
              @click="showTagInput"
            >
              <PlusOutlined /> 添加标签
            </a-tag>
          </div>
          <div class="form-tip">最多添加5个标签</div>
        </a-form-item>

        <a-form-item label="封面图片">
          <div class="cover-upload" @click="triggerCoverUpload">
            <img
              v-if="publishForm.coverUrl"
              :src="publishForm.coverUrl"
              class="cover-preview"
            />
            <div v-else class="cover-placeholder">
              <PictureOutlined style="font-size: 28px; color: #ccc" />
              <span>点击上传封面</span>
            </div>
          </div>
          <input
            ref="coverInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onCoverChange"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="drawer-footer">
          <a-button @click="handleSaveDraft" :loading="saving" class="draft-btn">保存草稿</a-button>
          <div class="footer-right">
            <a-button @click="publishDrawerVisible = false">取消</a-button>
            <a-button
              type="primary"
              style="background: #52c41a; border-color: #52c41a"
              @click="handlePublish"
              >{{ isEditMode ? "确认更新" : "确认发布" }}</a-button
            >
          </div>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import {
  CloseOutlined,
  PlusOutlined,
  PictureOutlined,
} from "@ant-design/icons-vue";
import Vditor from "vditor";
import "vditor/dist/index.css";

const router = useRouter();
const route = useRoute();

const title = ref("");
const saving = ref(false);
const publishDrawerVisible = ref(false);
const tagInputVisible = ref(false);
const tagInputValue = ref("");
const tagInputRef = ref(null);
const coverInputRef = ref(null);
let vditorInstance = null;

// 判断是否为编辑模式
const isEditMode = ref(false);
const editingArticleId = ref(null);
const isDraftMode = ref(false);

// 文章数据（用于编辑已发布的文章）
const articleData = ref(null);

const categories = [
  "人工智能",
  "Java",
  "Python",
  "Vue",
  "React",
  "移动开发",
  "数据库",
  "运维",
  "操作系统",
  "其他",
];

const publishForm = reactive({
  category: undefined,
  tags: [],
  coverUrl: "",
  summary: "",
  visibility: "public",
});

// 模拟文章数据（实际项目中应从API获取）
const mockArticles = {
  1: { id: 1, title: "深入解析CPU调度：操作系统的核心资源分配机制", category: "操作系统", tags: ["CPU", "调度", "操作系统"], coverUrl: "", content: "这是已发布文章的内容..." },
  2: { id: 2, title: "Vue3 Composition API 最佳实践总结", category: "Vue", tags: ["Vue3", "Composition API"], coverUrl: "", content: "Vue3 Composition API 最佳实践..." },
  3: { id: 3, title: "Docker容器化部署实战指南", category: "运维", tags: ["Docker", "容器化"], coverUrl: "", content: "草稿内容..." },
};

onMounted(() => {
  // 判断是编辑草稿还是编辑已发布文章
  isDraftMode.value = route.query.draft === "1";
  isEditMode.value = route.query.edit === "1";
  editingArticleId.value = route.query.id;

  // 如果是编辑模式，加载文章数据
  if (editingArticleId.value) {
    const articleId = parseInt(editingArticleId.value);

    // 编辑草稿：尝试从草稿存储加载
    if (isDraftMode.value) {
      const draftKey = `article_draft_${articleId}`;
      const storedDraft = localStorage.getItem(draftKey);
      if (storedDraft) {
        articleData.value = JSON.parse(storedDraft);
      }
    }

    // 编辑已发布文章：从文章数据加载
    if (isEditMode.value && !articleData.value) {
      articleData.value = mockArticles[articleId];
    }

    if (articleData.value) {
      title.value = articleData.value.title || "";
      publishForm.category = articleData.value.category;
      publishForm.tags = [...(articleData.value.tags || [])];
      publishForm.coverUrl = articleData.value.coverUrl || "";
    }
  }

  vditorInstance = new Vditor("vditor", {
    height: "100%",
    mode: "sv",
    placeholder: "开始写作吧...",
    theme: "classic",
    toolbar: [
      "emoji",
      "headings",
      "bold",
      "italic",
      "strike",
      "link",
      "|",
      "list",
      "ordered-list",
      "check",
      "outdent",
      "indent",
      "|",
      "quote",
      "line",
      "code",
      "inline-code",
      "insert-before",
      "insert-after",
      "|",
      "upload",
      "table",
      "|",
      "undo",
      "redo",
      "|",
      "fullscreen",
    ],
    cache: { enable: false },
    after: () => {
      // 编辑模式：从文章数据或草稿恢复内容
      if (articleData.value && articleData.value.content) {
        vditorInstance.setValue(articleData.value.content);
      } else {
        // 新建草稿：从 localStorage 恢复
        const draft = localStorage.getItem("article_draft");
        if (draft) {
          const parsed = JSON.parse(draft);
          title.value = parsed.title || "";
          vditorInstance.setValue(parsed.content || "");
        }
      }
    },
  });
});

onBeforeUnmount(() => {
  if (vditorInstance) {
    vditorInstance.destroy();
    vditorInstance = null;
  }
});

const handleSaveDraft = () => {
  if (!title.value.trim()) {
    message.warning("请先输入文章标题");
    return;
  }
  saving.value = true;
  const content = vditorInstance?.getValue() || "";

  // 如果是编辑已发布文章，保存为草稿
  if (isEditMode.value && editingArticleId.value) {
    const draftKey = `article_draft_${editingArticleId.value}`;
    const draft = {
      id: editingArticleId.value,
      title: title.value,
      content: content,
      category: publishForm.category,
      tags: [...publishForm.tags],
      coverUrl: publishForm.coverUrl,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setTimeout(() => {
      saving.value = false;
      message.success("已保存");
    }, 600);
    return;
  }

  // 原有的草稿保存逻辑
  const draft = {
    title: title.value,
    content: content,
  };
  localStorage.setItem("article_draft", JSON.stringify(draft));
  setTimeout(() => {
    saving.value = false;
    message.success("草稿已保存");
  }, 600);
};

const handlePublish = () => {
  if (!title.value.trim()) {
    message.warning("请输入文章标题");
    return;
  }
  if (!publishForm.category) {
    message.warning("请选择文章分类");
    return;
  }
  const content = vditorInstance?.getValue() || "";
  if (!content.trim()) {
    message.warning("文章内容不能为空");
    return;
  }

  // 编辑已发布文章
  if (isEditMode.value && editingArticleId.value) {
    // 清除对应的草稿
    localStorage.removeItem(`article_draft_${editingArticleId.value}`);
    message.success("文章更新成功");
    publishDrawerVisible.value = false;
    router.push("/user/tech-forum");
    return;
  }

  // 清除草稿
  localStorage.removeItem("article_draft");
  message.success("文章发布成功");
  publishDrawerVisible.value = false;
  router.push("/user/tech-forum");
};

const showTagInput = () => {
  tagInputVisible.value = true;
  nextTick(() => tagInputRef.value?.focus());
};

const confirmTag = () => {
  const val = tagInputValue.value.trim();
  if (val && !publishForm.tags.includes(val)) {
    publishForm.tags.push(val);
  }
  tagInputVisible.value = false;
  tagInputValue.value = "";
};

const removeTag = (tag) => {
  publishForm.tags = publishForm.tags.filter((t) => t !== tag);
};

const triggerCoverUpload = () => coverInputRef.value?.click();

const onCoverChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    publishForm.coverUrl = ev.target.result;
  };
  reader.readAsDataURL(file);
};
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

/* 顶部操作栏 */
.write-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 标题输入 */
.write-title-bar {
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  background: transparent;
}
.title-input::placeholder {
  color: #ccc;
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
.vditor-wrap :deep(.vditor) {
  height: 100% !important;
}
.vditor-wrap :deep(.vditor-content) {
  height: calc(100% - 38px) !important;
}

/* 隐藏 vditor 内置的"复制到公众号/知乎"按钮 */
.vditor-wrap :deep(button[data-type="mp-wechat"]),
.vditor-wrap :deep(button[data-type="zhihu"]) {
  display: none !important;
}

/* 发布面板 */
.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.form-tip {
  font-size: 12px;
  color: #bbb;
  margin-top: 4px;
}

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
.cover-upload:hover {
  border-color: #52c41a;
}
.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #bbb;
  font-size: 13px;
}

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.draft-btn {
  color: #52c41a;
  border-color: #52c41a;
}
.draft-btn:hover {
  color: #73d13d;
  border-color: #73d13d;
}
</style>
