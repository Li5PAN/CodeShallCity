<template>
  <div class="creator-page">
    <!-- 简化公告栏 -->
    <div class="notice-bar" v-if="activeNotice">
      <NotificationOutlined class="notice-icon" />
      <span class="notice-tag">{{ activeNotice.tag }}</span>
      <span class="notice-text">{{ activeNotice.content }}</span>
      <a-button
        type="text"
        size="small"
        class="notice-close"
        @click="activeNotice = null"
      >
        <template #icon><CloseOutlined /></template>
      </a-button>
    </div>

    <div class="creator-body">
      <!-- 左侧主区域 -->
      <div class="creator-main">
        <!-- 快捷发布区 -->
        <div class="creator-card publish-card">
          <div class="card-title">快捷发布</div>
          <div class="publish-grid">
            <div
              class="publish-item"
              @click="router.push('/user/write-article')"
            >
              <div class="publish-icon-wrap publish-gradient-blue">
                <EditOutlined style="color: #fff; font-size: 28px" />
              </div>
              <div class="publish-label">写文章</div>
              <div class="publish-stat">
                已写 {{ publishStats.articles }} 篇
              </div>
            </div>
            <div class="publish-item" @click="demandModalVisible = true">
              <div class="publish-icon-wrap publish-gradient-orange">
                <TrophyOutlined style="color: #fff; font-size: 28px" />
              </div>
              <div class="publish-label">发布需求</div>
              <div class="publish-stat">
                已发布 {{ publishStats.demands }} 个
              </div>
            </div>
            <div
              v-if="isProvider"
              class="publish-item"
              @click="serviceModalVisible = true"
            >
              <div class="publish-icon-wrap publish-gradient-green">
                <ShopOutlined style="color: #fff; font-size: 28px" />
              </div>
              <div class="publish-label">发布服务</div>
              <div class="publish-stat">
                已上架 {{ publishStats.services }} 项
              </div>
            </div>
          </div>
        </div>

        <!-- 创作战绩 -->
        <div class="creator-card stats-card">
          <div class="card-title">创作战绩</div>
          <div class="stats-grid">
            <div
              class="stat-item"
              v-for="s in filteredStatsData"
              :key="s.label"
            >
              <div class="stat-icon" :style="{ background: s.gradient }">
                <component :is="s.icon" style="color: #fff; font-size: 18px" />
              </div>
              <div class="stat-main">
                <div class="stat-value">{{ s.value }}</div>
                <div class="stat-label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的内容管理 - 与独立页面一致的样式 -->
        <div class="creator-card content-manage-card">
          <div class="card-title-row">
            <span class="card-title">内容管理</span>
          </div>

          <a-tabs v-model:activeKey="contentTab">
            <!-- 我的文章 -->
            <a-tab-pane key="article" tab="我的文章">
              <!-- 筛选栏 -->
              <div class="filter-bar">
                <a-tabs
                  v-model:activeKey="articleStatusFilter"
                  class="status-tabs"
                >
                  <a-tab-pane key="all" tab="全部" />
                  <a-tab-pane key="published" tab="已发布" />
                  <a-tab-pane key="draft" tab="草稿" />
                  <a-tab-pane key="review" tab="审核中" />
                </a-tabs>
                <a-select
                  v-model:value="articleSortBy"
                  style="width: 110px"
                  size="small"
                >
                  <a-select-option value="time">最新发布</a-select-option>
                  <a-select-option value="read">阅读最多</a-select-option>
                  <a-select-option value="like">获赞最多</a-select-option>
                </a-select>
                <a-input-search
                  v-model:value="articleSearchKeyword"
                  placeholder="搜索文章"
                  style="width: 200px"
                />
              </div>

              <div class="article-list">
                <div v-if="filteredArticles.length === 0" class="empty-state">
                  <EditOutlined style="font-size: 48px; color: #e0e0e0" />
                  <p>暂无文章，去写一篇吧</p>
                </div>

                <div
                  class="article-item"
                  v-for="item in filteredArticles"
                  :key="item.id"
                >
                  <img
                    v-if="item.cover"
                    :src="item.cover"
                    class="article-cover"
                    @click="goForumDetail(item.id)"
                    style="cursor: pointer"
                  />
                  <div
                    class="article-info"
                    @click="goForumDetail(item.id)"
                    style="cursor: pointer"
                  >
                    <div class="article-title">{{ item.title }}</div>
                    <div class="article-desc">{{ item.desc }}</div>
                    <div class="article-meta">
                      <a-tag size="small" color="blue">{{
                        item.category
                      }}</a-tag>
                      <span><EyeOutlined /> {{ item.readCount }}</span>
                      <span><LikeOutlined /> {{ item.likeCount }}</span>
                      <span><MessageOutlined /> {{ item.commentCount }}</span>
                      <span class="article-time">{{ item.publishTime }}</span>
                    </div>
                  </div>
                  <div class="article-right">
                    <a-tag
                      :color="articleStatusMap[item.status]?.color || 'default'"
                      size="small"
                      >{{
                        articleStatusMap[item.status]?.text || item.status
                      }}</a-tag
                    >
                    <div class="article-actions">
                      <a-button
                        size="small"
                        @click.stop="handleEditArticle(item)"
                        >编辑</a-button
                      >
                      <a-popconfirm
                        title="确认删除该文章？"
                        ok-text="删除"
                        cancel-text="取消"
                        @confirm="deleteArticle(item.id)"
                      >
                        <a-button size="small" danger @click.stop
                          >删除</a-button
                        >
                      </a-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <!-- 我的服务（仅服务商） -->
            <a-tab-pane key="service" tab="我的服务" v-if="isProvider">
              <!-- 筛选栏 -->
              <div class="filter-bar">
                <a-tabs
                  v-model:activeKey="serviceStatusFilter"
                  class="status-tabs"
                >
                  <a-tab-pane key="all" tab="全部" />
                  <a-tab-pane key="on" tab="已上架" />
                  <a-tab-pane key="off" tab="已下架" />
                  <a-tab-pane key="review" tab="审核中" />
                </a-tabs>
                <a-input-search
                  v-model:value="serviceSearchKeyword"
                  placeholder="搜索服务名称"
                  style="width: 200px"
                />
              </div>

              <div class="service-list">
                <div v-if="filteredServices.length === 0" class="empty-state">
                  <ShopOutlined style="font-size: 48px; color: #e0e0e0" />
                  <p>暂无服务，去发布吧</p>
                </div>

                <div
                  class="service-item"
                  v-for="item in filteredServices"
                  :key="item.id"
                >
                  <img :src="item.cover" class="service-cover" />
                  <div class="service-info">
                    <div class="service-title">{{ item.title }}</div>
                    <div class="service-desc">{{ item.desc }}</div>
                    <div class="service-tags">
                      <a-tag
                        v-for="tag in item.tags"
                        :key="tag"
                        size="small"
                        color="blue"
                        >{{ tag }}</a-tag
                      >
                      <a-tag size="small" color="orange">{{
                        item.category
                      }}</a-tag>
                    </div>
                    <div class="service-meta">
                      <span>更新时间：{{ item.updateTime }}</span>
                    </div>
                  </div>
                  <div class="service-data">
                    <div class="data-item">
                      <div class="data-num">{{ item.orders }}</div>
                      <div class="data-label">成交订单</div>
                    </div>
                    <div class="data-item">
                      <div class="data-num">{{ item.rating }}</div>
                      <div class="data-label">评分</div>
                    </div>
                  </div>
                  <div class="service-price">¥ {{ item.price }}</div>
                  <div class="service-status">
                    <a-badge
                      :status="serviceStatusBadgeMap[item.status]?.badge"
                      :text="serviceStatusBadgeMap[item.status]?.text"
                    />
                  </div>
                  <div class="service-actions">
                    <a-button size="small" @click="editService(item)"
                      >编辑</a-button
                    >
                    <a-button
                      size="small"
                      :type="item.status === 'on' ? 'default' : 'primary'"
                      :danger="item.status === 'on'"
                      :disabled="item.status === 'review'"
                      @click="toggleServiceStatus(item)"
                    >
                      {{ item.status === "on" ? "下架" : "上架" }}
                    </a-button>
                    <a-popconfirm
                      title="确认删除该服务？"
                      ok-text="删除"
                      cancel-text="取消"
                      @confirm="deleteService(item.id)"
                    >
                      <a-button size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <!-- 我的需求 -->
            <a-tab-pane key="demand" tab="我的需求">
              <!-- 筛选栏 -->
              <div class="filter-bar">
                <a-tabs
                  v-model:activeKey="demandStatusFilter"
                  class="status-tabs"
                >
                  <a-tab-pane key="all" tab="全部" />
                  <a-tab-pane key="open" tab="待接单" />
                  <a-tab-pane key="progress" tab="进行中" />
                  <a-tab-pane key="done" tab="已完成" />
                  <a-tab-pane key="closed" tab="已关闭" />
                </a-tabs>
                <a-input-search
                  v-model:value="demandSearchKeyword"
                  placeholder="搜索需求标题"
                  style="width: 200px"
                />
              </div>

              <div class="demand-list">
                <div v-if="filteredDemands.length === 0" class="empty-state">
                  <TrophyOutlined style="font-size: 48px; color: #e0e0e0" />
                  <p>暂无悬赏需求</p>
                </div>

                <div
                  class="demand-item"
                  v-for="item in filteredDemands"
                  :key="item.id"
                >
                  <div class="demand-main" style="cursor: pointer">
                    <div class="demand-title" @click="goDemandDetail(item.id)">
                      {{ item.title }}
                    </div>
                    <div class="demand-desc">{{ item.desc }}</div>
                    <div class="demand-tags">
                      <a-tag size="small" color="orange">{{ item.type }}</a-tag>
                      <a-tag
                        size="small"
                        :color="getDemandUrgencyColor(item.urgency)"
                        >{{ item.urgency }}</a-tag
                      >
                    </div>
                    <div class="demand-meta">
                      <span>发布时间：{{ item.publishTime }}</span>
                      <span>截止时间：{{ item.deadline }}</span>
                      <span
                        >报名人数：<strong>{{ item.applyCount }}</strong>
                        人</span
                      >
                    </div>
                  </div>
                  <div class="demand-right">
                    <div class="demand-budget">
                      ¥ {{ item.budgetMin }} ~ ¥ {{ item.budgetMax }}
                    </div>
                    <div class="demand-status">
                      <a-badge
                        :status="demandStatusBadgeMap[item.status]?.badge"
                        :text="demandStatusBadgeMap[item.status]?.text"
                      />
                    </div>
                    <div class="demand-actions">
                      <a-button
                        size="small"
                        @click.stop="goDemandDetail(item.id)"
                        >查看详情</a-button
                      >
                      <a-button
                        size="small"
                        v-if="item.status === 'PENDING'"
                        @click.stop="editDemand(item)"
                        >编辑</a-button
                      >
                      <a-button
                        size="small"
                        v-if="item.status === 'PENDING'"
                        @click.stop="
                          item.status = 'CLOSED';
                          message.success('已关闭');
                        "
                        >关闭</a-button
                      >
                      <a-popconfirm
                        title="确认删除？"
                        ok-text="删除"
                        cancel-text="取消"
                        @confirm="deleteDemand(item.id)"
                      >
                        <a-button size="small" danger @click.stop
                          >删除</a-button
                        >
                      </a-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="creator-side">
        <!-- 服务提供者卡片 -->
        <div class="creator-card provider-card">
          <!-- 未认证 -->
          <template v-if="!isProvider">
            <div class="provider-header">
              <SafetyCertificateOutlined class="provider-icon" />
              <div>
                <div class="provider-title">成为服务提供者</div>
                <div class="provider-sub">通过认证，开启专业接单</div>
              </div>
            </div>
            <div class="provider-benefits">
              <div class="benefit-item" v-for="b in benefits" :key="b">
                <CheckCircleOutlined style="color: #52c41a" /> {{ b }}
              </div>
            </div>
            <a-button
              type="primary"
              block
              class="apply-btn"
              @click="applyVisible = true"
            >
              立即申请认证
            </a-button>
          </template>
          <!-- 已认证 - 服务商工作台风格 -->
          <template v-else>
            <div class="provider-workspace">
              <div class="provider-badge">
                <SafetyCertificateOutlined /> 已认证服务商
              </div>
              <div class="provider-stats">
                <div class="provider-stat-item">
                  <div class="provider-stat-num">
                    {{ providerStats.pendingOrders }}
                  </div>
                  <div class="provider-stat-label">待处理订单</div>
                </div>
                <div class="provider-stat-item">
                  <div class="provider-stat-num">
                    ¥{{ providerStats.todayIncome }}
                  </div>
                  <div class="provider-stat-label">今日收入</div>
                </div>
              </div>
              <a-button
                type="primary"
                block
                class="manage-btn"
                @click="router.push('/user/my-services')"
              >
                服务商管理
              </a-button>
            </div>
          </template>
        </div>

        <!-- 快捷导航 -->
        <div class="creator-card quick-nav-card">
          <div class="card-title">快捷导航</div>
          <div class="quick-nav-grid">
            <div
              v-for="item in quickNavItems"
              :key="item.name"
              class="quick-nav-item"
              :title="item.label"
              @click="router.push(item.path)"
            >
              <component :is="item.icon" class="quick-nav-icon" />
              <span class="quick-nav-label">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <!-- 创作工具推荐 -->
        <div class="creator-card tools-card">
          <div class="card-title">创作工具推荐</div>
          <div class="tools-list">
            <div
              class="tool-item"
              v-for="t in tools"
              :key="t.name"
              @click="openTool(t.url)"
            >
              <component :is="t.icon" class="tool-icon" />
              <span class="tool-name">{{ t.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布需求 Modal -->
    <DemandPublishModal
      v-model:open="demandModalVisible"
      :editingDemand="editingDemand"
      @success="onDemandSuccess"
    />

    <!-- 发布服务 Modal -->
    <a-modal
      v-model:open="serviceModalVisible"
      :title="editingService ? '编辑服务' : '发布新服务'"
      width="600px"
      :ok-text="editingService ? '保存修改' : '提交审核'"
      cancel-text="取消"
      @ok="submitService"
    >
      <a-form :model="serviceForm" layout="vertical" style="margin-top: 8px">
        <a-form-item label="服务标题" required>
          <a-input
            v-model:value="serviceForm.title"
            placeholder="请输入服务标题，建议20字以内"
            :maxlength="50"
            show-count
          />
        </a-form-item>
        <a-form-item label="服务描述" required>
          <a-textarea
            v-model:value="serviceForm.desc"
            :rows="3"
            placeholder="简要描述服务内容"
            :maxlength="200"
            show-count
          />
        </a-form-item>
        <a-form-item label="服务分类" required>
          <a-select
            v-model:value="serviceForm.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <a-select-option
              v-for="c in serviceCategories"
              :key="c"
              :value="c"
              >{{ c }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item label="服务价格（元）" required>
          <a-input-number
            v-model:value="serviceForm.price"
            :min="1"
            :max="99999"
            style="width: 100%"
            placeholder="请输入价格"
          />
        </a-form-item>
        <a-form-item label="服务标签">
          <div class="tag-input-wrap">
            <a-tag
              v-for="tag in serviceForm.tags"
              :key="tag"
              closable
              @close="
                serviceForm.tags = serviceForm.tags.filter((t) => t !== tag)
              "
              color="blue"
              >{{ tag }}</a-tag
            >
            <a-input
              v-if="serviceTagVisible"
              ref="serviceTagRef"
              v-model:value="serviceTagValue"
              size="small"
              style="width: 80px"
              @blur="confirmServiceTag"
              @keyup.enter="confirmServiceTag"
            />
            <a-tag
              v-else-if="serviceForm.tags.length < 5"
              style="cursor: pointer; border-style: dashed"
              @click="
                serviceTagVisible = true;
                $nextTick(() => serviceTagRef?.focus());
              "
            >
              <PlusOutlined /> 添加标签
            </a-tag>
          </div>
        </a-form-item>
        <a-form-item label="封面图片">
          <div class="cover-upload" @click="serviceCoverRef?.click()">
            <img
              v-if="serviceForm.coverUrl"
              :src="serviceForm.coverUrl"
              class="cover-preview"
            />
            <div v-else class="cover-placeholder">
              <PictureOutlined style="font-size: 28px; color: #ccc" />
              <span>点击上传封面（推荐 4:3）</span>
            </div>
          </div>
          <input
            ref="serviceCoverRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onServiceCoverChange"
          />
        </a-form-item>
        <a-form-item label="附图商品图">
          <div class="goods-images">
            <div
              class="goods-img-item"
              v-for="(img, idx) in serviceForm.goodsImages"
              :key="idx"
            >
              <img :src="img" class="goods-img-preview" />
              <div
                class="goods-img-remove"
                @click="serviceForm.goodsImages.splice(idx, 1)"
              >
                <CloseCircleOutlined />
              </div>
            </div>
            <div
              v-if="serviceForm.goodsImages.length < 9"
              class="goods-img-add"
              @click="goodsImgInputRef?.click()"
            >
              <PlusOutlined style="font-size: 24px; color: #ccc" />
              <span>上传图片</span>
            </div>
          </div>
          <input
            ref="goodsImgInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="onGoodsImgChange"
          />
          <div style="font-size: 12px; color: #bbb; margin-top: 4px">
            最多上传9张商品图片
          </div>
        </a-form-item>
        <a-form-item label="服务详情">
          <a-textarea
            v-model:value="serviceForm.detail"
            :rows="6"
            placeholder="详细描述服务内容、交付物、服务流程等"
            :maxlength="2000"
            show-count
          />
        </a-form-item>
        <a-form-item label="交付周期">
          <a-select
            v-model:value="serviceForm.deliveryDays"
            style="width: 100%"
          >
            <a-select-option :value="1">1天内交付</a-select-option>
            <a-select-option :value="3">3天内交付</a-select-option>
            <a-select-option :value="7">7天内交付</a-select-option>
            <a-select-option :value="14">14天内交付</a-select-option>
            <a-select-option :value="30">30天内交付</a-select-option>
            <a-select-option :value="90">90天内交付</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 服务提供者申请弹窗 -->
    <a-modal
      v-model:open="applyVisible"
      title="申请成为服务提供者"
      width="680px"
      ok-text="提交申请"
      cancel-text="取消"
      @ok="submitApply"
    >
      <div class="apply-modal">
        <a-alert
          message="请如实填写以下信息，平台将在 3 个工作日内完成审核，审核结果将通过站内信通知您。"
          type="info"
          show-icon
          style="margin-bottom: 20px"
        />
        <a-form :model="applyForm" layout="vertical" ref="applyFormRef">
          <a-form-item
            label="真实姓名"
            name="realName"
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          >
            <a-input
              v-model:value="applyForm.realName"
              placeholder="请输入真实姓名"
            />
          </a-form-item>
          <a-form-item
            label="身份证号"
            name="idCard"
            :rules="[
              { required: true, message: '请输入身份证号' },
              { pattern: /^\d{17}[\dX]$/, message: '身份证号格式不正确' },
            ]"
          >
            <a-input
              v-model:value="applyForm.idCard"
              placeholder="请输入18位身份证号"
              :maxlength="18"
            />
          </a-form-item>
          <a-form-item
            label="申请理由"
            name="reason"
            :rules="[{ required: true, message: '请填写申请理由' }]"
          >
            <a-textarea
              v-model:value="applyForm.reason"
              :rows="4"
              placeholder="文字描述申请动机或资质，便于管理员初步判断"
              :maxlength="800"
              show-count
            />
          </a-form-item>
          <a-form-item label="证明材料文件URL（可多条）" name="filesRaw">
            <a-textarea
              v-model:value="applyForm.filesRaw"
              :rows="3"
              placeholder="每行一个URL，例如：&#10;http://example.com/idcard.jpg&#10;http://example.com/certificate.pdf"
              :maxlength="2000"
              show-count
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  EditOutlined,
  TrophyOutlined,
  ShopOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  PlusOutlined,
  PictureOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CodeOutlined,
  ExperimentOutlined,
  HighlightOutlined,
  MessageOutlined,
} from "@ant-design/icons-vue";
import DemandPublishModal from "../../components/DemandPublishModal.vue";

const router = useRouter();
const applyVisible = ref(false);
const userRole = ref(localStorage.getItem("userRole") || "user");
const isProvider = ref(userRole.value === "provider");
const contentTab = ref("article");

// 服务编辑状态
const editingService = ref(null);
const serviceForm = reactive({
  title: "",
  desc: "",
  category: undefined,
  price: null,
  deliveryDays: 7,
  tags: [],
  detail: "",
  coverUrl: "",
  goodsImages: [],
});

// 文章筛选
const articleStatusFilter = ref("all");
const articleSearchKeyword = ref("");
const articleSortBy = ref("time");
const articleStatusMap = {
  published: { text: "已发布", color: "green" },
  draft: { text: "草稿", color: "default" },
  review: { text: "审核中", color: "orange" },
};

// 服务筛选
const serviceStatusFilter = ref("all");
const serviceSearchKeyword = ref("");
const serviceStatusBadgeMap = {
  on: { badge: "success", text: "已上架" },
  off: { badge: "default", text: "已下架" },
  review: { badge: "processing", text: "审核中" },
};

// 需求筛选
const demandStatusFilter = ref("all");
const demandSearchKeyword = ref("");
const demandStatusBadgeMap = {
  PENDING: { badge: "success", text: "待接单" },
  PROCESSING: { badge: "processing", text: "进行中" },
  COMPLETED: { badge: "default", text: "已完成" },
  CLOSED: { badge: "error", text: "已关闭" },
  CANCELLED: { badge: "error", text: "已取消" },
};

// 文章数据
const myArticles = ref([
  {
    id: 1,
    title: "深入解析CPU调度：操作系统的核心资源分配机制",
    desc: "本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法...",
    category: "操作系统",
    cover: "https://placehold.co/100x70/1890ff/FFFFFF?text=OS",
    status: "published",
    readCount: "1.5k",
    likeCount: 34,
    commentCount: 12,
    publishTime: "2026-02-27",
  },
  {
    id: 2,
    title: "Vue3 Composition API 最佳实践总结",
    desc: "深入讲解 Vue3 组合式 API 的使用技巧，包括 setup、响应式、生命周期等核心概念...",
    category: "Vue",
    cover: "https://placehold.co/100x70/42b883/FFFFFF?text=Vue3",
    status: "published",
    readCount: "2.3k",
    likeCount: 67,
    commentCount: 23,
    publishTime: "2026-02-20",
  },
  {
    id: 3,
    title: "Docker容器化部署实战指南",
    desc: "从Docker基础到生产环境部署，手把手带你完成容器化改造...",
    category: "运维",
    cover: "https://placehold.co/100x70/0db7ed/FFFFFF?text=Docker",
    status: "draft",
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    publishTime: "2026-02-15",
  },
  {
    id: 4,
    title: "AI大模型大师秘籍：2025AI技术全景揭秘",
    desc: "本文系统介绍了AI大模型的学习路径，分为四个阶段循序渐进...",
    category: "人工智能",
    cover: "https://placehold.co/100x70/52c41a/FFFFFF?text=AI",
    status: "published",
    readCount: "2.1k",
    likeCount: 47,
    commentCount: 18,
    publishTime: "2026-02-10",
  },
  {
    id: 5,
    title: "Spring Boot 3.x 新特性全解析",
    desc: "Spring Boot 3.x 带来了众多重磅更新，包括虚拟线程、原生镜像等...",
    category: "Java",
    cover: "https://placehold.co/100x70/ff4d4f/FFFFFF?text=Java",
    status: "review",
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    publishTime: "2026-03-01",
  },
  {
    id: 6,
    title: "MySQL 索引优化实战：从慢查询到毫秒响应",
    desc: "通过真实案例讲解MySQL索引设计原则，EXPLAIN分析，慢查询优化...",
    category: "数据库",
    cover: "https://placehold.co/100x70/FF6600/FFFFFF?text=MySQL",
    status: "published",
    readCount: "3.2k",
    likeCount: 156,
    commentCount: 42,
    publishTime: "2026-01-25",
  },
]);

// 服务数据
const myServices = ref([
  {
    id: 1,
    title: "Java大厂面试课，一套搞定offer",
    desc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套面试模拟",
    price: 399,
    orders: 128,
    rating: "4.9",
    cover: "https://placehold.co/120x80/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证"],
    category: "Java",
    status: "on",
    updateTime: "2026-02-25",
  },
  {
    id: 2,
    title: "Vue3 + TypeScript 企业级实战",
    desc: "从零搭建企业级前端项目，涵盖架构设计、性能优化、工程化实践",
    price: 299,
    orders: 86,
    rating: "4.8",
    cover: "https://placehold.co/120x80/42b883/FFFFFF?text=Vue3",
    tags: ["平台保障"],
    category: "Vue/React",
    status: "on",
    updateTime: "2026-02-18",
  },
  {
    id: 3,
    title: "Docker + K8s 容器化部署实战",
    desc: "从Docker基础到Kubernetes集群管理，企业级DevOps实践",
    price: 499,
    orders: 0,
    rating: "-",
    cover: "https://placehold.co/120x80/0db7ed/FFFFFF?text=Docker",
    tags: ["平台保障", "源码解析"],
    category: "运维部署",
    status: "review",
    updateTime: "2026-03-01",
  },
]);

