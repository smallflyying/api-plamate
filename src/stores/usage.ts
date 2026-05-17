import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UsageSummary, TrendItem, ModelBreakdown, UsageRecord } from '@/types'
import api from '@/api'
import dayjs from 'dayjs'

export const useUsageStore = defineStore('usage', () => {
  const summary = ref<UsageSummary>({ total_tokens: 0, prompt_tokens: 0, completion_tokens: 0, request_count: 0 })
  const trend = ref<TrendItem[]>([])
  const modelBreakdown = ref<ModelBreakdown[]>([])
  const records = ref<UsageRecord[]>([])
  const totalRecords = ref(0)
  const loading = ref(false)

  const dateRange = ref<[string, string]>([
    dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ])

  async function fetchSummary() {
    const [start, end] = dateRange.value
    const { data } = await api.get('/api/usage/summary', { params: { start, end } })
    summary.value = data
  }

  async function fetchTrend() {
    const [start, end] = dateRange.value
    const { data } = await api.get('/api/usage/trend', { params: { start, end } })
    trend.value = data
  }

  async function fetchModelBreakdown() {
    const [start, end] = dateRange.value
    const { data } = await api.get('/api/usage/by-model', { params: { start, end } })
    modelBreakdown.value = data
  }

  async function fetchRecords(page = 1, pageSize = 10, model = '') {
    loading.value = true
    try {
      const [start, end] = dateRange.value
      const { data } = await api.get('/api/usage/records', {
        params: { start, end, page, pageSize, model },
      })
      records.value = data.list
      totalRecords.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    await Promise.all([fetchSummary(), fetchTrend(), fetchModelBreakdown()])
  }

  function setDateRange(range: [string, string]) {
    dateRange.value = range
  }

  return {
    summary, trend, modelBreakdown, records, totalRecords, loading, dateRange,
    fetchSummary, fetchTrend, fetchModelBreakdown, fetchRecords, fetchAll,
    setDateRange,
  }
})
