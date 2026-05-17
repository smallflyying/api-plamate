<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUsageStore } from '@/stores/usage'
import StatCard from '@/components/StatCard.vue'
import TokenTrend from '@/components/TokenTrend.vue'
import ModelBreakdown from '@/components/ModelBreakdown.vue'
import dayjs from 'dayjs'

const store = useUsageStore()

onMounted(() => {
  store.fetchAll()
})

function handleDateChange(dates: [Date, Date] | null) {
  if (dates) {
    store.setDateRange([
      dayjs(dates[0]).format('YYYY-MM-DD'),
      dayjs(dates[1]).format('YYYY-MM-DD'),
    ])
    store.fetchAll()
  }
}

const dateRange = ref([
  dayjs(store.dateRange[0]).toDate(),
  dayjs(store.dateRange[1]).toDate(),
])
</script>

<template>
  <div class="dashboard">
    <div class="toolbar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
      />
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <StatCard title="总 Token" :value="store.summary.total_tokens" color="#409EFF" />
      </el-col>
      <el-col :span="6">
        <StatCard title="Prompt Token" :value="store.summary.prompt_tokens" color="#67C23A" />
      </el-col>
      <el-col :span="6">
        <StatCard title="Completion Token" :value="store.summary.completion_tokens" color="#E6A23C" />
      </el-col>
      <el-col :span="6">
        <StatCard title="API 请求数" :value="store.summary.request_count" color="#F56C6C" />
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="16">
        <TokenTrend :data="store.trend" />
      </el-col>
      <el-col :span="8">
        <ModelBreakdown :data="store.modelBreakdown" />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard { padding: 0; }
.toolbar { margin-bottom: 16px; }
.stat-row { margin-bottom: 16px; }
.chart-row { }
</style>