// 需求数据
const myDemands = ref([
  {
    id: 1,
    title: "MiniMax-M2.1 智能客服系统开发",
    desc: "需要基于MiniMax大模型开发一套智能客服系统，支持多轮对话、意图识别",
    budgetMin: 3000,
    budgetMax: 5000,
    type: "人工智能",
    urgency: "紧急",
    applyCount: 12,
    publishTime: "2026-03-03",
    deadline: "2026-03-31",
    status: "PENDING",
  },
  {
    id: 2,
    title: "React Native 跨平台移动端应用",
    desc: "开发一款电商类App，需要支持iOS和Android双端",
    budgetMin: 10000,
    budgetMax: 15000,
    type: "移动开发",
    urgency: "一般",
    applyCount: 7,
    publishTime: "2026-02-28",
    deadline: "2026-04-15",
    status: "PROCESSING",
  },
  {
    id: 3,
    title: "MySQL 数据库性能优化咨询",
    desc: "现有系统查询慢，需要专业DBA对数据库进行诊断和优化",
    budgetMin: 1500,
    budgetMax: 2500,
    type: "数据库",
    urgency: "一般",
    applyCount: 5,
    publishTime: "2026-02-10",
    deadline: "2026-02-28",
    status: "COMPLETED",
  },
  {
    id: 4,
    title: "Vue3 后台管理系统开发",
    desc: "基于Vue3+Element Plus开发一套通用后台管理系统",
    budgetMin: 6000,
    budgetMax: 10000,
    type: "Vue/React",
    urgency: "紧急",
    applyCount: 9,
    publishTime: "2026-03-01",
    deadline: "2026-04-01",
    status: "PENDING",
  },
]);

