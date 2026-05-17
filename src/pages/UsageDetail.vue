<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useUsageStore } from '@/stores/usage'
import { useSettingsStore } from '@/stores/settings'
import UsageTable from '@/components/UsageTable.vue'

use([BarChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer])

const store = useUsageStore()
const settingsStore = useSettingsStore()
const page = ref(1)
const pageSize = 10
const filterModel = ref('')

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' as const },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category' as const, data: store.trend.map((d) => d.date.slice(5)) },
  yAxis: { type: 'value' as const },
  series: [{
    name: '总Token', type: 'bar' as const,
    data: store.trend.map((d) => d.total_tokens),
    itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] },
  }],
}))

onMounted(() => {
  settingsStore.fetchSettings()
  store.fetchAll()
  store.fetchRecords(page.value, pageSize)
})

function onPageChange(p: number) {
  page.value = p
  store.fetchRecords(p, pageSize, filterModel.value)
}

watch(filterModel, () => {
  page.value = 1
  store.fetchRecords(1, pageSize, filterModel.value)
})
</script>

<template>
  <div class="usage-detail">
    <div class="toolbar">
      <el-select
        v-model="filterModel"
        placeholder="按模型筛选"
        clearable
        style="width: 280px"
      >
        <el-option
          v-for="m in settingsStore.allModels"
          :key="m"
          :label="m"
          :value="m"
        />
      </el-select>
    </div>

    <div class="bar-chart">
      <el-card shadow="hover">
        <template #header>每日 Token 用量</template>
        <div v-if="store.trend.length === 0" style="text-align:center;color:#909399;padding:60px 0">暂无数据</div>
        <v-chart v-else :option="barOption" autoresize style="height: 280px" />
      </el-card>
    </div>

    <UsageTable
      :records="store.records"
      :loading="store.loading"
      :total="store.totalRecords"
      :page="page"
      :pageSize="pageSize"
      @page-change="onPageChange"
    />
  </div>
</template>

<style scoped>
.usage-detail { }
.toolbar { margin-bottom: 16px; }
.bar-chart { margin-bottom: 16px; }
</style>
