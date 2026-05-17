import { Router, Request, Response } from 'express'
import { getProviders, addProvider, updateProvider, deleteProvider, getDbStats, getAllModels } from '../db.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  res.json({
    providers: getProviders(),
    models: getAllModels(),
    dbStats: getDbStats(),
  })
})

router.post('/provider', (req: Request, res: Response) => {
  const { name, apiKey, baseUrl, models } = req.body
  if (!name || !apiKey) {
    res.status(400).json({ error: 'name 和 apiKey 为必填' })
    return
  }
  const provider = addProvider({
    name: String(name),
    apiKey: String(apiKey),
    baseUrl: String(baseUrl || ''),
    models: Array.isArray(models) ? models.map(String) : [],
  })
  res.json(provider)
})

router.put('/provider/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { name, apiKey, baseUrl, models } = req.body
  const updated = updateProvider(id, {
    ...(name !== undefined && { name: String(name) }),
    ...(apiKey !== undefined && { apiKey: String(apiKey) }),
    ...(baseUrl !== undefined && { baseUrl: String(baseUrl) }),
    ...(models !== undefined && { models: Array.isArray(models) ? models.map(String) : [] }),
  })
  if (!updated) {
    res.status(404).json({ error: 'Provider 不存在' })
    return
  }
  res.json(updated)
})

router.delete('/provider/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const ok = deleteProvider(id)
  if (!ok) {
    res.status(404).json({ error: 'Provider 不存在' })
    return
  }
  res.json({ success: true })
})

export default router