// 筛选函数
const filteredArticles = computed(() => {
  let list = myArticles.value;
  if (articleStatusFilter.value !== "all") {
    list = list.filter((a) => a.status === articleStatusFilter.value);
  }
  if (articleSearchKeyword.value.trim()) {
    list = list.filter((a) =>
      a.title.includes(articleSearchKeyword.value.trim()),
    );
  }
  return list;
});

const filteredServices = computed(() => {
  let list = myServices.value;
  if (serviceStatusFilter.value !== "all") {
    list = list.filter((s) => s.status === serviceStatusFilter.value);
  }
  if (serviceSearchKeyword.value.trim()) {
    list = list.filter((s) =>
      s.title.includes(serviceSearchKeyword.value.trim()),
    );
  }
  return list;
});

const filteredDemands = computed(() => {
  let list = myDemands.value;
  if (demandStatusFilter.value !== "all") {
    list = list.filter((d) => d.status === demandStatusFilter.value);
  }
  if (demandSearchKeyword.value.trim()) {
    list = list.filter((d) =>
      d.title.includes(demandSearchKeyword.value.trim()),
    );
  }
  return list;
});

// 文章操作
const handleEditArticle = (item) => {
  if (item.status === "draft") {
    router.push({ name: "WriteArticle", query: { id: item.id, draft: 1 } });
  } else {
    router.push({ name: "WriteArticle", query: { id: item.id, edit: 1 } });
  }
};

