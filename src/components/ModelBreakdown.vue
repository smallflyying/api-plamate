<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ModelBreakdown } from '@/types'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{ data: ModelBreakdown[] }>()

const option = computed(() => ({
  tooltip: { trigger: 'item' as const, formatter: '{b}: {c} tokens ({d}%)' },
  legend: { orient: 'vertical' as const, right: 10, top: 'center' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['35%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
    data: props.data.map((d) => ({ name: d.model, value: d.total_tokens })),
  }],
}))
</script>

<template>
  <el-card shadow="hover">
    <template #header>模型用量分布</template>
    <div v-if="data.length === 0" class="empty">暂无数据</div>
    <v-chart v-else :option="option" autoresize style="height: 320px" />
  </el-card>
</template>

<style scoped>
.empty { text-align: center; color: #909399; padding: 60px 0; }
</style>
