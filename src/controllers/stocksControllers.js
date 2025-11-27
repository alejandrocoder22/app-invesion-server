import countries from '../data/countries.js'
import industries from '../data/industries.js'
import sectors from '../data/sectors.js'

import pool from '../database/database.js'
import { createNormalStock, createReitStock } from '../helpers/createStocks.js'
import { delay, fetchIndividualPrice, getAllPrices, getYahooCurrencies, getYahooPrice } from '../helpers/cron.js'
import query from '../helpers/query.js'
import { getTtmDataByCompanyId } from '../helpers/sqlQueries.js'
import stocksServices from '../services/stocksServices.js'
import { handleError, handleSuccess } from '../utils/responsesHandlers.js'
import apicache from 'apicache'
import { validateUpdateStock } from '../validations/updateStock.js'
import { ValidationError } from '../helpers/customErrors.js'

const getAllStocks = async (req, res, next) => {
  try {
    const allStocksUser = await stocksServices.getAllStocks()

    handleSuccess(res, allStocksUser)
  } catch (error) {
    next(error)
  }
}
const getHistoricMetrics = async (req, res, next) => {
  const { companyId } = req.params
  try {
    const allStocksUser = await stocksServices.getHistoricMetrics(companyId)

    handleSuccess(res, allStocksUser)
  } catch (error) {
    next(error)
  }
}

const getAllOwnedStocks = async (req, res, next) => {
  const { userId } = req.user
  try {
    const allStocksUser = await stocksServices.getAllOwnedStocks(userId)
    handleSuccess(res, allStocksUser)
  } catch (error) {
    next(error)
  }
}

const getAllOwnedTickers = async (req, res, next) => {
  const { userId } = req.user
  try {
    const allTickersUser = await stocksServices.getAllOwnedTickers(userId)
    handleSuccess(res, allTickersUser)
  } catch (error) {
    next(error)
  }
}

const getAllTickers = async (req, res, next) => {
  try {
    const tickers = await stocksServices.getAllTickers()
    handleSuccess(res, tickers)
  } catch (error) {
    next(error)
  }
}

const addToPortfolio = async (req, res, next) => {
  const { companyId, futurePrice } = req.params
  const { userId } = req.user

  const ownedTickers = await stocksServices.getAllOwnedTickers(userId)

  const ids = new Set(ownedTickers.map(item => item.company_id))

  const exists = ids.has(Number(companyId))

  if (exists) return handleError(res, 400, 'You already added that stock')

  try {
    await stocksServices.addStockToPortfolio(companyId, userId)
    await stocksServices.updateBuyPriceUser(futurePrice, companyId, userId)
    handleSuccess(res, {}, 'Stock added to portfolio')
  } catch (error) {
    next(error)
  }
}

const getOneStock = async (req, res, next) => {
  const { companyId } = req.params

  try {
    const getCompanyInfo = await pool.query('SELECT * FROM company_info WHERE company_id = $1', [companyId])

    const id = getCompanyInfo.rows[0].company_id

    if (!id) {
      handleError(res, 400, 'This stock does not exist')
    }

    const companyMetrics = await pool.query(`
  SELECT * 
  FROM company_metrics
  INNER JOIN company_info 
    ON company_metrics.company_id = company_info.company_id 
  INNER JOIN income_statements 
    ON company_metrics.company_id = income_statements.company_id
 INNER JOIN balance_sheets 
    ON company_metrics.company_id = balance_sheets.company_id   
  WHERE company_metrics.company_id = $1
    AND income_statements.period_type = 'ttm'
`, [id])

    const stockTenYearsHistoric = await stocksServices.getOneStockTenYearsHistoric(id)

    handleSuccess(res, { stockMetrics: companyMetrics.rows[0], stockHistoric: stockTenYearsHistoric, stockDescription: getCompanyInfo.rows[0] })
  } catch (error) {
    next(error)
  }
}

const getOneStockTtm = async (req, res, next) => {
  const { companyId } = req.params

  try {
    const getTtmData = await query(getTtmDataByCompanyId, [companyId])
    handleSuccess(res, { stockTtmData: getTtmData[0] })
  } catch (error) {
    next(error)
  }
}