const deleteArticle = (id) => {
  myArticles.value = myArticles.value.filter((a) => a.id !== id);
  message.success("已删除");
};

const goForumDetail = (id) =>
  router.push({ name: "MyForumDetail", params: { id } });

// 服务操作
const editService = (item) => {
  editingService.value = item;
  serviceForm.title = item.title;
  serviceForm.desc = item.desc;
  serviceForm.category = item.category;
  serviceForm.price = item.price;
  serviceForm.tags = [...item.tags];
  serviceForm.coverUrl = item.cover;
  serviceForm.detail = item.detail || "";
  serviceForm.deliveryDays = item.deliveryDays || 7;
  serviceModalVisible.value = true;
};

const toggleServiceStatus = (item) => {
  if (item.status === "on") {
    item.status = "off";
    message.success("已下架");
  } else {
    item.status = "on";
    message.success("已上架");
  }
};

const deleteService = (id) => {
  myServices.value = myServices.value.filter((s) => s.id !== id);
  message.success("已删除");
};

// 需求操作
const editDemand = (item) => {
  editingDemand.value = item;
  demandModalVisible.value = true;
};

const deleteDemand = (id) => {
  myDemands.value = myDemands.value.filter((d) => d.id !== id);
  message.success("已删除");
};

const goDemandDetail = (id) =>
  router.push({ name: "DemandDetail", params: { id } });

