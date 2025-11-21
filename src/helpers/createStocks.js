import pool from '../database/database.js'
import stocksServices from '../services/stocksServices.js'
import { handleSuccess } from '../utils/responsesHandlers.js'
import { validateCreateStock } from '../validations/createStock.js'
import apicache from 'apicache'

export const createNormalStock = async (stock, stockDescription, res, next) => {
  let client

  try {
    validateCreateStock(stock, stockDescription)

    client = await pool.connect()

    await client.query('BEGIN')

    const companyInfoResponse = await stocksServices.createCompanyInfo(stockDescription, client)
    const companyId = companyInfoResponse?.rows[0].company_id

    if (!companyId) {
      throw new Error('Failed to create company: no company_id returned')
    }

    await Promise.all([
      stocksServices.createIncomeStatemente(stock, companyId, client),
      stocksServices.createBalanceSheet(stock, companyId, client),
      stocksServices.createCashFlowStatement(stock, companyId, client),
      stocksServices.createMetrics(stock, companyId, client),
      stocksServices.createHistoricMetrics(stock, companyId, client)
    ])

    await client.query('COMMIT')

    apicache.clear('/stocks')

    return handleSuccess(res, { companyId }, 'Stock Created')
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
    }

    console.error('Error creating stock:', {
      message: error.message,
      stack: error.stack,
      ticker: stockDescription?.ticker,
      timestamp: new Date().toISOString()
    })

    next(error)
  } finally {
    if (client) {
      client.release()
    }
  }
}

export const createReitStock = async (stock, stockDescription, res, next) => {
  // validateCreateStock(stock, stockDescription)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const companyInfoResponse = await stocksServices.createCompanyInfo(stockDescription, client)
    const companyId = companyInfoResponse?.rows[0].company_id

    if (companyId) {
      await stocksServices.createIncomeStatemente(stock, companyId, client)
      await stocksServices.createBalanceSheet(stock, companyId, client)
      await stocksServices.createCashFlowStatementReit(stock, companyId, client)
      await stocksServices.createMetrics(stock, companyId, client)
    }

    await client.query('COMMIT')
    apicache.clear('/stocks')
    handleSuccess(res, { companyId }, 'Stock Created')
  } catch (error) {
    await client.query('ROLLBACK')

    console.log(error)
    next(error)
  } finally {
    client.release()
  }
}