const getComparativeStocks = async (req, res, next) => {
  const tickers = req.query.tickers

  try {
    const stocksToCompare = await stocksServices.getComparativeTickers(tickers)
    handleSuccess(res, stocksToCompare.rows)
  } catch (error) {
    next(error)
  }
}
const deleteStock = (req, res, next) => {
  const { companyId } = req.params

  try {
    stocksServices.deleteStock(companyId)

    handleSuccess(res, {}, 'Stock deleted')
  } catch (error) {
    next(error)
  }
}

const deleteStockFromPortfolio = async (req, res, next) => {
  const { companyId } = req.params
  const { userId } = req.user
  try {
    await stocksServices.deleteStockFromPortfolio(companyId, userId)
    handleSuccess(res, {}, 'Stock Deleted')
  } catch (error) {
    next(error)
  }
}

const updateStockDescription = async (req, res) => {
  const { companyId } = req.params
  const {
    sector,
    country,
    industry,
    currency,
    description,
    use_simple_fcf,
    company_name,
    dividend_months
  } = req.body

  const fcfToUse = use_simple_fcf === 'Simple'

  if (dividend_months !== undefined) {
    if (!Array.isArray(dividend_months)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'dividend_months debe ser un array'
      })
    }

    const validMonths = dividend_months.every(month =>
      Number.isInteger(month) && month >= 1 && month <= 12
    )

    if (!validMonths) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Los meses deben ser números entre 1 y 12'
      })
    }
  }

  await query(
    `UPDATE company_info 
     SET sector = $2, 
         country = $3, 
         industry = $4, 
         currency = $5, 
         description = $6, 
         use_simple_fcf = $7, 
         company_name = $8,
         dividend_months = $9
     WHERE company_id = $1`,
    [companyId, sector, country, industry, currency, description, fcfToUse, company_name, dividend_months]
  )
  handleSuccess(res, {}, 'Description updated')
}

const updateStockDescriptionLLM = async (req, res) => {
  const { companyId } = req.params
  const { description } = req.body

  await query('UPDATE company_info SET description = $2 WHERE company_id = $1 ', [companyId, description])
  handleSuccess(res, {}, 'Description updated')
}