const getDemandUrgencyColor = (urgency) => {
  const colorMap = { 紧急: "orange", 一般: "blue", 常规: "default" };
  return colorMap[urgency] || "default";
};

const applyFormRef = ref(null);

// 简化公告栏 - 取第一条
const notices = ref([
  {
    id: 1,
    tag: "平台公告",
    content:
      "3月创作激励计划开启！优质文章可获得额外流量扶持，单篇最高奖励 500 积分。",
    time: "2026-03-02",
  },
]);
const activeNotice = ref(notices.value[0] || null);

// 发布需求
const demandModalVisible = ref(false);
const editingDemand = ref(null);
const onDemandSuccess = (data) => {
  if (data.isEdit) {
    // 编辑模式：更新需求数据
    const idx = myDemands.value.findIndex((d) => d.id === data.id);
    if (idx !== -1) {
      myDemands.value[idx] = {
        ...myDemands.value[idx],
        title: data.title,
        desc: data.desc,
        type: data.category,
        category: data.category,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        urgency: data.urgency,
        publishTime: data.publishDate || myDemands.value[idx].publishTime,
        deadline: data.deadline || myDemands.value[idx].deadline,
      };
    }
  } else {
    // 新建模式：添加新需求
    myDemands.value.unshift({
      id: Date.now(),
      title: data.title,
      desc: data.desc,
      type: data.category,
      category: data.category,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      urgency: data.urgency,
      status: "PENDING",
      applyCount: 0,
      publishTime: data.publishDate || new Date().toISOString().slice(0, 10),
      deadline: data.deadline || "待定",
    });
  }
  editingDemand.value = null;
};

