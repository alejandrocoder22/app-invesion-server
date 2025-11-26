import cookieParser from 'cookie-parser'
import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'

import { CronJob } from 'cron'
import { fetchIndividualPrice, getAllPrices, getYahooCurrencies, getYahooPrice } from './helpers/cron.js'

import authRouter from './routes/authRoutes.js'
import stocksRouter from './routes/stocksRoutes.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://localhost:5173',
    'https://app.invesion.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/stocks', stocksRouter)

app.use(errorHandler)

http.globalAgent.maxSockets = 100

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
}

if (process.env.NODE_ENV !== 'development') {
  const USA = new CronJob(
    '05 16 * * 1-5',
    async () => {
      try {
        await getAllPrices()
      } catch (error) {
        console.error('USA cron error:', error)
      }
    },
    null,
    true,
    'America/New_York'
  )

  const EU_CLOSE = new CronJob(
    '05 18 * * 1-5',
    async () => {
      try {
        await getYahooPrice()
      } catch (error) {
        console.error('EU_CLOSE cron error:', error)
      }
    },
    null,
    true,
    'Europe/Madrid'
  )

  const EU = new CronJob(
    '33 18 * * 1-5',
    async () => {
      try {
        await fetchIndividualPrice()
        await getYahooCurrencies()
      } catch (error) {
        console.error('EU cron error:', error)
      }
    },
    null,
    true,
    'America/New_York'
  )
}

export default app
