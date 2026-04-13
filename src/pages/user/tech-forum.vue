<template>
  <div class="tech-forum-content">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-input
        v-model:value="searchValue"
        placeholder="搜索文章"
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

    <!-- 主体内容：文章列表 + 右侧推荐 -->
    <div class="main-content">
      <!-- 左侧文章列表 -->
      <div class="article-list">
        <div v-if="paginatedArticleList.length === 0" class="empty-state">
          <SearchOutlined style="font-size: 48px; color: #e0e0e0" />
          <p>暂无相关文章</p>
        </div>
        <div
          class="article-item"
          v-for="item in paginatedArticleList"
          :key="item.id"
          style="cursor: pointer"
          @click="openDetail('forum', { id: item.id })"
        >
          <div class="article-header">
            <a-avatar
              :size="28"
              :style="{ backgroundColor: item.authorColor }"
              >{{ item.author[0] }}</a-avatar
            >
            <span class="author-name">{{ item.author }}</span>
            <span class="article-time">{{ item.publishTime }}</span>
          </div>
          <div class="article-body">
            <div class="article-text">
              <h4 class="article-title">{{ item.title }}</h4>
              <p class="article-desc">{{ item.desc }}</p>
            </div>
            <img
              v-if="item.cover"
              :src="item.cover"
              class="article-cover"
              alt=""
            />
          </div>
        </div>
      </div>

      <!-- 右侧推荐论坛 -->
      <div class="right-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">推荐论坛</div>
          <div class="community-list">
            <div class="community-item" v-for="c in communityList" :key="c.key">
              <span class="community-name">{{ c.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="filteredArticleList.length"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => `共 ${total} 条`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from "vue";
import { SearchOutlined, DownOutlined } from "@ant-design/icons-vue";
import { getHomeForumCategories } from "@/service/user/uindex";

const openDetail = inject("openDetail");

const searchValue = ref("");

const handleSearch = (value) => {
  console.log("搜索文章:", value);
  currentPage.value = 1;
};

const allCategories = ref([
  { key: "all", name: "全部", description: "", postCount: 0 },
]);
const MAX_VISIBLE = 8;
const hasOverflow = computed(() => allCategories.value.length > MAX_VISIBLE);
const visibleCategories = computed(() => allCategories.value.slice(0, MAX_VISIBLE));
const hiddenCategories = computed(() => allCategories.value.slice(MAX_VISIBLE));

// 获取论坛分类列表
const fetchForumCategories = async () => {
  try {
    const res = await getHomeForumCategories();
    if (res.code === 0 && res.data) {
      // 保持"全部"分类在首位
      const otherCategories = res.data.map((item) => ({
        key: String(item.id),
        name: item.categoryName,
        description: item.description || "",
        postCount: item.postCount || 0,
      }));
      allCategories.value = [
        { key: "all", name: "全部", description: "", postCount: 0 },
        ...otherCategories,
      ];
    }
  } catch (error) {
    console.error("获取论坛分类失败:", error);
  }
};

onMounted(() => {
  fetchForumCategories();
});

const activeCategory = ref("all");

const handleCategoryClick = (item) => {
  if (!item) return;
  activeCategory.value = item.key;
  currentPage.value = 1;
};

const currentPage = ref(1);
const pageSize = ref(10);
const totalArticles = ref(35);

// 筛选后的数据
const filteredArticleList = computed(() => {
  let list = articleList.value;
  if (activeCategory.value !== "all") {
    // 根据 activeCategory 找到对应的分类名称
    const category = allCategories.value.find((c) => c.key === activeCategory.value);
    const categoryName = category?.name;
    if (categoryName) {
      list = list.filter((item) => item.category === categoryName);
    }
  }
  if (searchValue.value.trim()) {
    const keyword = searchValue.value.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.desc.toLowerCase().includes(keyword)
    );
  }
  return list;
});

// 分页后的数据
const paginatedArticleList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredArticleList.value.slice(start, end);
});

// 监听筛选条件变化，重置分页
watch(activeCategory, () => {
  currentPage.value = 1;
});
watch(searchValue, () => {
  currentPage.value = 1;
});