// 发布服务
const serviceModalVisible = ref(false);
const serviceTagVisible = ref(false);
const serviceTagValue = ref("");
const serviceTagRef = ref(null);
const serviceCategories = [
  "人工智能",
  "Java",
  "Python",
  "Vue/React",
  "移动开发",
  "数据库",
  "运维部署",
  "大数据",
  "区块链",
  "其他",
];
const serviceCoverRef = ref(null);
const goodsImgInputRef = ref(null);

// 快捷发布统计数据
const publishStats = ref({
  articles: 6,
  demands: 4,
  services: 3,
});

const onServiceCoverChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    serviceForm.coverUrl = ev.target.result;
  };
  reader.readAsDataURL(file);
};
const onGoodsImgChange = (e) => {
  const files = Array.from(e.target.files);
  const remaining = 9 - serviceForm.goodsImages.length;
  files.slice(0, remaining).forEach((f) => {
    const r = new FileReader();
    r.onload = (ev) => {
      serviceForm.goodsImages.push(ev.target.result);
    };
    r.readAsDataURL(f);
  });
  e.target.value = "";
};
const confirmServiceTag = () => {
  const val = serviceTagValue.value.trim();
  if (val && !serviceForm.tags.includes(val)) serviceForm.tags.push(val);
  serviceTagVisible.value = false;
  serviceTagValue.value = "";
};
const submitService = () => {
  if (!serviceForm.title.trim()) {
    message.warning("请输入服务标题");
    return;
  }
  if (!serviceForm.category) {
    message.warning("请选择服务分类");
    return;
  }
  if (!serviceForm.price) {
    message.warning("请输入服务价格");
    return;
  }

  if (editingService.value) {
    // 编辑模式：更新服务数据
    const idx = myServices.value.findIndex(
      (s) => s.id === editingService.value.id,
    );
    if (idx !== -1) {
      myServices.value[idx] = {
        ...myServices.value[idx],
        title: serviceForm.title,
        desc: serviceForm.desc,
        category: serviceForm.category,
        price: serviceForm.price,
        tags: [...serviceForm.tags],
        cover: serviceForm.coverUrl || myServices.value[idx].cover,
        detail: serviceForm.detail,
        deliveryDays: serviceForm.deliveryDays,
        updateTime: new Date().toISOString().slice(0, 10),
      };
    }
    message.success("修改已保存");
  } else {
    // 新建模式：添加新服务
    myServices.value.unshift({
      id: Date.now(),
      title: serviceForm.title,
      desc: serviceForm.desc,
      price: serviceForm.price,
      cover:
        serviceForm.coverUrl ||
        `https://placehold.co/120x80/52c41a/FFFFFF?text=新服务`,
      tags: serviceForm.tags,
      category: serviceForm.category,
      status: "review",
      orders: 0,
      rating: "-",
      detail: serviceForm.detail,
      deliveryDays: serviceForm.deliveryDays,
      updateTime: new Date().toISOString().slice(0, 10),
    });
    message.success("已提交审核，审核通过后自动上架");
  }

  // 重置表单
  serviceModalVisible.value = false;
  editingService.value = null;
  Object.assign(serviceForm, {
    title: "",
    desc: "",
    category: undefined,
    price: null,
    deliveryDays: 7,
    tags: [],
    detail: "",
    coverUrl: "",
    goodsImages: [],
  });
};

