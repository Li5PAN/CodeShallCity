<template>
  <div class="service-market-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-input
        v-model:value="searchValue"
        placeholder="搜索服务"
        class="search-input"
        @keyup.enter="handleSearch(searchValue)"
      >
        <template #prefix><SearchOutlined class="search-icon" /></template>
      </a-input>
      <a-button class="search-btn" @click="handleSearch(searchValue)"
        >搜索</a-button
      >
    </div>

    <!-- 分类导航栏 -->
    <div class="category-nav">
      <div class="category-tags">
        <div
          v-for="item in visibleCategories"
          :key="item.key"
          class="category-tag"
          :class="{ active: activeCategory === item.key }"
          @click="handleCategoryClick(item)"
        >
          {{ item.name }}
        </div>
        <a-dropdown v-if="hasOverflow" trigger="click">
          <div class="more-btn">
            更多
            <DownOutlined />
          </div>
          <template #overlay>
            <a-menu
              @click="
                ({ key }) =>
                  handleCategoryClick(allCategories.find((c) => c.key === key))
              "
            >
              <a-menu-item v-for="item in hiddenCategories" :key="item.key">
                {{ item.name }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <a-row :gutter="[16, 16]" class="service-list">
      <a-col
        :xs="24"
        :sm="12"
        :md="6"
        v-for="item in serviceList"
        :key="item.id"
      >
        <a-card
          :bordered="false"
          class="service-card"
          @click="openDetail('service', { id: item.id })"
          style="cursor: pointer"
        >
          <div
            class="card-cover"
            :style="{ backgroundImage: `url(${item.cover})` }"
          ></div>
          <div class="card-content">
            <h4 class="card-title">{{ item.title }}</h4>
            <p class="card-desc">{{ item.desc }}</p>
            <div class="card-tags">
              <a-tag
                v-for="tag in item.tags"
                :key="tag"
                :color="tag === '平台保障' ? 'green' : 'blue'"
                size="small"
                >{{ tag }}</a-tag
              >
            </div>
            <div class="card-footer">
              <div class="footer-left">
                <span class="price">¥ {{ item.price }}</span>
                <span class="rating" v-if="item.rating">
                  <StarFilled style="color: #faad14; font-size: 12px" />
                  {{ item.rating }}
                </span>
              </div>
              <div class="footer-right">
                <span class="provider">{{ item.provider }}</span>
                <span class="orders">成交 {{ item.orders }}+</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalServices"
        :pageSizeOptions="['8', '12', '24', '48']"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条服务`"
        @change="handlePageChange"
        @showSizeChange="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, computed, watch } from "vue";
import {
  SearchOutlined,
  DownOutlined,
  StarFilled,
} from "@ant-design/icons-vue";

const openDetail = inject("openDetail");

const searchValue = ref("");
const activeCategory = ref("all");

const handleSearch = (value) => {
  currentPage.value = 1;
  filterServices();
};

const allCategories = [
  { key: "all", name: "全部" },
  { key: "ai", name: "人工智能" },
  { key: "big-data", name: "大数据" },
  { key: "algorithm", name: "算法与数据" },
  { key: "data-science", name: "数据科学" },
  { key: "iot", name: "物联网" },
  { key: "project-management", name: "项目管理" },
  { key: "blockchain", name: "区块链" },
  { key: "cloud", name: "云计算" },
  { key: "security", name: "安全测试" },
  { key: "devops", name: "DevOps" },
  { key: "frontend", name: "前端开发" },
  { key: "backend", name: "后端开发" },
  { key: "mobile", name: "移动开发" },
];

const MAX_VISIBLE = 8;
const hasOverflow = computed(() => allCategories.length > MAX_VISIBLE);
const visibleCategories = computed(() => allCategories.slice(0, MAX_VISIBLE));
const hiddenCategories = computed(() => allCategories.slice(MAX_VISIBLE));

const handleCategoryClick = (item) => {
  if (!item) return;
  activeCategory.value = item.key;
  currentPage.value = 1;
  filterServices();
};

// 完整的服务模拟数据 - 25条
const allServices = ref([
  {
    id: 1,
    title: "Java大厂面试冲刺班",
    desc: "覆盖Java基础、JVM、并发、分布式等核心考点，配套模拟面试和简历优化",
    price: 399,
    cover: "https://placehold.co/240x120/FFD700/000000?text=Java",
    tags: ["平台保障", "商家认证", "7天无理由"],
    category: "backend",
    provider: "李老师",
    orders: 1258,
    rating: 4.9,
  },
  {
    id: 2,
    title: "MySQL数据库性能优化实战",
    desc: "从底层原理到实战优化，涵盖索引、事务、锁机制、分库分表等高级话题",
    price: 499,
    cover: "https://placehold.co/240x120/FF6600/FFFFFF?text=MySQL",
    tags: ["平台保障", "官方认证", "售后答疑"],
    category: "backend",
    provider: "数据库老王",
    orders: 896,
    rating: 4.8,
  },
  {
    id: 3,
    title: "Redis缓存架构设计与实战",
    desc: "深入讲解Redis数据结构、持久化、集群方案，结合电商场景实战",
    price: 399,
    cover: "https://placehold.co/240x120/DC143C/FFFFFF?text=Redis",
    tags: ["平台保障", "源码解析", "项目实战"],
    category: "backend",
    provider: "缓存专家张工",
    orders: 756,
    rating: 4.9,
  },
  {
    id: 4,
    title: "RabbitMQ消息队列精通班",
    desc: "从安装部署到高可用架构，结合电商场景实现消息队列实战",
    price: 399,
    cover: "https://placehold.co/240x120/0099FF/FFFFFF?text=RabbitMQ",
    tags: ["平台保障", "项目实战", "源码解析"],
    category: "backend",
    provider: "架构师小李",
    orders: 623,
    rating: 4.7,
  },
  {
    id: 5,
    title: "Spring Cloud微服务架构实战",
    desc: "从零构建微服务架构，涵盖注册中心、网关、熔断、配置中心等",
    price: 699,
    cover: "https://placehold.co/240x120/52C41A/FFFFFF?text=SpringCloud",
    tags: ["平台保障", "企业级", "实战项目"],
    category: "backend",
    provider: "微服务架构师",
    orders: 1089,
    rating: 4.8,
  },
  {
    id: 6,
    title: "Python数据分析与可视化",
    desc: "使用Pandas、NumPy、Matplotlib进行数据分析，打造精美数据报表",
    price: 299,
    cover: "https://placehold.co/240x120/4169E1/FFFFFF?text=Python",
    tags: ["平台保障", "数据分析", "可视化"],
    category: "data-science",
    provider: "数据分析师小林",
    orders: 1456,
    rating: 4.9,
  },
  {
    id: 7,
    title: "机器学习算法工程师培养计划",
    desc: "从基础数学到sklearn、TensorFlow，成为合格的AI工程师",
    price: 1299,
    cover: "https://placehold.co/240x120/FF8C00/FFFFFF?text=ML",
    tags: ["平台保障", "AI认证", "实战项目"],
    category: "ai",
    provider: "AI研究院",
    orders: 678,
    rating: 4.9,
  },
  {
    id: 8,
    title: "Vue3企业级后台管理系统",
    desc: "使用Vue3+TypeScript+Element Plus打造生产级后台系统",
    price: 399,
    cover: "https://placehold.co/240x120/42B983/FFFFFF?text=Vue3",
    tags: ["平台保障", "TypeScript", "实战项目"],
    category: "frontend",
    provider: "前端架构师阿华",
    orders: 923,
    rating: 4.8,
  },
  {
    id: 9,
    title: "ReactHooks与状态管理精通",
    desc: "深入理解React Hooks原理，掌握Redux、Zustand等状态管理方案",
    price: 349,
    cover: "https://placehold.co/240x120/61DAFB/000000?text=React",
    tags: ["平台保障", "Hooks", "状态管理"],
    category: "frontend",
    provider: "React布道者",
    orders: 812,
    rating: 4.7,
  },
  {
    id: 10,
    title: "Docker+K8s容器化部署专家",
    desc: "从Docker基础到Kubernetes集群管理，企业级DevOps实践",
    price: 599,
    cover: "https://placehold.co/240x120/2496ED/FFFFFF?text=K8s",
    tags: ["平台保障", "认证课程", "企业内训"],
    category: "devops",
    provider: "DevOps工程师老赵",
    orders: 567,
    rating: 4.8,
  },
  {
    id: 11,
    title: "Flask Web开发企业实战",
    desc: "使用Flask快速构建RESTful API，结合SQLAlchemy和Redis",
    price: 299,
    cover: "https://placehold.co/240x120/000000/FFFFFF?text=Flask",
    tags: ["平台保障", "RESTful", "实战项目"],
    category: "backend",
    provider: "全栈工程师小王",
    orders: 445,
    rating: 4.6,
  },
  {
    id: 12,
    title: "Hadoop大数据生态圈精通",
    desc: "HDFS、MapReduce、Hive、Spark一站式大数据技术栈学习",
    price: 899,
    cover: "https://placehold.co/240x120/FF7F50/FFFFFF?text=Hadoop",
    tags: ["平台保障", "大数据", "认证课程"],
    category: "big-data",
    provider: "大数据架构师",
    orders: 534,
    rating: 4.8,
  },
  {
    id: 13,
    title: "区块链智能合约开发",
    desc: "Solidity开发、Ethereum部署、Web3.js集成，从入门到精通",
    price: 699,
    cover: "https://placehold.co/240x120/3C3C3D/FFFFFF?text=Blockchain",
    tags: ["平台保障", "Web3", "NFT开发"],
    category: "blockchain",
    provider: "区块链开发者社区",
    orders: 321,
    rating: 4.7,
  },
  {
    id: 14,
    title: "TensorFlow深度学习实战",
    desc: "CNN、RNN、Transformer全覆盖，配套真实项目训练",
    price: 999,
    cover: "https://placehold.co/240x120/FF6F00/FFFFFF?text=TensorFlow",
    tags: ["平台保障", "深度学习", "计算机视觉"],
    category: "ai",
    provider: "AI实验室",
    orders: 789,
    rating: 4.9,
  },
  {
    id: 15,
    title: "iOS开发SwiftUI从入门到精通",
    desc: "使用SwiftUI构建精美iOS应用，配套App Store上架指导",
    price: 499,
    cover: "https://placehold.co/240x120/FA7343/FFFFFF?text=SwiftUI",
    tags: ["平台保障", "Swift", "App开发"],
    category: "mobile",
    provider: "iOS开发团队",
    orders: 456,
    rating: 4.7,
  },
  {
    id: 16,
    title: "Android Jetpack组件实战",
    desc: "MVVM、LiveData、Room、Navigation打造现代化Android应用",
    price: 399,
    cover: "https://placehold.co/240x120/3DDC84/FFFFFF?text=Android",
    tags: ["平台保障", "Kotlin", "Jetpack"],
    category: "mobile",
    provider: "Android开发组",
    orders: 543,
    rating: 4.6,
  },
  {
    id: 17,
    title: "网络安全渗透测试实战",
    desc: "Web渗透、系统入侵、安全加固，打造网络安全防线",
    price: 799,
    cover: "https://placehold.co/240x120/2E8B57/FFFFFF?text=Security",
    tags: ["平台保障", "渗透测试", "CISP认证"],
    category: "security",
    provider: "网络安全实验室",
    orders: 234,
    rating: 4.9,
  },
  {
    id: 18,
    title: "物联网智能硬件开发",
    desc: "Arduino、ESP32、MQTT协议，物联网全栈技术学习",
    price: 449,
    cover: "https://placehold.co/240x120/1E90FF/FFFFFF?text=IoT",
    tags: ["平台保障", "硬件开发", "嵌入式"],
    category: "iot",
    provider: "创客空间",
    orders: 345,
    rating: 4.6,
  },
  {
    id: 19,
    title: "AWS云计算架构师认证",
    desc: "SAA认证备考指南，EC2、S3、Lambda等核心服务详解",
    price: 699,
    cover: "https://placehold.co/240x120/FF9900/FFFFFF?text=AWS",
    tags: ["平台保障", "AWS认证", "云计算"],
    category: "cloud",
    provider: "云架构师老陈",
    orders: 423,
    rating: 4.8,
  },
  {
    id: 20,
    title: "敏捷项目管理PMP备考班",
    desc: "Scrum、看板、敏捷教练培养，配套PMP认证考试辅导",
    price: 599,
    cover: "https://placehold.co/240x120/FF4444/FFFFFF?text=PMP",
    tags: ["平台保障", "PMP认证", "管理咨询"],
    category: "project-management",
    provider: "项目管理专家",
    orders: 567,
    rating: 4.7,
  },
  {
    id: 21,
    title: "Go语言高并发服务器开发",
    desc: "Goroutine、Channel、Context打造高性能微服务",
    price: 499,
    cover: "https://placehold.co/240x120/00ADD8/FFFFFF?text=Go",
    tags: ["平台保障", "高并发", "微服务"],
    category: "backend",
    provider: "Go语言社区",
    orders: 678,
    rating: 4.8,
  },
  {
    id: 22,
    title: "算法与数据结构刷题班",
    desc: "LeetCode高频题目分类讲解，面试算法全覆盖",
    price: 299,
    cover: "https://placehold.co/240x120/FF69B4/FFFFFF?text=Algorithm",
    tags: ["平台保障", "刷题技巧", "面试辅导"],
    category: "algorithm",
    provider: "ACM金牌选手",
    orders: 1567,
    rating: 4.9,
  },
  {
    id: 23,
    title: "GraphQL API设计与实现",
    desc: "从REST到GraphQL，掌握现代API设计理念与实践",
    price: 349,
    cover: "https://placehold.co/240x120/E10098/FFFFFF?text=GraphQL",
    tags: ["平台保障", "API设计", "Node.js"],
    category: "backend",
    provider: "API架构师",
    orders: 345,
    rating: 4.6,
  },
  {
    id: 24,
    title: "Kafka消息中间件深度解析",
    desc: "高性能消息队列原理、分区策略、消费者组管理全掌握",
    price: 499,
    cover: "https://placehold.co/240x120/231F20/FFFFFF?text=Kafka",
    tags: ["平台保障", "消息队列", "性能优化"],
    category: "backend",
    provider: "中间件专家",
    orders: 456,
    rating: 4.7,
  },
  {
    id: 25,
    title: "Next.js全栈开发实战",
    desc: "SSR、SSG、API Routes，打造现代React全栈应用",
    price: 499,
    cover: "https://placehold.co/240x120/000000/FFFFFF?text=NextJS",
    tags: ["平台保障", "全栈", "SSR"],
    category: "frontend",
    provider: "前端架构师",
    orders: 534,
    rating: 4.8,
  },
]);

// 筛选后的服务数据
const filteredServices = ref([...allServices.value]);

// 根据筛选条件过滤数据
const filterServices = () => {
  let result = [...allServices.value];
  
  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(s => s.category === activeCategory.value);
  }
  
  // 搜索筛选
  if (searchValue.value.trim()) {
    const keyword = searchValue.value.trim().toLowerCase();
    result = result.filter(s => 
      s.title.toLowerCase().includes(keyword) || 
      s.desc.toLowerCase().includes(keyword)
    );
  }
  
  filteredServices.value = result;
  totalServices.value = result.length;
  
  // 如果当前页超出范围，回到第一页
  const maxPage = Math.ceil(result.length / pageSize.value) || 1;
  if (currentPage.value > maxPage) {
    currentPage.value = 1;
  }
};

// 当前页显示的服务列表
const currentPage = ref(1);
const pageSize = ref(12);
const totalServices = ref(25);

// 分页后的服务列表
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredServices.value.slice(start, end);
});

// 兼容模板中的 serviceList
const serviceList = computed(() => paginatedServices.value);

const handlePageChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
};

// 监听分类和搜索变化
watch([activeCategory, searchValue], () => {
  filterServices();
});
</script>

<style scoped>
.service-market-page {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 页面标题 */
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2f3e;
  margin: 0 0 16px;
  line-height: 1.4;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  max-width: 600px;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  height: 40px;
  border-radius: 20px 0 0 20px;
  background: #f5f7fa;
  border-color: #e6e8ec;
  border-right: none;
}
.search-input:focus {
  border-color: #52c41a;
  box-shadow: none;
}
.search-icon {
  color: #bfbfbf;
  font-size: 14px;
}
.search-btn {
  height: 40px;
  width: 80px;
  border-radius: 0 20px 20px 0;
  background: #52c41a;
  border-color: #52c41a;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}
.search-btn:hover {
  background: #389e0d;
  border-color: #389e0d;
  color: #fff;
}

/* 分类导航 */
.category-nav {
  margin-bottom: 24px;
}
.category-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  background: #f5f7fa;
  color: #5e6d82;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.category-tag:hover {
  background: #e9ecef;
}
.category-tag.active {
  background: #52c41a;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(82, 196, 26, 0.2);
}

.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  background: #f5f7fa;
  color: #5e6d82;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.more-btn:hover {
  background: #e9ecef;
  color: #52c41a;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  .search-bar {
    max-width: 100%;
  }
  .category-tags {
    flex-wrap: wrap;
    overflow: visible;
  }
}

.service-list {
  flex: 1;
}
.service-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card-cover {
  height: 120px;
  background-size: cover;
  background-position: center;
}
.card-content {
  padding: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.card-tags {
  margin-bottom: 10px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.price {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}
.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #faad14;
  font-size: 12px;
}
.provider {
  color: #666;
  font-size: 11px;
}
.orders {
  color: #999;
  font-size: 11px;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 24px 0;
}
</style>
