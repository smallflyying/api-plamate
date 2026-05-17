<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { TrendItem } from '@/types'

use([LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const props = defineProps<{ data: TrendItem[] }>()

const option = computed(() => ({
  tooltip: { trigger: 'axis' as const },
  legend: { data: ['总Token', 'Prompt', 'Completion'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category' as const, data: props.data.map((d) => d.date.slice(5)) },
  yAxis: { type: 'value' as const },
  series: [
    {
      name: '总Token', type: 'line', data: props.data.map((d) => d.total_tokens),
      smooth: true, symbol: 'circle', symbolSize: 4,
    },
    {
      name: 'Prompt', type: 'line', data: props.data.map((d) => d.prompt_tokens),
      smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { type: 'dashed' },
    },
    {
      name: 'Completion', type: 'line', data: props.data.map((d) => d.completion_tokens),
      smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { type: 'dashed' },
    },
  ],
}))
</script>

<template>
  <el-card shadow="hover">
    <template #header>Token 消耗趋势</template>
    <div v-if="data.length === 0" class="empty">暂无数据</div>
    <v-chart v-else :option="option" autoresize style="height: 320px" />
  </el-card>
</template>

<style scoped>
.empty { text-align: center; color: #909399; padding: 60px 0; }
</style>
