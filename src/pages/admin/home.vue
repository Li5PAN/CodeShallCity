<template>
  <div class="page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card" v-for="card in statCards" :key="card.label">
        <div class="stat-icon">{{ card.icon }}</div>
        <div class="stat-info">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="card-title">近一周订单趋势</div>
        <div ref="lineChartRef" class="chart-box"></div>
      </div>
      <div class="chart-card">
        <div class="card-title">服务类别排行榜（订单量 + 交易额）</div>
        <div ref="mixChartRef" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const statCards = [
  { label: '总订单数', value: '12,480', icon: '📦' },
  { label: '成功订单', value: '10,320', icon: '✅' },
  { label: '失败订单', value: '860', icon: '❌' },
  { label: '待申诉', value: '42', icon: '⚖️' }
]

const lineChartRef = ref(null)
const mixChartRef = ref(null)
let lineChart = null
let mixChart = null

const categories = ['前端开发', '后端开发', 'UI设计', '数据分析', '运维部署']
const orderData = [320, 280, 210, 180, 150]
const amountData = [48000, 62000, 31500, 27000, 22500]

onMounted(() => {
  // 折线图 - 近一周订单趋势
  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#888' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#888' }
    },
    series: [{
      name: '订单量',
      type: 'line',
      smooth: true,
      data: [120, 152, 98, 210, 180, 95, 140],
      lineStyle: { color: '#4f46e5', width: 2 },
      itemStyle: { color: '#4f46e5' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(79,70,229,0.25)' },
          { offset: 1, color: 'rgba(79,70,229,0.02)' }
        ])
      }
    }]
  })

  // 混合图 - 折线（订单量）+ 柱状（交易额）
  mixChart = echarts.init(mixChartRef.value)
  mixChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['订单量', '交易额(元)'],
      top: 0,
      right: 0,
      textStyle: { color: '#888', fontSize: 12 }
    },
    grid: { top: 36, right: 60, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#888' }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单量',
        nameTextStyle: { color: '#888', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#888' }
      },
      {
        type: 'value',
        name: '交易额',
        nameTextStyle: { color: '#888', fontSize: 11 },
        axisLabel: { color: '#888', formatter: v => `¥${(v/1000).toFixed(0)}k` },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '交易额(元)',
        type: 'bar',
        yAxisIndex: 1,
        data: amountData,
        barMaxWidth: 36,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#a78bfa' },
          { offset: 1, color: '#c4b5fd' }
        ]), borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '订单量',
        type: 'line',
        yAxisIndex: 0,
        data: orderData,
        smooth: true,
        lineStyle: { color: '#4f46e5', width: 2 },
        itemStyle: { color: '#4f46e5' },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  })

  // 响应式
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  lineChart?.resize()
  mixChart?.resize()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  mixChart?.dispose()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex-shrink: 0;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.stat-icon { font-size: 32px; }
.stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 13px; color: #888; margin-top: 2px; }

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.chart-box {
  flex: 1;
  min-height: 0;
}
</style>
