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
      <a-tab-pane key="service" tab="服务商品审核">
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
            <a-select
              v-model:value="serviceCategoryFilter"
              style="width: 120px"
              size="small"
              placeholder="服务分类"
            >
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
          :row-key="(record) => record.id"
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
                <a-avatar
                  :size="24"
                  :style="{ backgroundColor: record.providerColor }"
                >
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
                <a-button
                  type="link"
                  size="small"
                  @click="viewServiceDetail(record)"
                  >查看</a-button
                >
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="demand" tab="需求悬赏审核">
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
            <a-select
              v-model:value="demandTypeFilter"
              style="width: 120px"
              size="small"
              placeholder="需求类型"
            >
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
          :row-key="(record) => record.id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'demand'">
              <div class="goods-info">
                <div class="demand-icon">
                  <TrophyOutlined
                    :style="{ fontSize: '24px', color: record.iconColor }"
                  />
                </div>
                <div class="goods-detail">
                  <div class="goods-name">{{ record.title }}</div>
                  <div class="goods-desc">{{ record.description }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="column.key === 'publisher'">
              <div class="provider-info">
                <a-avatar
                  :size="24"
                  :style="{ backgroundColor: record.publisherColor }"
                >
                  {{ record.publisher[0] }}
                </a-avatar>
                <span>{{ record.publisher }}</span>
              </div>
            </template>

            <template v-else-if="column.key === 'type'">
              <a-tag color="orange" size="small">{{ record.type }}</a-tag>
            </template>

            <template v-else-if="column.key === 'budget'">
              <span class="price-text"
                >¥{{ record.budgetMin }} - ¥{{ record.budgetMax }}</span
              >
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="statusColorMap[record.status]" size="small">
                {{ statusTextMap[record.status] }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button
                  type="link"
                  size="small"
                  @click="viewDemandDetail(record)"
                  >查看</a-button
                >
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 服务详情弹窗 -->
    <a-modal
      v-model:open="serviceDetail.visible"
      title="服务详情"
      width="1000px"
      :footer="null"
    >
      <div v-if="serviceDetail.data" class="service-detail-modal">
        <div class="product-section">
          <div class="product-gallery">
            <div class="main-image">
              <img
                :src="serviceDetail.data.images[serviceDetail.currentImage]"
                alt="服务图"
              />
            </div>
            <div
              class="thumb-list"
              v-if="serviceDetail.data.images?.length > 1"
            >
              <div
                v-for="(img, idx) in serviceDetail.data.images"
                :key="idx"
                class="thumb-item"
                :class="{ active: serviceDetail.currentImage === idx }"
                @click="serviceDetail.currentImage = idx"
              >
                <img :src="img" alt="" />
              </div>
            </div>
          </div>
          <div class="product-info">
            <h1 class="product-title">{{ serviceDetail.data.name }}</h1>
            <p class="product-subtitle">{{ serviceDetail.data.description }}</p>
            <div class="price-box">
              <div class="price-row">
                <span class="price-label">价格</span>
                <span class="price-value"
                  >¥ {{ serviceDetail.data.price }}</span
                >
              </div>
              <div class="price-row">
                <span class="price-label">销量</span>
                <span class="price-info"
                  >{{ serviceDetail.data.sales }}+ 笔</span
                >
              </div>
              <div class="price-row">
                <span class="price-label">好评率</span>
                <span class="price-info" style="color: #52c41a"
                  >{{ serviceDetail.data.rating }}%</span
                >
              </div>
            </div>
            <div class="guarantee-tags">
              <span class="price-label">保障</span>
              <div class="tag-list">
                <a-tag
                  v-for="tag in serviceDetail.data.tags"
                  :key="tag"
                  color="blue"
                >
                  <CheckCircleOutlined /> {{ tag }}
                </a-tag>
              </div>
            </div>
            <div class="seller-info">
              <a-avatar
                :size="40"
                :style="{ backgroundColor: serviceDetail.data.providerColor }"
              >
                {{ serviceDetail.data.provider[0] }}
              </a-avatar>
              <div class="seller-detail">
                <div class="seller-name">{{ serviceDetail.data.provider }}</div>
                <div class="seller-meta">服务商</div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-body">
          <div class="detail-left">
            <a-tabs
              v-model:activeKey="serviceDetail.activeTab"
              class="detail-tabs"
            >
              <a-tab-pane key="detail" tab="服务详情">
                <div class="detail-content">
                  <h3>服务介绍</h3>
                  <p>{{ serviceDetail.data.detailIntro }}</p>
                  <h3>服务内容</h3>
                  <ul>
                    <li
                      v-for="(item, idx) in serviceDetail.data.detailItems"
                      :key="idx"
                    >
                      {{ item }}
                    </li>
                  </ul>
                  <h3>交付标准</h3>
                  <p>{{ serviceDetail.data.deliveryStandard }}</p>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>

        <!-- 审核操作区 -->
        <template v-if="serviceDetail.data.status === 'pending'">
          <div class="detail-card audit-card">
            <div class="audit-action-bar">
              <a-form layout="vertical" class="audit-action-form">
                <a-form-item label="审核备注" style="margin-bottom: 0">
                  <a-textarea
                    v-model:value="serviceDetail.remark"
                    placeholder="请填写审核备注（驳回时必填原因）"
                    :rows="2"
                    :maxlength="200"
                    show-count
                  />
                </a-form-item>
              </a-form>
              <div class="audit-action-buttons">
                <a-button
                  type="primary"
                  style="background-color: #52c41a; border-color: #52c41a"
                  @click="handleServiceAudit('approve')"
                >
                  通过
                </a-button>
                <a-button danger @click="handleServiceAudit('reject')">
                  驳回
                </a-button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </a-modal>

    <!-- 需求详情弹窗 -->
    <a-modal
      v-model:open="demandDetail.visible"
      title="需求详情"
      width="900px"
      :footer="null"
    >
      <div v-if="demandDetail.data" class="demand-detail-modal">
        <!-- 需求内容卡片 -->
        <div class="detail-card">
          <h2 class="card-title">需求内容</h2>
          <div class="meta-line">
            <span class="meta-author"
              >发布者：{{ demandDetail.data.publisher }}</span
            >
            <span class="meta-time"
              >发布时间：{{ demandDetail.data.submitTime }}</span
            >
            <span class="meta-time"
              >截止时间：{{ demandDetail.data.deadline }}</span
            >
            <a-tag
              :color="
                demandDetail.data.status === 'pending'
                  ? 'orange'
                  : demandDetail.data.status === 'approved'
                    ? 'green'
                    : 'red'
              "
              class="status-tag"
            >
              {{ statusTextMap[demandDetail.data.status] }}
            </a-tag>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">需求标题</span>
              <span class="info-value">{{ demandDetail.data.title }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">预算金额</span>
              <span class="info-value price-text">
                ¥ {{ demandDetail.data.budgetMin }} ~
                {{ demandDetail.data.budgetMax }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">需求描述</span>
              <span class="info-value">{{
                demandDetail.data.description
              }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">需求类型</span>
              <span class="info-value">{{ demandDetail.data.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">紧急程度</span>
              <span class="info-value">
                <a-tag :color="getUrgencyColor(demandDetail.data.urgency)">{{
                  demandDetail.data.urgency
                }}</a-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- 需求详情卡片 -->
        <div class="detail-card detail-intro-card">
          <h3 class="card-sub-title">详细需求说明</h3>
          <div class="detail-text">
            {{ demandDetail.data.detailDescription }}
          </div>

          <h3 class="card-sub-title" style="margin-top: 20px">功能要求清单</h3>
          <ul class="requirement-list">
            <li
              v-for="(item, idx) in demandDetail.data.requirementItems"
              :key="idx"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- 审核操作区 -->
        <template v-if="demandDetail.data.status === 'pending'">
          <div class="detail-card audit-card">
            <div class="audit-action-bar">
              <a-form layout="vertical" class="audit-action-form">
                <a-form-item label="审核备注" style="margin-bottom: 0">
                  <a-textarea
                    v-model:value="demandDetail.remark"
                    placeholder="请填写审核备注（驳回时必填原因）"
                    :rows="2"
                    :maxlength="200"
                    show-count
                  />
                </a-form-item>
              </a-form>
              <div class="audit-action-buttons">
                <a-button
                  type="primary"
                  style="background-color: #52c41a; border-color: #52c41a"
                  @click="handleDemandAudit('approve')"
                >
                  通过
                </a-button>
                <a-button danger @click="handleDemandAudit('reject')">
                  驳回
                </a-button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import {
  CheckCircleOutlined,
  TrophyOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons-vue";

const activeTab = ref("service");
const serviceStatusFilter = ref("all");
const serviceCategoryFilter = ref("");
const serviceSearchKeyword = ref("");
const demandStatusFilter = ref("all");
const demandTypeFilter = ref("");
const demandSearchKeyword = ref("");

const statusColorMap = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const statusTextMap = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已驳回",
};

const serviceColumns = [
  { title: "服务信息", key: "service", width: "35%" },
  { title: "服务商", key: "provider", width: "12%" },
  { title: "分类", key: "category", width: "10%" },
  { title: "价格", key: "price", width: "10%" },
  {
    title: "提交时间",
    dataIndex: "submitTime",
    key: "submitTime",
    width: "13%",
  },
  { title: "状态", key: "status", width: "10%" },
  { title: "操作", key: "action", width: "10%" },
];

const demandColumns = [
  { title: "需求信息", key: "demand", width: "35%" },
  { title: "发布者", key: "publisher", width: "12%" },
  { title: "类型", key: "type", width: "10%" },
  { title: "预算范围", key: "budget", width: "14%" },
  {
    title: "提交时间",
    dataIndex: "submitTime",
    key: "submitTime",
    width: "13%",
  },
  { title: "状态", key: "status", width: "10%" },
  { title: "操作", key: "action", width: "10%" },
];

const servicePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const demandPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const serviceList = ref([
  {
    id: 1,
    name: "Vue3全栈开发实战课程",
    description: "从零搭建企业级Vue3项目，包含组件库、状态管理、路由等核心技术",
    cover: "https://placehold.co/60x45/42b883/FFFFFF?text=Vue3",
    provider: "前端大师",
    providerColor: "#1890ff",
    category: "前端开发",
    price: 399,
    submitTime: "2026-03-05 10:30",
    status: "pending",
    images: [
      "https://placehold.co/480x360/42b883/FFFFFF?text=Vue3封面",
      "https://placehold.co/480x360/42b883/FFFFFF?text=课程大纲",
      "https://placehold.co/480x360/42b883/FFFFFF?text=实战项目",
    ],
    sales: 1200,
    rating: 98,
    tags: ["平台保障", "商家认证", "7天无理由", "售后答疑"],
    detailIntro:
      "本课程由资深前端架构师倾力打造，从零开始带你搭建企业级Vue3项目。涵盖Vue3核心特性、Composition API、TypeScript类型系统、Pinia状态管理、Vue Router路由管理等核心技术。",
    detailItems: [
      "Vue3核心特性和Composition API详解",
      "TypeScript在Vue3中的最佳实践",
      "Pinia状态管理从入门到精通",
      "Vue Router4路由管理与权限控制",
      "Element Plus组件库深入源码分析",
      "Vite构建工具原理与性能优化",
      "企业级项目架构设计与分层",
      "前后端分离项目实战",
    ],
    deliveryStandard:
      "购买后24小时内开通课程权限，配套源码永久有效，提供1年技术答疑服务。",
  },
  {
    id: 2,
    name: "Python爬虫数据采集服务",
    description: "提供专业的网页数据采集服务，支持动态网页、反爬虫处理",
    cover: "https://placehold.co/60x45/3776AB/FFFFFF?text=Python",
    provider: "数据专家",
    providerColor: "#52c41a",
    category: "数据分析",
    price: 1500,
    submitTime: "2026-03-04 14:20",
    status: "approved",
    images: [
      "https://placehold.co/480x360/3776AB/FFFFFF?text=Python封面",
      "https://placehold.co/480x360/3776AB/FFFFFF?text=数据采集",
    ],
    sales: 860,
    rating: 99,
    tags: ["平台保障", "数据安全", "专业团队"],
    detailIntro:
      "专业的数据采集团队，提供全网数据采集服务。覆盖电商、社交、新闻、论坛等各类网站，支持动态渲染页面、验证码识别、反爬虫绕过等高级功能。",
    detailItems: [
      "静态网页数据采集",
      "动态渲染页面（JS渲染）数据采集",
      "反反爬虫策略定制",
      "验证码识别与处理",
      "数据清洗与格式化",
      "大规模分布式采集架构",
    ],
    deliveryStandard:
      "约定时间内交付数据，支持多种格式（Excel、CSV、JSON、数据库），提供数据质量保证。",
  },
  {
    id: 3,
    name: "Java微服务架构设计",
    description: "Spring Cloud微服务架构设计与实现，包含服务治理、配置中心等",
    cover: "https://placehold.co/60x45/FF6600/FFFFFF?text=Java",
    provider: "架构师",
    providerColor: "#722ed1",
    category: "后端开发",
    price: 2999,
    submitTime: "2026-03-03 09:15",
    status: "approved",
    images: [
      "https://placehold.co/480x360/FF6600/FFFFFF?text=Java封面",
      "https://placehold.co/480x360/FF6600/FFFFFF?text=微服务",
    ],
    sales: 320,
    rating: 97,
    tags: ["平台保障", "架构咨询", "源码交付"],
    detailIntro:
      "10年+架构师经验，专注微服务架构设计与实现。基于Spring Cloud Alibaba生态，提供从需求分析、架构设计到落地实施的全程服务。",
    detailItems: [
      "微服务架构设计咨询",
      "Spring Cloud Alibaba全家桶实现",
      "Nacos注册中心与配置中心",
      "Sentinel流量控制与熔断降级",
      "Seata分布式事务解决方案",
      "Gateway统一网关设计",
      "Skywalking全链路追踪",
      "Docker/K8s容器化部署",
    ],
    deliveryStandard:
      "提供完整源码、架构文档和部署手册，支持一对一技术讲解，售后提供3个月免费维护。",
  },
  {
    id: 4,
    name: "AI大模型应用开发",
    description: "基于GPT、Claude等大模型的应用开发，包含Prompt工程、RAG等",
    cover: "https://placehold.co/60x45/52c41a/FFFFFF?text=AI",
    provider: "AI专家",
    providerColor: "#fa8c16",
    category: "人工智能",
    price: 4999,
    submitTime: "2026-03-02 16:45",
    status: "pending",
    images: [
      "https://placehold.co/480x360/52c41a/FFFFFF?text=AI封面",
      "https://placehold.co/480x360/52c41a/FFFFFF?text=Prompt工程",
      "https://placehold.co/480x360/52c41a/FFFFFF?text=RAG应用",
    ],
    sales: 150,
    rating: 96,
    tags: ["平台保障", "AI赋能", "私有化部署"],
    detailIntro:
      "专注于AI大模型应用开发，涵盖GPT、Claude、国产大模型的接入与应用。提供从Prompt工程、RAG知识库搭建到Agent智能体开发的全栈服务。",
    detailItems: [
      "GPT/Claude/文心/通义等大模型接入",
      "Prompt工程与调优实战",
      "RAG知识库构建与优化",
      "LangChain框架应用开发",
      "AI Agent智能体设计与实现",
      "向量数据库选型与部署",
      "企业级AI应用架构设计",
      "私有化大模型部署方案",
    ],
    deliveryStandard:
      "交付完整项目源码和部署文档，提供AI应用最佳实践指导，售后服务期限为6个月。",
  },
  {
    id: 5,
    name: "React Native移动端开发",
    description: "跨平台移动应用开发，一套代码同时支持iOS和Android",
    cover: "https://placehold.co/60x45/61DAFB/000000?text=RN",
    provider: "移动开发者",
    providerColor: "#13c2c2",
    category: "前端开发",
    price: 899,
    submitTime: "2026-03-01 11:00",
    status: "rejected",
    images: ["https://placehold.co/480x360/61DAFB/000000?text=RN封面"],
    sales: 450,
    rating: 95,
    tags: ["平台保障", "跨平台", "源码交付"],
    detailIntro:
      "使用React Native开发跨平台移动应用，一套代码同时支持iOS和Android。包含用户系统、支付功能、消息推送、数据统计等完整功能模块。",
    detailItems: [
      "React Native环境搭建与项目初始化",
      "React Navigation导航系统",
      "Redux/MobX状态管理",
      "iOS/Android原生模块开发",
      "第三方SDK集成（支付、推送、统计）",
      "应用商店上架指导",
    ],
    deliveryStandard:
      "交付完整源码和上架指南，提供7x24小时答疑服务，协助解决上架问题。",
  },
]);

const demandList = ref([
  {
    id: 1,
    title: "MiniMax-M2.1 智能客服系统开发",
    description:
      "基于MiniMax大模型开发智能客服系统，需要支持多轮对话、知识库检索",
    publisher: "科技公司HR",
    publisherColor: "#ff4d4f",
    type: "人工智能",
    budgetMin: 3000,
    budgetMax: 5000,
    submitTime: "2026-03-05 14:00",
    status: "pending",
    iconColor: "#faad14",
    views: 1256,
    bids: 8,
    deadline: "2026-03-18 23:59:59",
    urgency: "紧急",
    detailDescription:
      "需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别、知识库问答等功能，需提供完整源码及部署文档。\n\n功能要求：\n1. 多轮对话管理，支持上下文理解\n2. 意图识别与自动分类\n3. 知识库问答，支持FAQ批量导入\n4. 对话记录查询与统计分析\n5. 支持接入微信、钉钉等主流平台",
    requirementItems: [
      "多轮对话系统设计与实现",
      "意图识别模型训练与部署",
      "知识库管理与问答匹配",
      "后台管理系统开发",
      "API接口文档与部署文档",
      "提供6个月免费维护服务",
    ],
  },
  {
    id: 2,
    title: "React Native 跨平台移动端应用",
    description: "开发一款跨平台的移动应用，包含用户系统、支付功能、数据统计",
    publisher: "创业团队",
    publisherColor: "#13c2c2",
    type: "移动开发",
    budgetMin: 10000,
    budgetMax: 15000,
    submitTime: "2026-03-04 10:30",
    status: "approved",
    iconColor: "#52c41a",
    views: 892,
    bids: 5,
    deadline: "2026-03-22 23:59:59",
    urgency: "一般",
    detailDescription:
      "开发一款跨平台移动应用，使用React Native技术栈，一套代码同时支持iOS和Android。\n\n功能模块：\n1. 用户注册登录（手机号+验证码）\n2. 商品展示与搜索\n3. 购物车与订单管理\n4. 微信/支付宝支付接入\n5. 用户中心与消息通知",
    requirementItems: [
      "React Native项目初始化与环境配置",
      "React Navigation导航系统",
      "Redux状态管理",
      "iOS/Android双平台打包",
      "微信支付与支付宝支付集成",
      "应用商店上架指导",
    ],
  },
  {
    id: 3,
    title: "Vue3企业级后台管理系统",
    description: "开发一套完整的企业级后台管理系统，包含权限管理、数据可视化等",
    publisher: "互联网公司",
    publisherColor: "#1890ff",
    type: "Web开发",
    budgetMin: 6000,
    budgetMax: 10000,
    submitTime: "2026-03-03 16:20",
    status: "pending",
    iconColor: "#faad14",
    views: 2103,
    bids: 12,
    deadline: "2026-03-31 23:59:59",
    urgency: "紧急",
    detailDescription:
      "开发一套完整的企业级Vue3后台管理系统，采用前后端分离架构。\n\n技术要求：\n1. 基于Vue3 + TypeScript + Vite\n2. 使用Pinia进行状态管理\n3. Element Plus组件库\n4. JWT Token身份认证\n5. RBAC权限控制\n6. ECharts数据可视化",
    requirementItems: [
      "项目架构设计与技术选型",
      "用户管理模块（含RBAC权限）",
      "菜单管理与动态路由",
      "数据可视化大屏开发",
      "系统日志与操作记录",
      "接口文档与部署手册",
    ],
  },
  {
    id: 4,
    title: "电商数据分析与可视化",
    description: "对电商平台的销售数据进行深度分析，制作可视化报表和预测模型",
    publisher: "电商平台",
    publisherColor: "#722ed1",
    type: "数据分析",
    budgetMin: 3000,
    budgetMax: 8000,
    submitTime: "2026-03-02 09:45",
    status: "rejected",
    iconColor: "#ff4d4f",
    views: 3456,
    bids: 15,
    deadline: "2026-03-25 23:59:59",
    urgency: "常规",
    detailDescription:
      "对电商平台的销售数据进行深度分析，开发数据可视化系统，支持实时监控和趋势预测。\n\n分析内容：\n1. 销售数据分析（GMV、订单量、客单价）\n2. 用户行为分析（访问路径、转化率）\n3. 商品分析（爆款、滞销、关联销售）\n4. 库存与供应链分析\n5. 销售预测模型",
    requirementItems: [
      "数据仓库设计与ETL开发",
      "销售数据指标体系搭建",
      "多维度数据可视化大屏",
      "用户行为分析模型",
      "销售预测机器学习模型",
      "数据导出与报告生成功能",
    ],
  },
]);

const serviceDetail = ref({
  visible: false,
  data: null,
  remark: "",
  currentImage: 0,
  activeTab: "detail",
});

const demandDetail = ref({
  visible: false,
  data: null,
  remark: "",
});

const getUrgencyColor = (urgency) => {
  const colorMap = {
    紧急: "orange",
    一般: "blue",
    常规: "default",
  };
  return colorMap[urgency] || "default";
};

const filteredServices = computed(() => {
  let list = serviceList.value;

  if (serviceStatusFilter.value !== "all") {
    list = list.filter((item) => item.status === serviceStatusFilter.value);
  }

  if (serviceCategoryFilter.value) {
    list = list.filter((item) => item.category === serviceCategoryFilter.value);
  }

  if (serviceSearchKeyword.value.trim()) {
    const keyword = serviceSearchKeyword.value.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.provider.toLowerCase().includes(keyword),
    );
  }

  servicePagination.value.total = list.length;
  return list;
});

const filteredDemands = computed(() => {
  let list = demandList.value;

  if (demandStatusFilter.value !== "all") {
    list = list.filter((item) => item.status === demandStatusFilter.value);
  }

  if (demandTypeFilter.value) {
    list = list.filter((item) => item.type === demandTypeFilter.value);
  }

  if (demandSearchKeyword.value.trim()) {
    const keyword = demandSearchKeyword.value.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.publisher.toLowerCase().includes(keyword),
    );
  }

  demandPagination.value.total = list.length;
  return list;
});

const servicePendingCount = computed(
  () => serviceList.value.filter((s) => s.status === "pending").length,
);
const demandPendingCount = computed(
  () => demandList.value.filter((d) => d.status === "pending").length,
);
const approvedCount = computed(
  () =>
    serviceList.value.filter((s) => s.status === "approved").length +
    demandList.value.filter((d) => d.status === "approved").length,
);
const rejectedCount = computed(
  () =>
    serviceList.value.filter((s) => s.status === "rejected").length +
    demandList.value.filter((d) => d.status === "rejected").length,
);

const viewServiceDetail = (record) => {
  serviceDetail.value = {
    visible: true,
    data: { ...record },
    remark: "",
    currentImage: 0,
    activeTab: "detail",
  };
};

const viewDemandDetail = (record) => {
  demandDetail.value = {
    visible: true,
    data: { ...record },
    remark: "",
  };
};

const handleServiceAudit = (type) => {
  if (type === "reject" && !serviceDetail.value.remark.trim()) {
    message.warning("请填写驳回原因");
    return;
  }

  const record = serviceList.value.find(
    (item) => item.id === serviceDetail.value.data?.id,
  );
  if (record) {
    record.status = type === "approve" ? "approved" : "rejected";
    message.success(type === "approve" ? "审核通过" : "已驳回");
  }

  serviceDetail.value.visible = false;
};

const handleDemandAudit = (type) => {
  if (type === "reject" && !demandDetail.value.remark.trim()) {
    message.warning("请填写驳回原因");
    return;
  }

  const record = demandList.value.find(
    (item) => item.id === demandDetail.value.data?.id,
  );
  if (record) {
    record.status = type === "approve" ? "approved" : "rejected";
    message.success(type === "approve" ? "审核通过" : "已驳回");
  }

  demandDetail.value.visible = false;
};

const offlineItem = (record, type) => {
  record.status = "rejected";
  message.success(`${type === "service" ? "服务" : "需求"}已下架`);
};
</script>

<style scoped>
.goods-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.page-header {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 32px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-label {
  font-size: 12px;
  color: #999;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
}
.stat-value.pending {
  color: #fa8c16;
}
.stat-value.success {
  color: #52c41a;
}
.stat-value.danger {
  color: #ff4d4f;
}

.management-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 0 24px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.management-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
.management-tabs :deep(.ant-tabs-content-holder) {
  overflow: auto;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}
.filter-left :deep(.ant-tabs-nav) {
  margin: 0;
}
.filter-left :deep(.ant-tabs-nav::before) {
  border: none;
}
.filter-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.goods-info {
  display: flex;
  gap: 12px;
  align-items: center;
}
.goods-cover {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.demand-icon {
  width: 60px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 6px;
  flex-shrink: 0;
}
.goods-detail {
  flex: 1;
  min-width: 0;
}
.goods-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-text {
  font-size: 15px;
  font-weight: 600;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.detail-content {
  display: flex;
  flex-direction: column;
}
.detail-header {
  display: flex;
  gap: 16px;
  align-items: center;
}
.detail-cover {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.demand-icon-large {
  width: 120px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  flex-shrink: 0;
}
.detail-header-info {
  flex: 1;
  min-width: 0;
}
.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}
.detail-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.audit-action-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}
.audit-action-form {
  flex: 1;
}
.audit-action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 服务详情弹窗样式 */
.service-detail-modal {
  width: 100%;
}
.product-section {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}
.product-gallery {
  width: 420px;
  flex-shrink: 0;
}
.main-image {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  margin-bottom: 12px;
}
.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-list {
  display: flex;
  gap: 8px;
}
.thumb-item {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all 0.2s;
}
.thumb-item.active {
  border-color: #1890ff;
  opacity: 1;
}
.thumb-item:hover {
  opacity: 1;
}
.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-info {
  flex: 1;
  min-width: 0;
}
.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.product-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}
.price-box {
  background: #fff7f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.price-row:last-child {
  margin-bottom: 0;
}
.price-label {
  font-size: 13px;
  color: #999;
  width: 50px;
  flex-shrink: 0;
}
.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4f;
}
.price-info {
  font-size: 14px;
  color: #333;
}
.guarantee-tags {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.seller-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.seller-detail {
  flex: 1;
}
.seller-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.seller-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}
.detail-body {
  width: 100%;
}
.detail-left {
  width: 100%;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}
.detail-content h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 10px 0;
  padding-left: 10px;
  border-left: 3px solid #1890ff;
}
.detail-content h3:first-child {
  margin-top: 0;
}
.detail-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 12px 0;
}
.detail-content ul {
  padding-left: 20px;
  margin: 0 0 14px 0;
}
.detail-content li {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}
.audit-card {
  background: #fafafa;
  padding: 20px;
}

/* 需求详情弹窗样式 */
.demand-detail-modal {
  width: 100%;
}
.detail-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}
.card-sub-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  padding-left: 10px;
  border-left: 3px solid #1890ff;
}
.meta-line {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #999;
  flex-wrap: wrap;
}
.meta-author {
  color: #666;
  font-weight: 500;
}
.meta-time {
  color: #999;
}
.status-tag {
  margin-left: auto;
}
.info-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}
.info-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.info-row:last-child {
  border-bottom: none;
}
.info-label {
  font-size: 13px;
  color: #999;
  width: 72px;
  flex-shrink: 0;
}
.info-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}
.price-text {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}
.stats-row {
  display: flex;
  gap: 32px;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 16px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-icon {
  font-size: 16px;
  color: #1890ff;
}
.stat-label {
  font-size: 13px;
  color: #999;
}
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.detail-intro-card {
  background: #fafafa;
}
.detail-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  white-space: pre-line;
  margin-bottom: 8px;
}
.requirement-list {
  padding-left: 20px;
  margin: 0;
}
.requirement-list li {
  font-size: 14px;
  color: #666;
  line-height: 2;
}
</style>