const articleList = ref([
  {
    id: 1,
    author: "bkspiderx",
    authorColor: "#1890ff",
    title: "深入解析CPU调度：操作系统的核心资源分配机制",
    desc: "本文系统解析了CPU调度机制，分析其必要性、核心目标和经典算法，包括FCFS、SJF、优先级调度和时间片轮转...",
    category: "操作系统",
    tagColor: "blue",
    publishTime: "2026-02-20",
    readCount: "1.5k",
    likeCount: 34,
    collectCount: 11,
    cover: "https://placehold.co/100x80/1890ff/FFFFFF?text=OS",
  },
  {
    id: 2,
    author: "Agent学习路线",
    authorColor: "#52c41a",
    title: "AI大模型大师秘籍：2025AI技术全景揭秘，从入门到精通的完整学习指南",
    desc: "本文系统介绍了AI大模型的学习路径，分为四个阶段：基础阶段重点学数学、统计和机器学习基础...",
    category: "人工智能",
    tagColor: "green",
    publishTime: "2026-02-25",
    readCount: "2.1k",
    likeCount: 47,
    collectCount: 14,
    cover: "https://placehold.co/100x80/52c41a/FFFFFF?text=AI",
  },
  {
    id: 3,
    author: "NASA技术",
    authorColor: "#faad14",
    title: "NASA公布推进阿尔忒弥斯IV任务，计划在月球轨道建设首个空间站",
    desc: 'NASA公布推进阿尔忒弥斯IV任务，计划在月球轨道建设首个空间站"门户"。该任务将采用升级版SLS火箭...',
    category: "科技资讯",
    tagColor: "orange",
    publishTime: "2026-02-26",
    readCount: "1.3k",
    likeCount: 33,
    collectCount: 9,
    cover: "https://placehold.co/100x80/faad14/FFFFFF?text=NASA",
  },
  {
    id: 4,
    author: "Java架构师",
    authorColor: "#ff4d4f",
    title: "Spring Boot 3.x 新特性全解析：从虚拟线程到原生镜像",
    desc: "Spring Boot 3.x 带来了众多重磅更新，包括对Java 21虚拟线程的支持、GraalVM原生镜像编译优化...",
    category: "Java",
    tagColor: "red",
    publishTime: "2026-02-24",
    readCount: "3.2k",
    likeCount: 156,
    collectCount: 42,
    cover: "https://placehold.co/100x80/ff4d4f/FFFFFF?text=Java",
  },
  {
    id: 5,
    author: "Python达人",
    authorColor: "#722ed1",
    title: "Python异步编程完全指南：AIOHTTP异步HTTP客户端实战",
    desc: "异步编程是现代Python开发的重要技能，本文详细介绍如何使用AIOHTTP进行高性能HTTP请求处理...",
    category: "Python",
    tagColor: "purple",
    publishTime: "2026-02-23",
    readCount: "2.8k",
    likeCount: 89,
    collectCount: 28,
    cover: "https://placehold.co/100x80/722ed1/FFFFFF?text=Python",
  },
  {
    id: 6,
    author: "数据库老王",
    authorColor: "#13c2c2",
    title: "MySQL 8.0 新特性深度解析：CTE、窗口函数与JSON支持",
    desc: "MySQL 8.0引入了众多强大的新特性，本文深度解析公用表表达式(CTE)、窗口函数和增强的JSON支持...",
    category: "数据库",
    tagColor: "cyan",
    publishTime: "2026-02-22",
    readCount: "1.9k",
    likeCount: 67,
    collectCount: 19,
    cover: "https://placehold.co/100x80/13c2c2/FFFFFF?text=MySQL",
  },
  {
    id: 7,
    author: "前端观察",
    authorColor: "#eb2f96",
    title: "Vue3 Composition API 最佳实践：从入门到精通",
    desc: "Vue3的Composition API彻底改变了我们组织组件逻辑的方式，本文分享在实际项目中使用Vue3的最佳实践...",
    category: "Vue",
    tagColor: "magenta",
    publishTime: "2026-02-21",
    readCount: "4.5k",
    likeCount: 234,
    collectCount: 67,
    cover: "https://placehold.co/100x80/eb2f96/FFFFFF?text=Vue3",
  },
  {
    id: 8,
    author: "Go语言爱好者",
    authorColor: "#1890ff",
    title: "Go语言并发编程精讲：Goroutine与Channel深入理解",
    desc: "Go语言的并发模型是其最强大的特性之一，本文深入讲解Goroutine调度原理、Channel使用技巧和并发安全...",
    category: "Go语言",
    tagColor: "blue",
    publishTime: "2026-02-19",
    readCount: "2.3k",
    likeCount: 98,
    collectCount: 31,
    cover: "https://placehold.co/100x80/1890ff/FFFFFF?text=Go",
  },
  {
    id: 9,
    author: "MCP开发者",
    authorColor: "#52c41a",
    title: "MCP协议详解：让AI模型更智能地与外部工具交互",
    desc: "Model Context Protocol (MCP) 是Anthropic推出的开放协议，本文详细解析MCP的工作原理和应用场景...",
    category: "MCP",
    tagColor: "green",
    publishTime: "2026-02-18",
    readCount: "3.1k",
    likeCount: 145,
    collectCount: 52,
    cover: "https://placehold.co/100x80/52c41a/FFFFFF?text=MCP",
  },
  {
    id: 10,
    author: "DeepSeek官方",
    authorColor: "#fa8c16",
    title: "DeepSeek-R1技术报告：推理能力与训练方法揭秘",
    desc: "DeepSeek团队发布R1模型技术报告，详细介绍了长思维链推理能力的训练方法和模型架构创新...",
    category: "DeepSeek",
    tagColor: "orange",
    publishTime: "2026-02-17",
    readCount: "8.7k",
    likeCount: 567,
    collectCount: 189,
    cover: "https://placehold.co/100x80/fa8c16/FFFFFF?text=DeepSeek",
  },
  {
    id: 11,
    author: "Rust布道者",
    authorColor: "#f5222d",
    title: "Rust所有权系统深度解析：告别内存安全问题",
    desc: "Rust的所有权系统是其核心创新，本文深入解析借用检查器、生命周期标注和内存安全保证...",
    category: "Rust",
    tagColor: "red",
    publishTime: "2026-02-16",
    readCount: "1.7k",
    likeCount: 76,
    collectCount: 24,
    cover: "https://placehold.co/100x80/f5222d/FFFFFF?text=Rust",
  },
  {
    id: 12,
    author: "容器化专家",
    authorColor: "#1890ff",
    title: "Kubernetes生产级集群搭建完全指南：从0到1",
    desc: "本文详细介绍如何在生产环境搭建高可用的Kubernetes集群，包括集群规划、组件选型和常见问题处理...",
    category: "Kubernetes",
    tagColor: "blue",
    publishTime: "2026-02-15",
    readCount: "2.6k",
    likeCount: 112,
    collectCount: 38,
    cover: "https://placehold.co/100x80/1890ff/FFFFFF?text=K8s",
  },
  {
    id: 13,
    author: "React开发者",
    authorColor: "#61dafb",
    title: "React Server Components完全指南：下一代React开发范式",
    desc: "React Server Components开启了React开发的新纪元，本文深入解析服务端组件的工作原理和使用场景...",
    category: "React",
    tagColor: "blue",
    publishTime: "2026-02-14",
    readCount: "3.8k",
    likeCount: 198,
    collectCount: 63,
    cover: "https://placehold.co/100x80/61dafb/FFFFFF?text=React",
  },
  {
    id: 14,
    author: "区块链技术宅",
    authorColor: "#722ed1",
    title: "以太坊智能合约开发入门：从Solidity到部署",
    desc: "本文手把手教你开发以太坊智能合约，从Solidity基础语法到合约部署和测试，带你进入Web3世界...",
    category: "区块链",
    tagColor: "purple",
    publishTime: "2026-02-13",
    readCount: "2.2k",
    likeCount: 87,
    collectCount: 29,
    cover: "https://placehold.co/100x80/722ed1/FFFFFF?text=ETH",
  },
  {
    id: 15,
    author: "DevOps工程师",
    authorColor: "#fa8c16",
    title: "GitLab CI/CD 流水线实战：自动化部署全流程",
    desc: "详细介绍如何使用GitLab CI/CD实现代码提交到生产环境部署的全流程自动化...",
    category: "DevOps",
    tagColor: "orange",
    publishTime: "2026-02-12",
    readCount: "1.8k",
    likeCount: 65,
    collectCount: 21,
    cover: "https://placehold.co/100x80/fa8c16/FFFFFF?text=CI",
  },
  {
    id: 16,
    author: "TypeScript布道师",
    authorColor: "#3178c6",
    title: "TypeScript高级类型技巧：类型编程的艺术",
    desc: "深入讲解TypeScript高级类型系统，包括条件类型、映射类型、模板字面量类型等复杂概念...",
    category: "TypeScript",
    tagColor: "blue",
    publishTime: "2026-02-11",
    readCount: "2.9k",
    likeCount: 134,
    collectCount: 45,
    cover: "https://placehold.co/100x80/3178c6/FFFFFF?text=TS",
  },
  {
    id: 17,
    author: "大数据架构师",
    authorColor: "#13c2c2",
    title: "Apache Spark 3.0 性能优化实战：数据处理效率翻倍",
    desc: "Spark 3.0引入了自适应查询执行和动态分区裁剪等优化，本文分享生产环境中的性能调优经验...",
    category: "大数据",
    tagColor: "cyan",
    publishTime: "2026-02-10",
    readCount: "2.1k",
    likeCount: 78,
    collectCount: 26,
    cover: "https://placehold.co/100x80/13c2c2/FFFFFF?text=Spark",
  },
  {
    id: 18,
    author: "算法工程师",
    authorColor: "#52c41a",
    title: "Transformer架构深度解析：从注意力机制到BERT",
    desc: "Transformer彻底改变了NLP领域，本文深入解析注意力机制、位置编码和BERT模型的实现原理...",
    category: "深度学习",
    tagColor: "green",
    publishTime: "2026-02-09",
    readCount: "5.3k",
    likeCount: 289,
    collectCount: 94,
    cover: "https://placehold.co/100x80/52c41a/FFFFFF?text=AI",
  },
  {
    id: 19,
    author: "网络安全专家",
    authorColor: "#ff4d4f",
    title: "Web应用安全防护：OWASP Top 10漏洞与防御策略",
    desc: "详细解析OWASP Top 10安全风险，包括SQL注入、XSS、CSRF等漏洞原理和防护措施...",
    category: "安全",
    tagColor: "red",
    publishTime: "2026-02-08",
    readCount: "3.4k",
    likeCount: 167,
    collectCount: 58,
    cover: "https://placehold.co/100x80/ff4d4f/FFFFFF?text=Security",
  },
  {
    id: 20,
    author: "移动端开发者",
    authorColor: "#1890ff",
    title: "Flutter跨平台开发实战：从入门到项目落地",
    desc: "使用Flutter实现iOS和Android双平台开发，本文分享实际项目中遇到的坑和最佳实践...",
    category: "移动开发",
    tagColor: "blue",
    publishTime: "2026-02-07",
    readCount: "2.7k",
    likeCount: 109,
    collectCount: 36,
    cover: "https://placehold.co/100x80/1890ff/FFFFFF?text=Flutter",
  },
  {
    id: 21,
    author: "微服务架构师",
    authorColor: "#722ed1",
    title: "微服务架构设计模式：Saga、CQRS与事件溯源",
    desc: "深入讲解分布式事务解决方案Saga模式、CQRS读写分离架构和事件溯源Event Sourcing...",
    category: "架构设计",
    tagColor: "purple",
    publishTime: "2026-02-06",
    readCount: "3.6k",
    likeCount: 178,
    collectCount: 61,
    cover: "https://placehold.co/100x80/722ed1/FFFFFF?text=Micro",
  },
  {
    id: 22,
    author: "Linux内核爱好者",
    authorColor: "#000000",
    title: "Linux内核模块开发指南：编写你的第一个内核模块",
    desc: "深入Linux内核世界，手把手教你编写字符设备驱动和内核模块，了解内核编程的基本概念...",
    category: "Linux",
    tagColor: "default",
    publishTime: "2026-02-05",
    readCount: "1.4k",
    likeCount: 52,
    collectCount: 17,
    cover: "https://placehold.co/100x80/000000/FFFFFF?text=Linux",
  },
  {
    id: 23,
    author: "前端工程化",
    authorColor: "#eb2f96",
    title: "Webpack 5模块联邦：实现微前端的终极方案",
    desc: "Webpack 5的Module Federation让微前端实现变得简单，本文详细解析联邦模块的工作原理...",
    category: "前端工程化",
    tagColor: "magenta",
    publishTime: "2026-02-04",
    readCount: "2.4k",
    likeCount: 96,
    collectCount: 32,
    cover: "https://placehold.co/100x80/eb2f96/FFFFFF?text=Webpack",
  },
  {
    id: 24,
    author: "数据库内核研究",
    authorColor: "#faad14",
    title: "PostgreSQL高级特性：分区表、索引类型与查询优化",
    desc: "深入解析PostgreSQL的高级特性，包括范围分区、列表分区、GIN索引和BRIN索引的使用场景...",
    category: "数据库",
    tagColor: "orange",
    publishTime: "2026-02-03",
    readCount: "1.6k",
    likeCount: 59,
    collectCount: 20,
    cover: "https://placehold.co/100x80/faad14/FFFFFF?text=PG",
  },
  {
    id: 25,
    author: "云原生实践者",
    authorColor: "#1890ff",
    title: "Istio服务网格实战：流量管理与安全策略",
    desc: "详细介绍Istio的流量管理能力，包括金丝雀发布、熔断、重试机制和安全策略配置...",
    category: "云原生",
    tagColor: "blue",
    publishTime: "2026-02-02",
    readCount: "2.0k",
    likeCount: 74,
    collectCount: 25,
    cover: "https://placehold.co/100x80/1890ff/FFFFFF?text=Istio",
  },
  {
    id: 26,
    author: "JavaScript布道师",
    authorColor: "#f7df1e",
    title: "Node.js性能优化指南：从事件循环到内存管理",
    desc: "深入Node.js底层，理解事件循环机制、内存管理和CPU性能分析，提升应用响应速度...",
    category: "Node.js",
    tagColor: "gold",
    publishTime: "2026-02-01",
    readCount: "2.5k",
    likeCount: 103,
    collectCount: 34,
    cover: "https://placehold.co/100x80/f7df1e/000000?text=Node",
  },
  {
    id: 27,
    author: "机器学习工程师",
    authorColor: "#52c41a",
    title: "PyTorch Lightning实战：简化深度学习训练流程",
    desc: "PyTorch Lightning简化了深度学习代码组织，本文通过实际项目演示如何使用LightningModules...",
    category: "机器学习",
    tagColor: "green",
    publishTime: "2026-01-31",
    readCount: "1.9k",
    likeCount: 71,
    collectCount: 23,
    cover: "https://placehold.co/100x80/52c41a/FFFFFF?text=PyTorch",
  },
  {
    id: 28,
    author: "GraphQL开发者",
    authorColor: "#e10098",
    title: "GraphQL与REST对比：API设计的最佳实践",
    desc: "深入对比GraphQL和REST的优缺点，讲解何时选择GraphQL以及如何设计高效的GraphQL Schema...",
    category: "API设计",
    tagColor: "pink",
    publishTime: "2026-01-30",
    readCount: "1.8k",
    likeCount: 68,
    collectCount: 22,
    cover: "https://placehold.co/100x80/e10098/FFFFFF?text=GraphQL",
  },
  {
    id: 29,
    author: "监控系统专家",
    authorColor: "#ff4d4f",
    title: "Prometheus + Grafana监控体系搭建完全指南",
    desc: "手把手教你搭建企业级监控体系，包括指标采集、可视化仪表盘和告警规则配置...",
    category: "监控运维",
    tagColor: "red",
    publishTime: "2026-01-29",
    readCount: "2.8k",
    likeCount: 115,
    collectCount: 39,
    cover: "https://placehold.co/100x80/ff4d4f/FFFFFF?text=Monitor",
  },
  {
    id: 30,
    author: "AI应用开发者",
    authorColor: "#722ed1",
    title: "LangChain与LLM应用开发：大模型落地方案",
    desc: "LangChain让基于大模型的应用开发变得简单，本文讲解 Chains、Agents 和 Memory 的使用...",
    category: "AI应用",
    tagColor: "purple",
    publishTime: "2026-01-28",
    readCount: "4.2k",
    likeCount: 213,
    collectCount: 72,
    cover: "https://placehold.co/100x80/722ed1/FFFFFF?text=LangChain",
  },
  {
    id: 31,
    author: "Swift开发者",
    authorColor: "#fa8c16",
    title: "Swift并发编程：async/await与Actor模型",
    desc: "Swift 5.5引入的并发特性彻底改变了iOS开发，本文深入讲解async/await和Actor模型的使用...",
    category: "Swift",
    tagColor: "orange",
    publishTime: "2026-01-27",
    readCount: "1.5k",
    likeCount: 56,
    collectCount: 18,
    cover: "https://placehold.co/100x80/fa8c16/FFFFFF?text=Swift",
  },
  {
    id: 32,
    author: "测试工程师",
    authorColor: "#13c2c2",
    title: "Playwright端到端测试实战：现代化Web测试方案",
    desc: "Playwright是新一代Web自动化测试工具，本文讲解如何编写可靠的E2E测试和CI集成...",
    category: "测试",
    tagColor: "cyan",
    publishTime: "2026-01-26",
    readCount: "1.7k",
    likeCount: 63,
    collectCount: 21,
    cover: "https://placehold.co/100x80/13c2c2/FFFFFF?text=Playwright",
  },
  {
    id: 33,
    author: "消息队列专家",
    authorColor: "#52c41a",
    title: "Kafka实时数据流处理：Flink与Kafka集成实战",
    desc: "讲解如何使用Apache Flink处理Kafka数据流，实现实时数据分析和流处理应用...",
    category: "流处理",
    tagColor: "green",
    publishTime: "2026-01-25",
    readCount: "2.3k",
    likeCount: 92,
    collectCount: 31,
    cover: "https://placehold.co/100x80/52c41a/FFFFFF?text=Flink",
  },
  {
    id: 34,
    author: "低代码开发者",
    authorColor: "#1890ff",
    title: "低代码平台架构设计：可扩展性与灵活性平衡",
    desc: "深入分析低代码平台的技术架构，如何在提供易用性的同时保持系统可扩展性...",
    category: "低代码",
    tagColor: "blue",
    publishTime: "2026-01-24",
    readCount: "1.4k",
    likeCount: 48,
    collectCount: 15,
    cover: "https://placehold.co/100x80/1890ff/FFFFFF?text=LowCode",
  },
  {
    id: 35,
    author: "AI安全研究员",
    authorColor: "#ff4d4f",
    title: "大模型安全与伦理：Prompt注入与AI治理",
    desc: "探讨大模型应用的安全风险，包括Prompt注入、幻觉问题和AI伦理治理的最佳实践...",
    category: "AI安全",
    tagColor: "red",
    publishTime: "2026-01-23",
    readCount: "3.1k",
    likeCount: 142,
    collectCount: 48,
    cover: "https://placehold.co/100x80/ff4d4f/FFFFFF?text=AISafety",
  },
]);

