import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DB_PATH = join(DATA_DIR, 'db.json')

interface UsageRecord {
  id: number
  date: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  request_count: number
  created_at: string
}

export interface ProviderConfig {
  id: number
  name: string
  apiKey: string
  baseUrl: string
  models: string[]
}

interface Database {
  usage_records: UsageRecord[]
  providers: ProviderConfig[]
}

function read(): Database {
  if (!existsSync(DB_PATH)) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    const initial: Database = { usage_records: [], providers: [] }
    writeFileSync(DB_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
  const raw = JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  // 兼容旧版 settings 格式迁移
  if (raw.settings && !raw.providers) {
    if (raw.settings.apiKey) {
      raw.providers = [{
        id: 1,
        name: 'DeepSeek',
        apiKey: raw.settings.apiKey,
        baseUrl: 'https://api.deepseek.com',
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
      }]
    } else {
      raw.providers = []
    }
    delete raw.settings
    writeFileSync(DB_PATH, JSON.stringify(raw, null, 2))
  }
  return raw
}

function write(db: Database): void {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// ---- Usage Records ----

export function getUsageRecords(start?: string, end?: string, model?: string, page = 1, pageSize = 10) {
  const db = read()
  let list = db.usage_records

  if (start) list = list.filter((r) => r.date >= start)
  if (end) list = list.filter((r) => r.date <= end)
  if (model) list = list.filter((r) => r.model === model)

  list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)

  const total = list.length
  const startIdx = (page - 1) * pageSize
  list = list.slice(startIdx, startIdx + pageSize)

  return { list, total }
}

export function getSummary(start?: string, end?: string) {
  const db = read()
  let list = db.usage_records
  if (start) list = list.filter((r) => r.date >= start)
  if (end) list = list.filter((r) => r.date <= end)

  return {
    total_tokens: list.reduce((s, r) => s + r.total_tokens, 0),
    prompt_tokens: list.reduce((s, r) => s + r.prompt_tokens, 0),
    completion_tokens: list.reduce((s, r) => s + r.completion_tokens, 0),
    request_count: list.reduce((s, r) => s + r.request_count, 0),
  }
}

export function getTrend(start?: string, end?: string) {
  const db = read()
  let list = db.usage_records
  if (start) list = list.filter((r) => r.date >= start)
  if (end) list = list.filter((r) => r.date <= end)

  const grouped = new Map<string, UsageRecord[]>()
  for (const r of list) {
    if (!grouped.has(r.date)) grouped.set(r.date, [])
    grouped.get(r.date)!.push(r)
  }

  const result = []
  for (const [date, records] of grouped) {
    result.push({
      date,
      total_tokens: records.reduce((s, r) => s + r.total_tokens, 0),
      prompt_tokens: records.reduce((s, r) => s + r.prompt_tokens, 0),
      completion_tokens: records.reduce((s, r) => s + r.completion_tokens, 0),
      request_count: records.reduce((s, r) => s + r.request_count, 0),
    })
  }
  result.sort((a, b) => a.date.localeCompare(b.date))
  return result
}

export function getByModel(start?: string, end?: string) {
  const db = read()
  let list = db.usage_records
  if (start) list = list.filter((r) => r.date >= start)
  if (end) list = list.filter((r) => r.date <= end)

  const grouped = new Map<string, number>()
  for (const r of list) {
    grouped.set(r.model, (grouped.get(r.model) || 0) + r.total_tokens)
  }

  const total = [...grouped.values()].reduce((s, v) => s + v, 0)
  const result = []
  for (const [model, tokens] of grouped) {
    result.push({ model, total_tokens: tokens, percentage: total ? Math.round((tokens / total) * 10000) / 100 : 0 })
  }
  result.sort((a, b) => b.total_tokens - a.total_tokens)
  return result
}

export function addRecord(record: Omit<UsageRecord, 'id' | 'created_at'>) {
  const db = read()
  const id = db.usage_records.length > 0 ? Math.max(...db.usage_records.map((r) => r.id)) + 1 : 1
  const newRecord: UsageRecord = {
    ...record,
    id,
    created_at: new Date().toISOString(),
  }
  db.usage_records.push(newRecord)
  write(db)
  return newRecord
}

export function addRecords(records: Omit<UsageRecord, 'id' | 'created_at'>[]) {
  const db = read()
  let maxId = db.usage_records.length > 0 ? Math.max(...db.usage_records.map((r) => r.id)) : 0
  const now = new Date().toISOString()
  for (const record of records) {
    maxId++
    db.usage_records.push({ ...record, id: maxId, created_at: now })
  }
  write(db)
  return db.usage_records.length
}

// ---- Providers ----

export function getProviders(): ProviderConfig[] {
  return read().providers
}

export function getProvider(id: number): ProviderConfig | undefined {
  return read().providers.find((p) => p.id === id)
}

export function addProvider(data: Omit<ProviderConfig, 'id'>): ProviderConfig {
  const db = read()
  const id = db.providers.length > 0 ? Math.max(...db.providers.map((p) => p.id)) + 1 : 1
  const provider: ProviderConfig = { ...data, id }
  db.providers.push(provider)
  write(db)
  return provider
}

export function updateProvider(id: number, data: Partial<Omit<ProviderConfig, 'id'>>): ProviderConfig | null {
  const db = read()
  const idx = db.providers.findIndex((p) => p.id === id)
  if (idx === -1) return null
  db.providers[idx] = { ...db.providers[idx], ...data, id }
  write(db)
  return db.providers[idx]
}

export function deleteProvider(id: number): boolean {
  const db = read()
  const idx = db.providers.findIndex((p) => p.id === id)
  if (idx === -1) return false
  db.providers.splice(idx, 1)
  write(db)
  return true
}

export function getAllModels(): string[] {
  const db = read()
  const models = new Set<string>()
  for (const p of db.providers) {
    for (const m of p.models) {
      models.add(m)
    }
  }
  return [...models].sort()
}

export function getDbStats() {
  const db = read()
  const records = db.usage_records
  const dates = records.map((r) => r.date).sort()
  return {
    recordCount: records.length,
    providerCount: db.providers.length,
    dateRange: dates.length > 0 ? `${dates[0]} ~ ${dates[dates.length - 1]}` : 'No data',
  }
}
