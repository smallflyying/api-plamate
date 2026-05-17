import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import type { ProviderConfig } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const providers = ref<ProviderConfig[]>([])
  const allModels = ref<string[]>([])
  const dbStats = ref({ recordCount: 0, providerCount: 0, dateRange: '' })
  const saving = ref(false)

  async function fetchSettings() {
    const { data } = await api.get('/api/settings')
    providers.value = data.providers || []
    allModels.value = data.models || []
    dbStats.value = data.dbStats || { recordCount: 0, providerCount: 0, dateRange: '' }
  }

  async function addProvider(p: Omit<ProviderConfig, 'id'>) {
    saving.value = true
    try {
      await api.post('/api/settings/provider', p)
      await fetchSettings()
    } finally {
      saving.value = false
    }
  }

  async function updateProvider(id: number, p: Partial<Omit<ProviderConfig, 'id'>>) {
    saving.value = true
    try {
      await api.put(`/api/settings/provider/${id}`, p)
      await fetchSettings()
    } finally {
      saving.value = false
    }
  }

  async function deleteProvider(id: number) {
    await api.delete(`/api/settings/provider/${id}`)
    await fetchSettings()
  }

  return {
    providers, allModels, dbStats, saving,
    fetchSettings, addProvider, updateProvider, deleteProvider,
  }
})
