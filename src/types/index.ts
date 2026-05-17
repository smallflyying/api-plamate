export interface UsageRecord {
  id: number
  date: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  request_count: number
  created_at: string
}

export interface UsageSummary {
  total_tokens: number
  prompt_tokens: number
  completion_tokens: number
  request_count: number
}

export interface TrendItem {
  date: string
  total_tokens: number
  prompt_tokens: number
  completion_tokens: number
  request_count: number
}

export interface ModelBreakdown {
  model: string
  total_tokens: number
  percentage: number
}

export interface ProviderConfig {
  id: number
  name: string
  apiKey: string
  baseUrl: string
  models: string[]
}