const communityList = ref([
  { key: 1, name: "高通开发者中文社区" },
  { key: 2, name: "HarmonyOS开发者社区" },
  { key: 3, name: "讯飞AI开发者社区" },
  { key: 4, name: "英特尔开发人员专区" },
  { key: 5, name: "NVIDIA技术专区" },
  { key: 6, name: "葡萄城开发者空间" },
  { key: 7, name: "DAMO开发者矩阵" },
  { key: 8, name: "魔乐社区" },
  { key: 9, name: "LAVAL社区" },
]);
</script>

<style scoped>
.tech-forum-content {
  width: 100%;
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
  gap: 4px;
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

/* 主体布局 */
.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.article-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 文章条目 */
.article-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}
.article-item:last-of-type {
  border-bottom: none;
}
.article-item:hover {
  background: #fafafa;
}

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
.article-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.author-name {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
.article-time {
  font-size: 12px;
  color: #ccc;
  margin-left: auto;
}
.article-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.article-text {
  flex: 1;
  min-width: 0;
}
.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article-item:hover .article-title {
  color: #1890ff;
}
.article-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 10px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #bbb;
}
.article-cover {
  width: 100px;
  height: 75px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 20px 16px;
}

/* 右侧栏 */
.right-sidebar {
  width: 280px;
  flex-shrink: 0;
}
.sidebar-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.community-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.community-item {
  padding: 8px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.community-item:hover {
  background: #f5f5f5;
}
.community-name {
  font-size: 13px;
  color: #555;
}
</style>