const updateStock = async (req, res, next) => {
  const { stockDataToUpdate, stockDescription } = req.body
  const { companyId } = req.params

  const cashFlowStrategies = {
    'Real Estate': stocksServices.updateCashFlowStatementReit,
    default: stocksServices.updateCashFlowStatement
  }

  const client = await pool.connect()
  try {
    if (stockDataToUpdate) {
      if (stockDescription.sector !== 'Real Estate') await validateUpdateStock(stockDataToUpdate)

      await client.query('BEGIN')
      if (companyId) {
        const updateCashFlowStrategy = cashFlowStrategies[stockDescription.sector] || cashFlowStrategies.default
        await stocksServices.updateDate(companyId, client)
        await stocksServices.updateIncomeStatement(stockDataToUpdate, companyId, client)
        await stocksServices.updateBalanceSheet(stockDataToUpdate, companyId, client)
        await updateCashFlowStrategy(stockDataToUpdate, companyId, client)
        await stocksServices.updateMetrics(stockDataToUpdate, companyId, client)
        await stocksServices.updateHistoricMetrics(stockDataToUpdate, companyId, client)
      }

      apicache.clear(`/stocks/${companyId}`)
      apicache.clear(`/stocks/ttm/${companyId}`)
      apicache.clear('/stocks')
      await client.query('COMMIT')
      handleSuccess(res, {}, 'Stock updated')
    }
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

const autoUpdateAllStocks = async (req, res, next) => {
  const client = await pool.connect()
  try {
    const tickers = await stocksServices.getAllTickers()

    for (const t of tickers) {
      try {
        const stockTenYearsHistoric = await stocksServices.getOneStockTenYearsHistoric(t.company_id)
        // const stockTTMData = await query(getTtmDataByCompanyId, [t.company_id])
        // const stockDataToUpdate = [...stockTenYearsHistoric, stockTTMData[0]]

        if (t.company_id && t.ticker !== 'VICI' && t.ticker !== 'O' && t.ticker !== 'REXR') {
          console.log('Procesando ticker:', t)
          await client.query('BEGIN')
          await stocksServices.updateCashFlowStatement(stockTenYearsHistoric, t.company_id, client)
          await stocksServices.updateMetrics(stockTenYearsHistoric, t.company_id, client)
          await stocksServices.updateHistoricMetrics(stockTenYearsHistoric, t.company_id, client)
          await client.query('COMMIT')
        }
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`Error updating stock ${t.company_id}:`, error)
        throw error
      }
    }
    apicache.clear('/stocks')
    handleSuccess(res, {}, 'All stocks updated')
  } catch (error) {
    next(error)
  } finally {
    client.release()
  }
}

const updatePrice = async (req, res) => {
  const { companyId } = req.params
  const { price } = req.body

  await stocksServices.updatePrice(price, companyId)

  handleSuccess(res, {}, 'Updated Stock Price')
}

const STOCK_HANDLERS = {
  generic: createNormalStock,
  'Real Estate': createReitStock
}

const createCompanyInfo = async (req, res, next) => {
  const { stock, stockDescription, stockType } = req.body
  try {
    if (!stockType) {
      throw new ValidationError('stockType is required')
    }
    const handler = STOCK_HANDLERS[stockType]
    if (!handler) {
      throw new ValidationError(
        `Invalid stockType: "${stockType}". Allowed values: ${Object.keys(STOCK_HANDLERS).join(', ')}`
      )
    }
    await handler(stock, stockDescription, res, next)
  } catch (error) {
    next(error)
  }
}

const addNewYear = async (req, res, next) => {
  const { stock } = req.body
  const { companyId } = req.params
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const lastYearWorkingCapital = await client.query('SELECT reported_change_in_working_capital from cash_flow_statements WHERE company_id = $1 AND period_type = $2  ORDER BY fiscal_year DESC LIMIT 1 ', [companyId, 'annual'])
    await stocksServices.createIncomeStatemente(Array(stock), companyId, client)
    await stocksServices.createBalanceSheet(Array(stock), companyId, client)
    await stocksServices.createCashFlowStatement(Array(stock), companyId, client, lastYearWorkingCapital.rows[0].working_capital)
    await stocksServices.updateDate(companyId, client)
    await stocksServices.updateTtmBalanceSheet(Array(stock), companyId, client)
    await stocksServices.updateTtmCashFlowsStatement(Array(stock), companyId, client, lastYearWorkingCapital.rows[0].working_capital)
    await stocksServices.updateTtmIncomeStatement(Array(stock), companyId, client)
    await stocksServices.deleteAdminPriceEstimation(companyId, client)
    await client.query('COMMIT')
    apicache.clear(`/stocks/${companyId}`)
    apicache.clear(`/stocks/ttm/${companyId}`)
    handleSuccess(res, { companyId }, 'Added new Year')
  } catch (error) {
    await client.query('ROLLBACK')

    console.log(error)
    next(error)
  } finally {
    client.release()
  }
}

const updateSharesOwned = async (req, res, next) => {
  const { userId } = req.user
  const { companyId } = req.params
  const { sharesOwned } = req.body
  try {
    await stocksServices.updateSharesOwned(userId, companyId, sharesOwned)
    handleSuccess(res, {}, 'Shares Owned updated')
  } catch (error) {
    console.error('Error al revertir la transacción:', error)
    next(error)
  }
}

let isPriceUpdateRunning = false

const getAllStocksPrice = async (req, res, next) => {
  try {
    if (isPriceUpdateRunning) {
      return handleSuccess(res, {}, 'Price update already in progress')
    }

    isPriceUpdateRunning = true

    await Promise.allSettled([
      getAllPrices(),
      fetchIndividualPrice(),
      getYahooPrice()
    ])

    await delay(10000)
    await getYahooCurrencies()

    handleSuccess(res, {}, 'Updated all prices')
  } catch (error) {
    next(error)
  } finally {
    isPriceUpdateRunning = false
  }
}
const getDescriptionLLM = async (req, res, next) => {
  const emptyDescriptions = await stocksServices.getDescriptionsLLM()
  res.send(emptyDescriptions)
}

