import { getProviders, addRecords, getDbStats, type ProviderConfig } from './db.js'

async function fetchProviderUsage(provider: ProviderConfig, days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const baseUrl = provider.baseUrl.replace(/\/+$/, '')

  // 尝试 OpenAI 兼容的 /v1/usage 端点
  const params = new URLSearchParams({
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  })

  const endpoint = `${baseUrl}/v1/usage?${params}`
  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${provider.apiKey}` },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${provider.name} API 请求失败 (${res.status}): ${text.slice(0, 200)}`)
  }

  return res.json()
}

function normalizeRecords(raw: any, providerName: string): Array<{
  date: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  request_count: number
}> {
  // OpenAI 格式: { data: [{ snapshot_id, object, ... }] }
  const items = raw.data || raw.usage || (Array.isArray(raw) ? raw : [raw])
  if (!Array.isArray(items)) return []

  return items.map((item: any) => ({
    date: (item.timestamp || item.date || '').toString().slice(0, 10),
    model: item.model || item.snmp_id || `${providerName}-default`,
    prompt_tokens: Number(item.prompt_tokens || item.input_tokens || item.context_tokens || 0),
    completion_tokens: Number(item.completion_tokens || item.output_tokens || item.generated_tokens || 0),
    total_tokens: Number(item.total_tokens || item.n_generated_tokens || 0),
    request_count: Number(item.request_count || item.n_requests || item.api_requests || 1),
  }))
}

export async function syncFromProviders(days = 30) {
  const providers = getProviders()
  if (providers.length === 0) {
    throw new Error('请先配置至少一个模型提供商')
  }

  let totalSynced = 0
  const errors: string[] = []

  for (const provider of providers) {
    try {
      const raw = await fetchProviderUsage(provider, days)
      const records = normalizeRecords(raw, provider.name)
      if (records.length > 0) {
        addRecords(records)
        totalSynced += records.length
      }
    } catch (err: any) {
      errors.push(`${provider.name}: ${err.message}`)
    }
  }

  return { synced: totalSynced, errors, dbStats: getDbStats() }
}
