<script setup lang="ts">
import type { UsageRecord } from '@/types'

defineProps<{
  records: UsageRecord[]
  loading: boolean
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()
</script>

<template>
  <el-card shadow="hover">
    <template #header>用量明细</template>
    <el-table :data="records" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="model" label="模型" min-width="160" />
      <el-table-column prop="prompt_tokens" label="Prompt Token" min-width="140">
        <template #default="{ row }">{{ row.prompt_tokens.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="completion_tokens" label="Completion Token" min-width="160">
        <template #default="{ row }">{{ row.completion_tokens.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="total_tokens" label="总 Token" min-width="120">
        <template #default="{ row }">{{ row.total_tokens.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="request_count" label="请求数" width="100" />
    </el-table>
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="(p: number) => emit('pageChange', p)"
      />
    </div>
  </el-card>
</template>

<style scoped>
.pagination { margin-top: 16px; display: flex; justify-content: center; }
</style>