// 创作战绩数据
const statsData = ref([
  {
    label: "文章总数",
    value: 6,
    icon: FileTextOutlined,
    gradient: "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)",
  },
  {
    label: "总阅读量",
    value: "12.5k",
    icon: EyeOutlined,
    gradient: "linear-gradient(135deg, #52c41a 0%, #95de64 100%)",
  },
  {
    label: "总获赞",
    value: "3.8k",
    icon: StarOutlined,
    gradient: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
  },
  {
    label: "上架服务",
    value: 3,
    icon: ShopOutlined,
    gradient: "linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)",
  },
  {
    label: "累计成交",
    value: 214,
    icon: ShoppingCartOutlined,
    gradient: "linear-gradient(135deg, #722ed1 0%, #b37feb 100%)",
  },
  {
    label: "发布悬赏",
    value: 4,
    icon: TrophyOutlined,
    gradient: "linear-gradient(135deg, #13c2c0 0%, #36cfc9 100%)",
  },
]);

const filteredStatsData = computed(() => {
  if (isProvider.value) return statsData.value;
  return statsData.value.filter(
    (s) => s.label !== "上架服务" && s.label !== "累计成交",
  );
});

// 已认证服务商统计数据
const providerStats = ref({
  pendingOrders: 5,
  todayIncome: 1280,
});

// 创作动态数据
const recentData = {
  article: [
    {
      id: 1,
      title: "深入解析CPU调度：操作系统的核心资源分配机制",
      statusText: "已发布",
      statusColor: "green",
      time: "2026-02-27",
      reads: "1.5k",
    },
    {
      id: 2,
      title: "Vue3 Composition API 最佳实践总结",
      statusText: "已发布",
      statusColor: "green",
      time: "2026-02-20",
      reads: "2.3k",
    },
    {
      id: 3,
      title: "Docker容器化部署实战指南",
      statusText: "草稿",
      statusColor: "default",
      time: "2026-02-15",
      reads: 0,
    },
  ],
  service: [
    {
      id: 1,
      title: "Java大厂面试课，一套搞定offer",
      statusText: "已上架",
      statusColor: "green",
      time: "2026-02-25",
      orders: 128,
    },
    {
      id: 2,
      title: "Vue3 + TypeScript 企业级实战",
      statusText: "已上架",
      statusColor: "green",
      time: "2026-02-18",
      orders: 86,
    },
    {
      id: 3,
      title: "Docker + K8s 容器化部署实战",
      statusText: "审核中",
      statusColor: "orange",
      time: "2026-03-01",
      orders: 0,
    },
  ],
  demand: [
    {
      id: 1,
      title: "MiniMax-M2.1 智能客服系统开发",
      statusText: "招募中",
      statusColor: "green",
      time: "2026-03-03",
      applies: 12,
    },
    {
      id: 2,
      title: "React Native 跨平台移动端应用开发",
      statusText: "进行中",
      statusColor: "blue",
      time: "2026-02-28",
      applies: 7,
    },
    {
      id: 3,
      title: "Vue3 后台管理系统开发",
      statusText: "招募中",
      statusColor: "green",
      time: "2026-03-01",
      applies: 9,
    },
  ],
};
const recentItems = computed(() => {
  // 非 provider 用户不能查看服务列表
  if (recentType.value === "service" && !isProvider.value) {
    return recentData.article;
  }
  return recentData[recentType.value] || [];
});

// 服务商权益
const benefits = [
  "平台认证标识，提升信任度",
  "优先展示在服务市场搜索结果",
  "享受平台流量扶持与推荐",
  "专属客服通道，快速处理纠纷",
  "参与平台优质服务商激励计划",
];

// 快捷导航数据
const quickNavItems = computed(() => {
  const items = [
    {
      name: "demands",
      label: "我的需求",
      icon: TrophyOutlined,
      path: "/user/my-demands",
    },
    {
      name: "forum",
      label: "我的论坛",
      icon: MessageOutlined,
      path: "/user/my-forum",
    },
    {
      name: "orders",
      label: "订单管理",
      icon: ShoppingCartOutlined,
      path: "/user/orders",
    },
  ];
  if (isProvider.value) {
    items.unshift({
      name: "services",
      label: "我的服务",
      icon: ShopOutlined,
      path: "/user/my-services",
    });
  }
  return items;
});

// 创作工具推荐
const tools = [
  {
    name: "Markdown编辑器",
    icon: EditOutlined,
    url: "https://markdown.com.cn",
  },
  { name: "代码高亮", icon: CodeOutlined, url: "https://highlightjs.org" },
  { name: "图片压缩", icon: ExperimentOutlined, url: "https://tinypng.com" },
  { name: "在线作图", icon: HighlightOutlined, url: "https://draw.io" },
];
const openTool = (url) => {
  window.open(url, "_blank");
};

// 申请表单
const applyForm = reactive({
  realName: "",
  idCard: "",
  reason: "",
  filesRaw: "",
});

