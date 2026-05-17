import { Router, Request, Response } from 'express'
import {
  getSummary, getTrend, getByModel, getUsageRecords,
  addRecord, getDbStats, getAllModels,
} from '../db.js'
import { syncFromProviders } from '../sync.js'

const router = Router()

router.get('/summary', (_req: Request, res: Response) => {
  const { start, end } = _req.query as Record<string, string>
  res.json(getSummary(start, end))
})

router.get('/trend', (_req: Request, res: Response) => {
  const { start, end } = _req.query as Record<string, string>
  res.json(getTrend(start, end))
})

router.get('/by-model', (_req: Request, res: Response) => {
  const { start, end } = _req.query as Record<string, string>
  res.json(getByModel(start, end))
})

router.get('/records', (_req: Request, res: Response) => {
  const { start, end, model, page, pageSize } = _req.query as Record<string, string>
  res.json(getUsageRecords(start, end, model, Number(page) || 1, Number(pageSize) || 10))
})

router.post('/record', (req: Request, res: Response) => {
  const { date, model, prompt_tokens, completion_tokens, request_count } = req.body
  if (!date || !model || prompt_tokens == null || completion_tokens == null) {
    res.status(400).json({ error: '缺少必填字段: date, model, prompt_tokens, completion_tokens' })
    return
  }
  const record = addRecord({
    date,
    model,
    prompt_tokens: Number(prompt_tokens),
    completion_tokens: Number(completion_tokens),
    total_tokens: Number(prompt_tokens) + Number(completion_tokens),
    request_count: Number(request_count) || 1,
  })
  res.json(record)
})

router.post('/sync', async (_req: Request, res: Response) => {
  try {
    const result = await syncFromProviders()
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 获取所有已配置的模型列表
router.get('/models', (_req: Request, res: Response) => {
  res.json(getAllModels())
})

export default router
