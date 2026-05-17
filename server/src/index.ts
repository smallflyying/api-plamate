import express from 'express'
import cors from 'cors'
import usageRouter from './routes/usage.js'
import settingsRouter from './routes/settings.js'

const app = express()
const PORT = 8081

app.use(cors())
app.use(express.json())

app.use('/api/usage', usageRouter)
app.use('/api/settings', settingsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
