<template>
  <a-modal
    v-model:open="visible"
    title="发布悬赏需求"
    width="600px"
    ok-text="提交"
    cancel-text="取消"
    @ok="handleSubmit"
  >
    <a-form :model="form" layout="vertical" style="margin-top: 8px">
      <a-form-item label="悬赏标题" required>
        <a-input
          v-model:value="form.title"
          placeholder="请输入悬赏标题"
          :maxlength="80"
          show-count
        />
      </a-form-item>
      <a-form-item label="需求描述" required>
        <a-textarea
          v-model:value="form.desc"
          :rows="4"
          placeholder="详细描述需求内容、技术要求、交付标准等"
          :maxlength="500"
          show-count
        />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="需求分类" required>
            <a-select
              v-model:value="form.category"
              placeholder="请选择分类"
              style="width: 100%"
            >
              <a-select-option v-for="c in categories" :key="c" :value="c">{{
                c
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="悬赏金额（元）" required>
            <div style="display: flex; gap: 8px; align-items: center">
              <a-input-number
                v-model:value="form.budgetMin"
                :min="100"
                :max="999999"
                style="flex: 1"
                placeholder="最小金额"
              />
              <span>~</span>
              <a-input-number
                v-model:value="form.budgetMax"
                :min="100"
                :max="999999"
                style="flex: 1"
                placeholder="最大金额"
              />
            </div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="发布时间">
            <a-date-picker
              v-model:value="form.publishDate"
              style="width: 100%"
              placeholder="请选择发布日期"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="截止时间">
            <a-date-picker
              v-model:value="form.deadline"
              style="width: 100%"
              placeholder="请选择截止日期"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="紧急程度">
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <a-tag
            v-for="u in urgencyOptions"
            :key="u"
            :color="form.urgency === u ? urgencyColorMap[u] : 'default'"
            style="cursor: pointer; font-size: 13px; padding: 4px 12px"
            @click="form.urgency = u"
            >{{ u }}</a-tag
          >
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, computed, watch } from "vue";
import { message } from "ant-design-vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  initialData: { type: Object, default: null },
});
const emit = defineEmits(["update:open", "success"]);

const visible = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const categories = [
  "人工智能",
  "Java",
  "Python",
  "Vue/React",
  "移动开发",
  "数据库",
  "运维部署",
  "大数据",
  "其他",
];
const urgencyOptions = ["紧急", "一般", "常规"];
const urgencyColorMap = { 紧急: "orange", 一般: "blue", 常规: "green" };

const defaultForm = {
  title: "",
  desc: "",
  category: undefined,
  budgetMin: null,
  budgetMax: null,
  publishDate: null,
  deadline: null,
  urgency: "一般",
};
const form = reactive({ ...defaultForm });

const resetForm = () => {
  Object.assign(form, defaultForm);
};

watch(
  () => props.open,
  (val) => {
    if (val && props.initialData) {
      Object.assign(form, {
        title: props.initialData.title || "",
        desc: props.initialData.desc || "",
        category: props.initialData.category || undefined,
        budgetMin: props.initialData.budgetMin || null,
        budgetMax: props.initialData.budgetMax || null,
        publishDate: props.initialData.publishDate || null,
        deadline: props.initialData.deadline || null,
        urgency: props.initialData.urgency || "一般",
      });
    } else if (val) {
      resetForm();
    }
  },
);

const handleSubmit = () => {
  if (!form.title.trim()) {
    message.warning("请输入悬赏标题");
    return;
  }
  if (!form.category) {
    message.warning("请选择需求分类");
    return;
  }
  if (!form.budgetMin || !form.budgetMax) {
    message.warning("请输入悬赏金额区间");
    return;
  }
  if (form.budgetMin > form.budgetMax) {
    message.warning("最小金额不能大于最大金额");
    return;
  }
  visible.value = false;
  emit("success", { ...form });
  resetForm();
  message.success("悬赏发布成功");
};
</script>
