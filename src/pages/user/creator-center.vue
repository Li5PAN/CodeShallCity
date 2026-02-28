<template>
  <div class="creator-page">

    <!-- 公告栏 -->
    <div class="notice-bar">
      <a-carousel autoplay dots-class="notice-dots" :autoplay-speed="4000">
        <div class="notice-item" v-for="n in notices" :key="n.id">
          <NotificationOutlined class="notice-icon" />
          <span class="notice-tag">{{ n.tag }}</span>
          <span class="notice-text">{{ n.content }}</span>
          <span class="notice-time">{{ n.time }}</span>
        </div>
      </a-carousel>
    </div>

    <div class="creator-body">
      <!-- 左侧主区域 -->
      <div class="creator-main">

        <!-- 快捷发布 -->
        <div class="creator-card">
          <div class="card-title">快捷发布</div>
          <div class="publish-grid">
            <div class="publish-item" @click="router.push('/user/write-article')">
              <div class="publish-icon-wrap" style="background:#e6f7ff">
                <EditOutlined style="color:#1890ff;font-size:28px" />
              </div>
              <div class="publish-label">写文章</div>
              <div class="publish-desc">分享技术见解，输出优质内容</div>
            </div>
            <div class="publish-item" @click="demandModalVisible = true">
              <div class="publish-icon-wrap" style="background:#fff7e6">
                <TrophyOutlined style="color:#fa8c16;font-size:28px" />
              </div>
              <div class="publish-label">发布需求</div>
              <div class="publish-desc">发布悬赏需求，寻找专业服务商</div>
            </div>
            <div class="publish-item" @click="serviceModalVisible = true">
              <div class="publish-icon-wrap" style="background:#f6ffed">
                <ShopOutlined style="color:#52c41a;font-size:28px" />
              </div>
              <div class="publish-label">发布服务</div>
              <div class="publish-desc">上架专业服务，开启接单之旅</div>
            </div>
          </div>
        </div>

        <!-- 创作数据 -->
        <div class="creator-card">
          <div class="card-title">创作数据</div>
          <div class="data-grid">
            <div class="data-item" v-for="d in dataStats" :key="d.label">
              <component :is="d.icon" :style="{ color: d.color, fontSize: '20px' }" />
              <div class="data-num" :style="{ color: d.color }">{{ d.value }}</div>
              <div class="data-label">{{ d.label }}</div>
            </div>
          </div>
        </div>

        <!-- 最近发布 -->
        <div class="creator-card">
          <div class="card-title-row">
            <span class="card-title">最近发布</span>
            <a-radio-group v-model:value="recentType" size="small" button-style="solid">
              <a-radio-button value="article">文章</a-radio-button>
              <a-radio-button value="service">服务</a-radio-button>
              <a-radio-button value="demand">悬赏</a-radio-button>
            </a-radio-group>
          </div>
          <div class="recent-list">
            <div class="recent-item" v-for="item in recentItems" :key="item.id">
              <div class="recent-info">
                <div class="recent-title">{{ item.title }}</div>
                <div class="recent-meta">
                  <a-tag size="small" :color="item.statusColor">{{ item.statusText }}</a-tag>
                  <span>{{ item.time }}</span>
                </div>
              </div>
              <div class="recent-stats">
                <span v-if="item.reads !== undefined"><EyeOutlined /> {{ item.reads }}</span>
                <span v-if="item.orders !== undefined"><ShoppingCartOutlined /> {{ item.orders }}</span>
                <span v-if="item.applies !== undefined"><TeamOutlined /> {{ item.applies }}</span>
              </div>
            </div>
            <div v-if="recentItems.length === 0" class="empty-state">暂无内容</div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="creator-side">

        <!-- 成为服务提供者 -->
        <div class="creator-card provider-card">
          <div class="provider-header">
            <SafetyCertificateOutlined class="provider-icon" />
            <div>
              <div class="provider-title">成为服务提供者</div>
              <div class="provider-sub">通过认证，开启专业接单</div>
            </div>
          </div>
          <div v-if="!isProvider" class="provider-benefits">
            <div class="benefit-item" v-for="b in benefits" :key="b">
              <CheckCircleOutlined style="color:#52c41a" /> {{ b }}
            </div>
          </div>
          <div v-if="isProvider" class="provider-certified">
            <a-result status="success" title="已认证服务提供者" sub-title="您已通过认证，可以在平台上架服务并接单" style="padding:12px 0" />
          </div>
          <a-button v-if="!isProvider" type="primary" block style="background:#52c41a;border-color:#52c41a;margin-top:12px" @click="applyVisible = true">
            立即申请认证
          </a-button>
        </div>


      </div>
    </div>

    <!-- 发布需求 Modal -->
    <a-modal v-model:open="demandModalVisible" title="发布悬赏需求" width="600px" ok-text="发布悬赏" cancel-text="取消" @ok="submitDemand">
      <a-form :model="demandForm" layout="vertical" style="margin-top:8px">
        <a-form-item label="悬赏标题" required>
          <a-input v-model:value="demandForm.title" placeholder="请输入悬赏标题" :maxlength="80" show-count />
        </a-form-item>
        <a-form-item label="需求描述" required>
          <a-textarea v-model:value="demandForm.desc" :rows="4" placeholder="详细描述需求内容、技术要求、交付标准等" :maxlength="500" show-count />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="需求分类" required>
              <a-select v-model:value="demandForm.category" placeholder="请选择分类" style="width:100%">
                <a-select-option v-for="c in demandCategories" :key="c" :value="c">{{ c }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="悬赏金额（元）" required>
              <a-input-number v-model:value="demandForm.budget" :min="100" :max="999999" style="width:100%" placeholder="请输入金额" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="截止时间">
          <a-date-picker v-model:value="demandForm.deadline" style="width:100%" placeholder="请选择截止日期" />
        </a-form-item>
        <a-form-item label="技术标签">
          <div class="tag-input-wrap">
            <a-tag v-for="tag in demandForm.tags" :key="tag" closable @close="demandForm.tags = demandForm.tags.filter(t=>t!==tag)" color="orange">{{ tag }}</a-tag>
            <a-input v-if="demandTagVisible" ref="demandTagRef" v-model:value="demandTagValue" size="small" style="width:80px" @blur="confirmDemandTag" @keyup.enter="confirmDemandTag" />
            <a-tag v-else-if="demandForm.tags.length < 5" style="cursor:pointer;border-style:dashed" @click="demandTagVisible=true;$nextTick(()=>demandTagRef?.focus())">
              <PlusOutlined /> 添加
            </a-tag>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 发布服务 Modal -->
    <a-modal v-model:open="serviceModalVisible" title="发布新服务" width="600px" ok-text="提交审核" cancel-text="取消" @ok="submitService">
      <a-form :model="serviceForm" layout="vertical" style="margin-top:8px">
        <a-form-item label="服务标题" required>
          <a-input v-model:value="serviceForm.title" placeholder="请输入服务标题，建议20字以内" :maxlength="50" show-count />
        </a-form-item>
        <a-form-item label="服务描述" required>
          <a-textarea v-model:value="serviceForm.desc" :rows="3" placeholder="简要描述服务内容" :maxlength="200" show-count />
        </a-form-item>
        <a-form-item label="服务分类" required>
          <a-select v-model:value="serviceForm.category" placeholder="请选择分类" style="width:100%">
            <a-select-option v-for="c in serviceCategories" :key="c" :value="c">{{ c }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="服务价格（元）" required>
          <a-input-number v-model:value="serviceForm.price" :min="1" :max="99999" style="width:100%" placeholder="请输入价格" />
        </a-form-item>
        <a-form-item label="服务标签">
          <div class="tag-input-wrap">
            <a-tag v-for="tag in serviceForm.tags" :key="tag" closable @close="serviceForm.tags = serviceForm.tags.filter(t=>t!==tag)" color="blue">{{ tag }}</a-tag>
            <a-input v-if="serviceTagVisible" ref="serviceTagRef" v-model:value="serviceTagValue" size="small" style="width:80px" @blur="confirmServiceTag" @keyup.enter="confirmServiceTag" />
            <a-tag v-else-if="serviceForm.tags.length < 5" style="cursor:pointer;border-style:dashed" @click="serviceTagVisible=true;$nextTick(()=>serviceTagRef?.focus())">
              <PlusOutlined /> 添加标签
            </a-tag>
          </div>
        </a-form-item>
        <a-form-item label="封面图片">
          <div class="cover-upload" @click="serviceCoverRef?.click()">
            <img v-if="serviceForm.coverUrl" :src="serviceForm.coverUrl" class="cover-preview" />
            <div v-else class="cover-placeholder">
              <PictureOutlined style="font-size:28px;color:#ccc" />
              <span>点击上传封面（推荐 4:3）</span>
            </div>
          </div>
          <input ref="serviceCoverRef" type="file" accept="image/*" style="display:none" @change="onServiceCoverChange" />
        </a-form-item>
        <a-form-item label="服务详情">
          <a-textarea v-model:value="serviceForm.detail" :rows="6" placeholder="详细描述服务内容、交付物、服务流程等" :maxlength="2000" show-count />
        </a-form-item>
        <a-form-item label="交付周期">
          <a-select v-model:value="serviceForm.deliveryDays" style="width:100%">
            <a-select-option :value="1">1天内交付</a-select-option>
            <a-select-option :value="3">3天内交付</a-select-option>
            <a-select-option :value="7">7天内交付</a-select-option>
            <a-select-option :value="14">14天内交付</a-select-option>
            <a-select-option :value="30">30天内交付</a-select-option>
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
        <a-alert message="请如实填写以下信息，平台将在 3 个工作日内完成审核，审核结果将通过站内信通知您。" type="info" show-icon style="margin-bottom:20px" />

        <a-form :model="applyForm" layout="vertical" ref="applyFormRef">

          <div class="form-section-title">基本信息</div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="真实姓名" name="realName" :rules="[{ required: true, message: '请输入真实姓名' }]">
                <a-input v-model:value="applyForm.realName" placeholder="请输入真实姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="身份证号" name="idCard" :rules="[{ required: true, message: '请输入身份证号' }, { pattern: /^\d{17}[\dX]$/, message: '身份证号格式不正确' }]">
                <a-input v-model:value="applyForm.idCard" placeholder="请输入18位身份证号" :maxlength="18" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="联系手机" name="phone" :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]">
                <a-input v-model:value="applyForm.phone" placeholder="请输入手机号" :maxlength="11" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="所在城市" name="city" :rules="[{ required: true, message: '请输入所在城市' }]">
                <a-input v-model:value="applyForm.city" placeholder="如：北京市朝阳区" />
              </a-form-item>
            </a-col>
          </a-row>

          <div class="form-section-title">专业背景</div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="最高学历" name="education" :rules="[{ required: true, message: '请选择学历' }]">
                <a-select v-model:value="applyForm.education" placeholder="请选择">
                  <a-select-option value="高中">高中及以下</a-select-option>
                  <a-select-option value="大专">大专</a-select-option>
                  <a-select-option value="本科">本科</a-select-option>
                  <a-select-option value="硕士">硕士</a-select-option>
                  <a-select-option value="博士">博士</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="毕业院校" name="school">
                <a-input v-model:value="applyForm.school" placeholder="请输入毕业院校名称" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="从业年限" name="workYears" :rules="[{ required: true, message: '请选择从业年限' }]">
                <a-select v-model:value="applyForm.workYears" placeholder="请选择">
                  <a-select-option value="1">1年以下</a-select-option>
                  <a-select-option value="1-3">1-3年</a-select-option>
                  <a-select-option value="3-5">3-5年</a-select-option>
                  <a-select-option value="5-10">5-10年</a-select-option>
                  <a-select-option value="10+">10年以上</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="当前职位" name="position">
                <a-input v-model:value="applyForm.position" placeholder="如：高级后端工程师" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="所在公司/机构" name="company">
            <a-input v-model:value="applyForm.company" placeholder="请输入当前就职公司或机构名称（可填在校生）" />
          </a-form-item>

          <div class="form-section-title">技能与服务</div>
          <a-form-item label="主要技术方向" name="skills" :rules="[{ required: true, message: '请选择技术方向' }]">
            <a-select v-model:value="applyForm.skills" mode="multiple" placeholder="请选择（可多选）" :max-tag-count="4">
              <a-select-option v-for="s in skillOptions" :key="s" :value="s">{{ s }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="服务类型" name="serviceTypes" :rules="[{ required: true, message: '请选择服务类型' }]">
            <a-checkbox-group v-model:value="applyForm.serviceTypes">
              <a-checkbox v-for="t in serviceTypeOptions" :key="t" :value="t">{{ t }}</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="个人简介 / 服务说明" name="intro" :rules="[{ required: true, message: '请填写个人简介' }]">
            <a-textarea v-model:value="applyForm.intro" :rows="4" placeholder="请介绍您的技术背景、擅长领域、可提供的服务内容，以及过往项目经验（100字以上）" :maxlength="500" show-count />
          </a-form-item>

          <div class="form-section-title">资质证明（文字填写）</div>
          <a-form-item label="专业证书 / 资质认证">
            <a-textarea v-model:value="applyForm.certificates" :rows="3" placeholder="请列举您持有的相关证书，如：软件设计师证书（2023年）、AWS Solutions Architect（2024年）、PMP证书等" :maxlength="300" show-count />
          </a-form-item>
          <a-form-item label="代表性项目经历">
            <a-textarea v-model:value="applyForm.projects" :rows="4" placeholder="请描述1-3个代表性项目，包括项目名称、技术栈、您的角色和主要贡献（如：某电商平台后端开发，负责订单系统设计，日均处理100万+订单）" :maxlength="500" show-count />
          </a-form-item>
          <a-form-item label="开源贡献 / 作品链接">
            <a-textarea v-model:value="applyForm.portfolio" :rows="2" placeholder="如 GitHub 主页、个人博客、开源项目地址等（选填）" :maxlength="200" show-count />
          </a-form-item>

          <div class="form-section-title">承诺与协议</div>
          <a-form-item name="agreed" :rules="[{ validator: checkAgreed }]">
            <a-checkbox v-model:checked="applyForm.agreed">
              我已阅读并同意
              <a style="color:#52c41a">《服务提供者服务协议》</a>
              和
              <a style="color:#52c41a">《平台规范与诚信承诺》</a>
              ，保证所填信息真实有效，如有虚假愿承担相应责任。
            </a-checkbox>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  EditOutlined, TrophyOutlined, ShopOutlined, EyeOutlined,
  ShoppingCartOutlined, TeamOutlined, NotificationOutlined,
  SafetyCertificateOutlined, CheckCircleOutlined,
  FileTextOutlined, StarOutlined, PlusOutlined, PictureOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const applyVisible = ref(false)
const isProvider = ref(false)
const recentType = ref('article')
const applyFormRef = ref(null)

// 发布需求
const demandModalVisible = ref(false)
const demandTagVisible = ref(false)
const demandTagValue = ref('')
const demandTagRef = ref(null)
const demandCategories = ['人工智能', 'Java', 'Python', 'Vue/React', '移动开发', '数据库', '运维部署', '大数据', '其他']
const demandForm = reactive({ title: '', desc: '', category: undefined, budget: null, deadline: null, tags: [] })
const confirmDemandTag = () => {
  const val = demandTagValue.value.trim()
  if (val && !demandForm.tags.includes(val)) demandForm.tags.push(val)
  demandTagVisible.value = false; demandTagValue.value = ''
}
const submitDemand = () => {
  if (!demandForm.title.trim()) { message.warning('请输入悬赏标题'); return }
  if (!demandForm.category) { message.warning('请选择需求分类'); return }
  if (!demandForm.budget) { message.warning('请输入悬赏金额'); return }
  demandModalVisible.value = false
  Object.assign(demandForm, { title: '', desc: '', category: undefined, budget: null, deadline: null, tags: [] })
  message.success('悬赏发布成功')
}

// 发布服务
const serviceModalVisible = ref(false)
const serviceTagVisible = ref(false)
const serviceTagValue = ref('')
const serviceTagRef = ref(null)
const serviceCategories = ['人工智能', 'Java', 'Python', 'Vue/React', '移动开发', '数据库', '运维部署', '大数据', '区块链', '其他']
const serviceForm = reactive({ title: '', desc: '', category: undefined, price: null, deliveryDays: 7, tags: [], detail: '', coverUrl: '' })
const serviceCoverRef = ref(null)
const onServiceCoverChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { serviceForm.coverUrl = ev.target.result }
  reader.readAsDataURL(file)
}
const confirmServiceTag = () => {
  const val = serviceTagValue.value.trim()
  if (val && !serviceForm.tags.includes(val)) serviceForm.tags.push(val)
  serviceTagVisible.value = false; serviceTagValue.value = ''
}
const submitService = () => {
  if (!serviceForm.title.trim()) { message.warning('请输入服务标题'); return }
  if (!serviceForm.category) { message.warning('请选择服务分类'); return }
  if (!serviceForm.price) { message.warning('请输入服务价格'); return }
  serviceModalVisible.value = false
  Object.assign(serviceForm, { title: '', desc: '', category: undefined, price: null, deliveryDays: 7, tags: [], detail: '', coverUrl: '' })
  message.success('已提交审核，审核通过后自动上架')
}

const notices = ref([
  { id: 1, tag: '平台公告', content: '平台服务协议已更新，请创作者查阅最新版本，新版本将于 2026-04-01 正式生效。', time: '2026-03-01' },
  { id: 2, tag: '活动通知', content: '3月创作激励计划开启！优质文章可获得额外流量扶持，单篇最高奖励 500 积分。', time: '2026-03-02' },
  { id: 3, tag: '系统通知', content: '服务市场新增「AI应用开发」分类，欢迎相关服务商入驻，享受首月零佣金优惠。', time: '2026-03-03' },
])

const dataStats = ref([
  { label: '文章总数', value: 6, color: '#1890ff', icon: FileTextOutlined },
  { label: '总阅读量', value: '12.5k', color: '#52c41a', icon: EyeOutlined },
  { label: '总获赞', value: '3.8k', color: '#ff4d4f', icon: StarOutlined },
  { label: '上架服务', value: 3, color: '#fa8c16', icon: ShopOutlined },
  { label: '累计成交', value: 214, color: '#722ed1', icon: ShoppingCartOutlined },
  { label: '发布悬赏', value: 4, color: '#13c2c2', icon: TrophyOutlined },
])

const recentData = {
  article: [
    { id: 1, title: '深入解析CPU调度：操作系统的核心资源分配机制', statusText: '已发布', statusColor: 'green', time: '2026-02-27', reads: '1.5k' },
    { id: 2, title: 'Vue3 Composition API 最佳实践总结', statusText: '已发布', statusColor: 'green', time: '2026-02-20', reads: '2.3k' },
    { id: 3, title: 'Docker容器化部署实战指南', statusText: '草稿', statusColor: 'default', time: '2026-02-15', reads: 0 },
  ],
  service: [
    { id: 1, title: 'Java大厂面试课，一套搞定offer', statusText: '已上架', statusColor: 'green', time: '2026-02-25', orders: 128 },
    { id: 2, title: 'Vue3 + TypeScript 企业级实战', statusText: '已上架', statusColor: 'green', time: '2026-02-18', orders: 86 },
    { id: 3, title: 'Docker + K8s 容器化部署实战', statusText: '审核中', statusColor: 'orange', time: '2026-03-01', orders: 0 },
  ],
  demand: [
    { id: 1, title: 'MiniMax-M2.1 智能客服系统开发', statusText: '招募中', statusColor: 'green', time: '2026-03-03', applies: 12 },
    { id: 2, title: 'React Native 跨平台移动端应用开发', statusText: '进行中', statusColor: 'blue', time: '2026-02-28', applies: 7 },
    { id: 3, title: 'Vue3 后台管理系统开发', statusText: '招募中', statusColor: 'green', time: '2026-03-01', applies: 9 },
  ]
}
const recentItems = computed(() => recentData[recentType.value])

const benefits = ['平台认证标识，提升信任度', '优先展示在服务市场搜索结果', '享受平台流量扶持与推荐', '专属客服通道，快速处理纠纷', '参与平台优质服务商激励计划']

const skillOptions = ['Java', 'Python', 'Vue/React', 'Node.js', 'Go', 'C/C++', 'Rust', '人工智能/ML', '大数据', '移动开发', '数据库', '运维/DevOps', '区块链', 'UI/UX设计', '产品管理']
const serviceTypeOptions = ['技术咨询', '代码开发', '项目外包', '课程辅导', '文档撰写', '系统架构设计', '数据分析', '其他']

const applyForm = reactive({
  realName: '', idCard: '', phone: '', city: '',
  education: undefined, school: '', workYears: undefined, position: '', company: '',
  skills: [], serviceTypes: [],
  intro: '', certificates: '', projects: '', portfolio: '',
  agreed: false
})

const checkAgreed = (_, value) => value ? Promise.resolve() : Promise.reject('请阅读并同意相关协议')

const submitApply = () => {
  applyFormRef.value?.validate().then(() => {
    applyVisible.value = false
    isProvider.value = true
    message.success('申请已提交，平台将在 3 个工作日内完成审核')
  }).catch(() => {
    message.warning('请完整填写必填信息')
  })
}
</script>

<style scoped>
.creator-page { width: 100%; }

/* 公告栏 */
.notice-bar { background: #fff; border-radius: 8px; padding: 0 16px; margin-bottom: 16px; height: 44px; display: flex; align-items: center; overflow: hidden; }
.notice-bar :deep(.ant-carousel) { width: 100%; }
.notice-bar :deep(.slick-slide) { height: 44px; display: flex !important; align-items: center; }
.notice-item { display: flex !important; align-items: center; gap: 10px; height: 44px; font-size: 13px; color: #555; }
.notice-icon { color: #fa8c16; font-size: 15px; flex-shrink: 0; }
.notice-tag { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; border-radius: 4px; padding: 1px 6px; font-size: 11px; flex-shrink: 0; }
.notice-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notice-time { color: #bbb; font-size: 12px; flex-shrink: 0; }

/* 布局 */
.creator-body { display: flex; gap: 16px; align-items: flex-start; }
.creator-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.creator-side { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

/* 卡片 */
.creator-card { background: #fff; border-radius: 8px; padding: 20px; }
.card-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 16px; }
.card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

/* 快捷发布 */
.publish-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.publish-item { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 12px; border: 1px solid #f0f0f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: center; }
.publish-item:hover { border-color: #52c41a; box-shadow: 0 2px 8px rgba(82,196,26,0.15); transform: translateY(-2px); }
.publish-icon-wrap { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.publish-label { font-size: 15px; font-weight: 600; color: #333; }
.publish-desc { font-size: 12px; color: #999; line-height: 1.4; }

/* 数据统计 */
.data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.data-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; background: #fafafa; border-radius: 8px; }
.data-num { font-size: 20px; font-weight: 700; }
.data-label { font-size: 12px; color: #999; }

/* 最近发布 */
.recent-list { display: flex; flex-direction: column; }
.recent-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.recent-item:last-child { border-bottom: none; }
.recent-info { flex: 1; min-width: 0; margin-right: 12px; }
.recent-title { font-size: 14px; color: #333; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.recent-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #bbb; }
.recent-stats { display: flex; gap: 12px; font-size: 12px; color: #bbb; flex-shrink: 0; }
.empty-state { padding: 24px; text-align: center; color: #ccc; font-size: 13px; }

/* 服务提供者 */
.provider-card { border: 1px solid #b7eb8f; background: linear-gradient(135deg, #f6ffed 0%, #fff 100%); }
.provider-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.provider-icon { font-size: 32px; color: #52c41a; }
.provider-title { font-size: 15px; font-weight: 700; color: #333; }
.provider-sub { font-size: 12px; color: #999; margin-top: 2px; }
.provider-benefits { display: flex; flex-direction: column; gap: 8px; }
.benefit-item { font-size: 13px; color: #555; display: flex; align-items: center; gap: 6px; }



/* 申请弹窗 */
.apply-modal { max-height: 60vh; overflow-y: auto; padding-right: 4px; }
.form-section-title { font-size: 14px; font-weight: 600; color: #333; margin: 16px 0 12px; padding-left: 8px; border-left: 3px solid #52c41a; }
.form-section-title:first-child { margin-top: 0; }
.tag-input-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cover-upload { width: 100%; height: 140px; border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s; }
.cover-upload:hover { border-color: #52c41a; }
.cover-preview { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #bbb; font-size: 13px; }
</style>