const createThesis = async (req, res, next) => {
  const { text } = req.body
  const { companyId } = req.params
  try {
    await stocksServices.createThesis(companyId, text)
    res.send({ status: 'SUCESS', message: 'Post added' })
  } catch (error) {
    next(error)
  }
}

const getThesis = async (req, res, next) => {
  try {
    const { companyId } = req.params
    const md = await stocksServices.getThesis(companyId)

    res.send({ status: 'SUCESS', data: md[0] })
  } catch (error) {
    next(error)
  }
}

const getAllStocksHistoric = async (req, res, next) => {
  try {
    const allStocksHistoric = await stocksServices.getAllStocksHistoric()
    res.status(200).send({ status: 'SUCESS', data: allStocksHistoric })
  } catch (error) {
    next(error)
  }
}

const updateBuyPrice = async (req, res, next) => {
  const { userId } = req.user
  const { companyId } = req.params
  const { futurePrice, futureDcfPrice, futureEps } = req.body

  try {
    if (req.user.isAdmin) {
      await stocksServices.updateBuyPriceDefault(Number(futureDcfPrice), futurePrice, companyId, userId)
      await stocksServices.updateForwardEps(Number(futureEps), companyId)
    } else {
      await stocksServices.updateBuyPriceUser(Number(futureDcfPrice), futurePrice, companyId, userId)
    }
    apicache.clear('/stocks')
    handleSuccess(res, 200, {}, 'Updated valuation targets')
  } catch (error) {
    next(error)
  }
}
const getForex = async (req, res) => {
  try {
    const forexPrices = await pool.query('SELECT * FROM forex')
    handleSuccess(res, forexPrices.rows, 'Success')
  } catch (error) {
    handleError(res, 400, 'Something went wrong')
  }
}

const getErrorsLogs = async (req, res) => {
  try {
    const logsErrors = await pool.query('SELECT * FROM api_error_logs ORDER BY timestamp DESC')

    handleSuccess(res, logsErrors.rows, 'Success')
  } catch (error) {
    handleError(res, 400, 'Something went wrong')
  }
}

