import express from 'express'
import stockControllers from '../controllers/stocksControllers.js'
import { validateToken, validateAdmin } from '../middleware/validateToken.js'
import apicache from 'apicache'
import validateThesis from '../middleware/validateThesis.js'

const cache = apicache.middleware

const router = express.Router()

//  Base Route /stocks/*

// Hardcoded endpoints to fill forms

router.get('/sectors', stockControllers.getSectors)
router.get('/industries', stockControllers.getIndustries)
router.get('/countries', stockControllers.getCountries)
router.get('/forex', stockControllers.getForex)

router.get('/', validateToken, cache('15 minutes'), stockControllers.getAllStocks)
router.get('/description/ai', validateToken, stockControllers.getDescriptionLLM)
router.get('/metrics/:companyId', validateToken, stockControllers.getHistoricMetrics)
router.get('/owned/tickers', validateToken, stockControllers.getAllOwnedTickers)
router.get('/owned', validateToken, stockControllers.getAllOwnedStocks)
router.get('/comparatives', validateToken, stockControllers.getComparativeStocks)
router.get('/tickers', cache('15 minutes'), stockControllers.getAllTickers)
router.get('/thesis/:companyId', validateToken, stockControllers.getThesis)
router.get('/:companyId', stockControllers.getOneStock)
router.get('/ttm/:companyId', stockControllers.getOneStockTtm)
router.get('/estimations/:companyId', stockControllers.getEstimations)
router.get('/null-thesis/null', stockControllers.getNullThesis)

router.delete('/:companyId', validateAdmin, stockControllers.deleteStock)
router.delete('/portfolio/:companyId', validateToken, stockControllers.deleteStockFromPortfolio)
router.delete('/estimations/:companyId', validateAdmin, stockControllers.deleteEstimationsAdmin)

router.put('/:companyId', validateAdmin, stockControllers.updateStock)
router.put('/buy-price/:companyId', validateToken, stockControllers.updateBuyPrice)
router.put('/prices/all', validateAdmin, stockControllers.getAllStocksPrice)
router.put('/metrics/all', validateAdmin, stockControllers.autoUpdateAllStocks)
router.put('/price/:companyId', validateAdmin, stockControllers.updatePrice)
router.put('/shares/:companyId', validateToken, stockControllers.updateSharesOwned)
router.put('/description/:companyId', validateAdmin, stockControllers.updateStockDescription)
router.put('/description/ai/:companyId', validateAdmin, stockControllers.updateStockDescriptionLLM)
router.put('/estimations/:companyId', validateAdmin, stockControllers.upsertEstimations)

router.post('/', validateAdmin, stockControllers.createCompanyInfo)
router.post('/year/:companyId', validateAdmin, stockControllers.addNewYear)
router.post('/thesis/:companyId', validateAdmin, validateThesis, stockControllers.createThesis)
router.post('/portfolio/:companyId/:futurePrice', validateToken, stockControllers.addToPortfolio)
router.post('/thesis-llm/:ticker', stockControllers.createThesisWithLLM)

// Cron tasks

router.put('/update/all', validateAdmin, stockControllers.getAllStocksPrice)

// Api errors

router.get('/api/logs', validateAdmin, stockControllers.getErrorsLogs)

export default router