const submitApply = () => {
  applyFormRef.value
    ?.validate()
    .then(() => {
      const files = (applyForm.filesRaw || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        real_name: applyForm.realName,
        id_card: applyForm.idCard,
        reason: applyForm.reason,
        files,
      };
      console.log("provider_apply_payload", payload);
      applyVisible.value = false;
      message.success("申请已提交，平台将在 3 个工作日内完成审核");
    })
    .catch(() => {
      message.warning("请完整填写必填信息");
    });
};
</script>

<style scoped>
.creator-page {
  width: 100%;
}

/* 简化公告栏 */
.notice-bar {
  background: linear-gradient(90deg, #fff7e6 0%, #fff 100%);
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ffd591;
}
.notice-icon {
  color: #fa8c16;
  font-size: 15px;
}
.notice-tag {
  background: #ff4d4f;
  color: #fff;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
}
.notice-text {
  flex: 1;
  font-size: 13px;
  color: #333;
}
.notice-close {
  color: #999;
}

.creator-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.creator-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.creator-side {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.creator-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 快捷发布区 - 增大卡片、渐变背景、hover效果 */
.publish-card .publish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}
.publish-card .publish-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}
.publish-card .publish-item:hover {
  transform: translateY(-4px);
  border-color: #52c41a;
  box-shadow: 0 8px 24px rgba(82, 196, 26, 0.2);
}
.publish-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.publish-gradient-blue {
  background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
}
.publish-gradient-orange {
  background: linear-gradient(135deg, #fa8c16 0%, #ffc069 100%);
}
.publish-gradient-green {
  background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
}
.publish-label {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}
.publish-stat {
  font-size: 12px;
  color: #999;
}

/* 创作战绩 - 渐变背景区分 */
.stats-card .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.stats-card .stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: #fafafa;
}
.stats-card .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stats-card .stat-main {
  flex: 1;
}
.stats-card .stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}
.stats-card .stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}

/* 右侧边栏 */
.provider-card {
  border: 1px solid #b7eb8f;
  background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
}
.provider-card .provider-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.provider-card .provider-icon {
  font-size: 32px;
  color: #52c41a;
}
.provider-card .provider-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}
.provider-card .provider-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.provider-card .provider-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.provider-card .benefit-item {
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}
.provider-card .apply-btn {
  background: #52c41a;
  border-color: #52c41a;
}

/* 已认证 - 服务商工作台 */
.provider-workspace .provider-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}
.provider-workspace .provider-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.provider-workspace .provider-stat-item {
  text-align: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}
.provider-workspace .provider-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}
.provider-workspace .provider-stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.provider-workspace .manage-btn {
  background: #52c41a;
  border-color: #52c41a;
}

/* 快捷导航 */
.quick-nav-card .quick-nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.quick-nav-card .quick-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-nav-card .quick-nav-item:hover {
  background: #f0f9eb;
}
.quick-nav-card .quick-nav-icon {
  font-size: 20px;
  color: #52c41a;
}
.quick-nav-card .quick-nav-label {
  font-size: 13px;
  color: #555;
}

/* 创作工具推荐 */
.tools-card .tools-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.tools-card .tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}
.tools-card .tool-item:hover {
  background: #f0f9eb;
}
.tools-card .tool-icon {
  font-size: 22px;
  color: #52c41a;
}
.tools-card .tool-name {
  font-size: 12px;
  color: #555;
}

/* 表单通用样式 */
.apply-modal {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}
.tag-input-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
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
.goods-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.goods-img-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}
.goods-img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.goods-img-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  line-height: 1;
}
.goods-img-add {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #bbb;
  font-size: 12px;
  transition: border-color 0.2s;
}
.goods-img-add:hover {
  border-color: #52c41a;
}

/* 内容管理卡片 */
.content-manage-card :deep(.ant-tabs-bar) {
  margin-bottom: 0;
}
.content-manage-card :deep(.ant-tabs-content) {
  background: #fff;
  border-radius: 0 0 12px 12px;
  padding: 16px 20px;
}
.content-manage-card :deep(.ant-tabs-tabpane-active) {
  background: #fff;
  border-radius: 0 0 12px 12px;
}

/* 筛选栏 */
.filter-bar {
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.status-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}
.status-tabs :deep(.ant-tabs-nav::before) {
  border: none;
}
.status-tabs :deep(.ant-tabs-nav-operations) {
  display: none !important;
}

/* 文章列表 */
.article-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.article-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.article-item:last-child {
  border-bottom: none;
}
.article-cover {
  width: 100px;
  height: 70px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.article-info {
  flex: 1;
  min-width: 0;
}
.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.article-title:hover {
  color: #1890ff;
}
.article-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: #bbb;
}
.article-time {
  margin-left: auto;
}
.article-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.article-actions {
  display: flex;
  gap: 6px;
}

/* 服务列表 */
.service-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.service-item:last-child {
  border-bottom: none;
}
.service-cover {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.service-info {
  flex: 1;
  min-width: 0;
}
.service-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.service-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #bbb;
}
.service-data {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}
.data-item {
  text-align: center;
}
.data-num {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}
.data-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.service-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff4d4f;
  flex-shrink: 0;
  width: 80px;
  text-align: right;
}
.service-status {
  flex-shrink: 0;
  width: 70px;
}
.service-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

/* 需求列表 */
.demand-list {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.demand-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.demand-item:last-child {
  border-bottom: none;
}
.demand-main {
  flex: 1;
  min-width: 0;
}
.demand-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  cursor: pointer;
}
.demand-title:hover {
  color: #1890ff;
}
.demand-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.demand-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.demand-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #bbb;
}
.demand-meta strong {
  color: #fa8c16;
}
.demand-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}
.demand-budget {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}
.demand-actions {
  display: flex;
  gap: 6px;
}

/* 空状态 */
.empty-state {
  padding: 60px;
  text-align: center;
  color: #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
</style>