const upsertEstimations = async (req, res, next) => {
  try {
    const { companyId } = req.params // Obtener de URL
    const { estimations } = req.body // Solo las estimaciones en el body

    if (!companyId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'companyId es requerido en la URL'
      })
    }

    if (!estimations || !Array.isArray(estimations) || estimations.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'estimations (array) es requerido en el body'
      })
    }

    if (!estimations[0].fair_multiple) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Debes de incluir el multiplo'
      })
    }

    const query = `
  INSERT INTO stock_estimations (
    company_id, year, revenue, operating_income, interest_expense,
    capital_expenditures, depreciation_and_amortization,
    reported_change_in_working_capital, diluted_shares_outstanding,
    dividends_per_share, net_income, sale_of_assets,
    simple_free_cash_flow, tax_rate, cost_of_debt,
    net_debt_issued, equity, net_repurchased_shares, stocks_compensations,
    discount, ebit_multiple, fair_multiple, midterm_growth,
    roe_mid, terminal_rate, interest_income, accounts_receivable, inventories, prepaid_expenses,accounts_payable,accrued_expenses,total_unearned_revenues 
  )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)

  ON CONFLICT (company_id, year)
  DO UPDATE SET
    revenue = EXCLUDED.revenue,
    operating_income = EXCLUDED.operating_income,
    interest_expense = EXCLUDED.interest_expense,
    capital_expenditures = EXCLUDED.capital_expenditures,
    depreciation_and_amortization = EXCLUDED.depreciation_and_amortization,
    reported_change_in_working_capital = EXCLUDED.reported_change_in_working_capital,
    diluted_shares_outstanding = EXCLUDED.diluted_shares_outstanding,
    dividends_per_share = EXCLUDED.dividends_per_share,
    net_income = EXCLUDED.net_income,
    sale_of_assets = EXCLUDED.sale_of_assets,
    simple_free_cash_flow = EXCLUDED.simple_free_cash_flow,
    tax_rate = EXCLUDED.tax_rate,
    cost_of_debt = EXCLUDED.cost_of_debt,
    net_debt_issued = EXCLUDED.net_debt_issued,
    equity = EXCLUDED.equity,
    net_repurchased_shares = EXCLUDED.net_repurchased_shares,
    stocks_compensations = EXCLUDED.stocks_compensations,
    discount = EXCLUDED.discount,
    ebit_multiple = EXCLUDED.ebit_multiple,
    fair_multiple = EXCLUDED.fair_multiple,
    midterm_growth = EXCLUDED.midterm_growth,
    roe_mid = EXCLUDED.roe_mid,
    terminal_rate = EXCLUDED.terminal_rate,
    interest_income = EXCLUDED.interest_income,
    accounts_receivable = EXCLUDED.accounts_receivable,
    inventories = EXCLUDED.inventories,
    prepaid_expenses = EXCLUDED.prepaid_expenses,
    accounts_payable = EXCLUDED.accounts_payable,
    accrued_expenses = EXCLUDED.accrued_expenses,
    total_unearned_revenues = EXCLUDED.total_unearned_revenues,
    updated_at = NOW()
`

    for (const estimation of estimations) {
      const values = [
        companyId,
        estimation.year,
        estimation.revenue,
        estimation.operating_income,
        estimation.interest_expense,
        estimation.capital_expenditures,
        estimation.depreciation_and_amortization,
        estimation.reported_change_in_working_capital,
        estimation.diluted_shares_outstanding,
        estimation.dividends_per_share,
        estimation.net_income,
        estimation.sale_of_assets,
        estimation.simple_free_cash_flow,
        estimation.tax_rate,
        estimation.cost_of_debt,
        estimation.net_debt_issued,
        estimation.equity,
        estimation.net_repurchased_shares,
        estimation.stocks_compensations,
        estimation.discount,
        estimation.ebit_multiple,
        estimation.fair_multiple,
        estimation.midterm_growth,
        estimation.roe_mid,
        estimation.terminal_rate,
        estimation.interest_income,
        estimation.accounts_receivable,
        estimation.inventories,
        estimation.prepaid_expenses,
        estimation.accounts_payable,
        estimation.accrued_expenses,
        estimation.total_unearned_revenues
      ]
      await pool.query(query, values)
    }

    res.json({
      status: 'SUCCESS',
      message: `${estimations.length} estimaciones guardadas correctamente para la empresa ${companyId}`
    })
  } catch (error) {
    console.error('Error en upsertEstimations:', error)
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al guardar las estimaciones',
      error: error.message
    })
  }
}

const getEstimations = async (req, res, next) => {
  try {
    const { companyId } = req.params

    if (!companyId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'company_id es requerido'
      })
    }

    const query = `
      SELECT * FROM stock_estimations
      WHERE company_id = $1
      ORDER BY year ASC
    `

    const result = await pool.query(query, [companyId])

    res.json({
      status: 'SUCCESS',
      data: result.rows
    })
  } catch (error) {
    console.error('Error en getEstimations:', error)
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al obtener las estimaciones',
      error: error.message
    })
  }
}

const getSectors = async (req, res) => res.send(sectors)
const getCountries = async (req, res) => res.send(countries)
const getIndustries = async (req, res) => res.send(industries)

export default {

  getForex,
  updateSharesOwned,
  getAllOwnedTickers,
  getAllOwnedStocks,
  addToPortfolio,
  getIndustries,
  getCountries,
  getSectors,
  getComparativeStocks,
  getAllStocksHistoric,
  getAllStocks,
  getDescriptionLLM,
  getOneStock,
  getOneStockTtm,
  deleteStock,
  updateStock,
  updateStockDescriptionLLM,
  createCompanyInfo,
  getAllStocksPrice,
  createThesis,
  getThesis,
  getAllTickers,
  deleteStockFromPortfolio,
  addNewYear,
  updateBuyPrice,
  updateStockDescription,
  updatePrice,
  autoUpdateAllStocks,
  getErrorsLogs,
  upsertEstimations,
  getEstimations,
  getHistoricMetrics
}
