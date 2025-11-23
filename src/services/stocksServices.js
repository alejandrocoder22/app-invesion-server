import pool from '../database/database.js'
import query from '../helpers/query.js'
import {
  calculateRoe,
  calculateScore,
  getUpdatedMetricData,
  calculateChangeInWorkingCapital,
  calculateRealFcf,
  calculateWorkingCapital,
  getReinvestMentRate,
  preparationForHistoricMetrics,
  calculateCostOfDebt,
  calculateTotalUnearnedRevenues
} from '../helpers/calculateMetrics.js'

import {
  getAllStocskSql,
  createMetricsSql,
  getAllOwnedStocskSql,
  updateIncomeStatementSql,
  updateBalanceSheetSql,
  updateIncomeStatementTtmSql,
  updateMetricsSql,
  updateCashFlowStatementTtmSql,
  getAllOwnedTickersSql,
  createCashFlowStatemenReitSql,
  updateTtmReitCashFlowStatementSql,
  updateCashFlowStatementReitSql,
  getEmptyDescriptionsSql,
  updateBalanceSheetSqlTTM,
  getHistoricMetricsSql
} from '../helpers/sqlQueries.js'
import { DatabaseError } from '../helpers/customErrors.js'
import { prepareCashFlowData } from './utils/prepareStockData.js'
import { cashFlowStatementsQueries } from './sql/cashFlowStatement.js'

const getAllStocks = () => query(getAllStocskSql)
const getHistoricMetrics = (companyId) => query(getHistoricMetricsSql, [companyId])

const getDescriptionsLLM = () => query(getEmptyDescriptionsSql)

const getComparativeTickers = async (tickers) => await pool.query(`

SELECT 
      ci.company_id,
      ci.ticker,
      ci.price,
      cm.ten_years_revenue_cagr,
      cm.ten_years_earnings_per_share_cagr,
      cm.ten_years_free_cash_flow_cagr,
      cm.average_five_years_roic,
      cm.average_five_years_operating_margin,
      cm.average_five_years_gross_margin,
      cm.average_five_years_free_cash_flow_margin,
      cm.current_ratio,
      cm.debt_to_ebitda,
      cm.debt_to_equity,
      istm.revenue,
      istm.net_income,
      istm.earnings_per_share,
      istm.cost_of_goods_sold,
      istm.operating_income,
      istm.dividends_per_share,
      istm.diluted_shares_outstanding,
      istm.earnings_per_share,
      istm.interest_expense,
      istm.income_before_taxes,
      istm.income_tax_expense,
      bs.total_debt,
      bs.total_cash,
      cf.free_cash_flow

FROM company_info ci

INNER JOIN company_metrics cm ON ci.company_id = cm.company_id

INNER JOIN (
    SELECT DISTINCT ON (company_id) *
    FROM income_statements
    WHERE period_type = 'ttm'
) istm ON ci.company_id = istm.company_id

INNER JOIN (
    SELECT DISTINCT ON (company_id) *
    FROM balance_sheets
    WHERE period_type = 'ttm'
) bs ON ci.company_id = bs.company_id

INNER JOIN (
    SELECT DISTINCT ON (company_id) *
    FROM cash_flow_statements
    WHERE period_type = 'ttm'
) cf ON ci.company_id = cf.company_id

WHERE ci.company_id IN (${tickers})
`)

const getAllOwnedStocks = (userId) => query(getAllOwnedStocskSql, [userId])
const getAllOwnedTickers = (userId) => query(getAllOwnedTickersSql, [userId])

const getAllTickers = () => query('SELECT ticker, company_id, company_name FROM company_info')

const getOneStock = (ticker) => query(`
SELECT * FROM company_metrics  
WHERE ticker = $1
LIMIT 1
`, [ticker])

const getOneStockTenYearsHistoric = (companyId) => query(
  `WITH ranked_data AS (
    SELECT 
        ci.ticker,
        i.fiscal_year AS year,
        i.period_type,
        i.revenue,
        i.net_income,
        i.earnings_per_share,
        i.cost_of_goods_sold,
        i.interest_income,
        i.operating_income,
        i.dividends_per_share,
        i.diluted_shares_outstanding,
        i.interest_expense,
        i.income_before_taxes,
        i.income_tax_expense,
        i.nopat,
        b.current_assets,
        b.current_liabilities,
        b.total_cash,
        b.equity,
        b.inventories,
        b.short_term_debt,
        b.long_term_debt,
        b.total_debt,
        b.goodwill,
        b.total_assets,
        b.other_intangibles,
        b.long_term_capital_leases,
        b.short_term_capital_leases,
        b.total_liabilities,
        b.unearned_revenues,
        b.unearned_revenues_non_current,
        b.accounts_receivable,
        b.accounts_payable,
        b.financial_debt,
        b.cost_of_debt,
        b.prepaid_expenses,
        b.accrued_expenses,
        b.total_unearned_revenues,
        c.operating_cash_flow,
        c.capital_expenditures,
        c.dividends_paid,
        c.debt_issued,
        c.debt_repaid,
        c.cash_acquisitions,
        c.stocks_compensations,
        c.repurchased_shares,
        c.change_in_working_capital,
        c.reinvestment_rate,
        c.working_capital,
        c.depreciation_and_amortization,
        c.sale_of_assets,
        c.free_cash_flow,
        c.reported_change_in_working_capital,
        c.simple_free_cash_flow,
        c.net_debt_issued,
        c.net_repurchased_shares,
        c.issued_shares,
        ROW_NUMBER() OVER (
          PARTITION BY i.period_type 
          ORDER BY i.fiscal_year DESC
        ) as rn
   FROM 
        company_info ci
        JOIN income_statements i ON ci.company_id = i.company_id
        JOIN balance_sheets b ON ci.company_id = b.company_id 
          AND i.fiscal_year IS NOT DISTINCT FROM b.fiscal_year
          AND i.period_type = b.period_type
        JOIN cash_flow_statements c ON ci.company_id = c.company_id 
          AND i.fiscal_year IS NOT DISTINCT FROM c.fiscal_year
          AND i.period_type = c.period_type
    WHERE 
        ci.company_id = $1
  )
  SELECT * FROM ranked_data
  WHERE (period_type = 'annual' AND rn <= 10)
     OR (period_type = 'ttm' AND rn = 1)
  ORDER BY 
    CASE WHEN year IS NULL THEN 9999 ELSE year END ASC,
    period_type ASC;`,
  [companyId]
)

const getOneStockDescription = (ticker) => query(`
SELECT * FROM company_info
WHERE ticker = $1
  `, [ticker])

const deleteStock = (companyId) => query('DELETE FROM company_info WHERE company_id = $1', [companyId])

const deleteStockFromPortfolio = async (companyId, userId) => {
  return query('DELETE from user_company_radar WHERE company_id = $1 AND user_id = $2', [companyId, userId])
}

const updateIncomeStatement = async (stockDataToUpdate, companyId, client) => {
  if (!stockDataToUpdate || stockDataToUpdate.length === 0) {
    throw new DatabaseError('Stock data is required')
  }

  try {
    const updatePromises = stockDataToUpdate.map((stockInfo, index) => {
      const operatingIncome = Number(stockInfo?.operating_income) || 0
      const incomeTax = Number(stockInfo?.income_tax_expense) || 0
      const incomeBeforeTax = Number(stockInfo?.income_before_taxes) || 0

      const taxRate = incomeBeforeTax !== 0 ? incomeTax / incomeBeforeTax : 0
      const NOPAT = operatingIncome * (1 + taxRate)
      const isTTM = index === 10
      const fiscalYear = isTTM ? null : stockInfo.year
      const periodType = isTTM ? 'ttm' : 'annual'

      const sql = isTTM ? updateIncomeStatementTtmSql : updateIncomeStatementSql

      const params = [
        companyId,
        fiscalYear,
        Number(stockInfo.revenue) || 0,
        Number(stockInfo.net_income) || 0,
        Number(stockInfo.earnings_per_share) || 0,
        Number(stockInfo.cost_of_goods_sold) || 0,
        Number(stockInfo.operating_income) || 0,
        Number(stockInfo.dividends_per_share) || 0,
        Number(stockInfo.diluted_shares_outstanding) || 0,
        Number(stockInfo.interest_expense) || 0,
        incomeBeforeTax,
        incomeTax,
        periodType,
        NOPAT,
        Number(stockInfo.interest_income) || 0
      ]

      const finalParams = isTTM && !updateIncomeStatementTtmSql.includes('fiscal_year')
        ? [params[0], ...params.slice(2)] // Omite fiscal_year
        : params

      return client.query(sql, finalParams)
    })

    const results = await Promise.all(updatePromises)
    return results
  } catch (error) {
    console.error('Error updating income statements:', {
      message: error.message,
      companyId,
      rowCount: stockDataToUpdate.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to update income statements', error)
  }
}

const updateBalanceSheet = async (stockDataToUpdate, companyId, client) => {
  if (!stockDataToUpdate || stockDataToUpdate.length === 0) {
    throw new DatabaseError('Stock data is required')
  }

  try {
    const updatePromises = stockDataToUpdate.map((stockInfo, index) => {
      const longTermCapitalLeases = Number(stockInfo.long_term_capital_leases) || 0
      const shortTermCapitalLeases = Number(stockInfo.short_term_capital_leases) || 0
      const totalDebt = Number(stockInfo.total_debt) || 0

      const financialDebt = Math.max(0, totalDebt - longTermCapitalLeases - shortTermCapitalLeases)
      const costOfDebt = calculateCostOfDebt(stockInfo.interest_expense, financialDebt) || 0
      const isTTM = index === 10
      const fiscalYear = isTTM ? null : stockInfo.year
      const periodType = isTTM ? 'ttm' : 'annual'

      const totalUnearnedRevenues = calculateTotalUnearnedRevenues(stockInfo.unearned_revenues, stockInfo.unearned_revenues_non_current)

      const sql = isTTM ? updateBalanceSheetSqlTTM : updateBalanceSheetSql
      const baseParams = [
        companyId,
        Number(stockInfo.current_assets) || 0,
        Number(stockInfo.current_liabilities) || 0,
        Number(stockInfo.total_cash) || 0,
        Number(stockInfo.equity) || 0,
        Number(stockInfo.inventories) || 0,
        stockInfo.short_term_debt ? Number(stockInfo.short_term_debt) : null,
        stockInfo.long_term_debt ? Number(stockInfo.long_term_debt) : null,
        Number(stockInfo.total_debt) || 0,
        stockInfo.long_term_capital_leases ? Number(stockInfo.long_term_capital_leases) : null,
        stockInfo.short_term_capital_leases ? Number(stockInfo.short_term_capital_leases) : null,
        Number(stockInfo.unearned_revenues) || 0,
        Number(stockInfo.accounts_receivable) || 0,
        Number(stockInfo.accounts_payable) || 0,
        Number(stockInfo.unearned_revenues_non_current) || 0,
        Number(stockInfo.goodwill) || 0,
        Number(stockInfo.total_assets) || 0,
        Number(stockInfo.other_intangibles) || 0,
        financialDebt,
        costOfDebt,
        Number(stockInfo.prepaid_expenses) || 0,
        Number(stockInfo.accrued_expenses) || 0,
        Number(totalUnearnedRevenues) || 0

      ]

      const params = isTTM
        ? baseParams
        : [
            baseParams[0],
            fiscalYear,
            ...baseParams.slice(1, 14),
            periodType,
            ...baseParams.slice(14)
          ]

      return client.query(sql, params)
    })

    const results = await Promise.all(updatePromises)
    return results
  } catch (error) {
    console.error('Error updating balance sheets:', {
      message: error.message,
      companyId,
      rowCount: stockDataToUpdate.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to update balance sheets', error)
  }
}

const updateCashFlowStatement = async (stockDataToUpdate, companyId, client) => {
  if (!stockDataToUpdate || stockDataToUpdate.length === 0) {
    throw new DatabaseError('Stock data is required')
  }

  try {
    const preparedData = prepareCashFlowData(stockDataToUpdate)

    if (!preparedData || preparedData.length === 0) {
      throw new DatabaseError('No data returned from prepareCashFlowData')
    }

    const queries = preparedData.map(data => {
      // Determinar qué SQL usar basado en period_type
      const sql = data.period_type === 'ttm'
        ? cashFlowStatementsQueries.updateTtm
        : cashFlowStatementsQueries.update

      const params = [
        companyId,
        data.year || null,
        Number(data.operating_cash_flow) || 0,
        Number(data.capital_expenditures) || 0,
        Number(data.dividends_paid) || 0,
        Number(data.debt_issued) || 0,
        Number(data.debt_repaid) || 0,
        Number(data.cash_acquisitions) || 0,
        Number(data.stocks_compensations) || 0,
        Number(data.repurchased_shares) || 0,
        Number(data.change_in_working_capital) || 0,
        Number(data.reinvestment_rate) || 0,
        Number(data.working_capital) || 0,
        Number(data.depreciation_and_amortization) || 0,
        Number(data.free_cash_flow) || 0,
        data.period_type,
        Number(data.simple_free_cash_flow) || 0,
        Number(data.reported_change_in_working_capital) || 0,
        Number(data.net_debt_issued) || 0,
        Number(data.issued_shares) || 0,
        Number(data.net_repurchased_shares) || 0
      ]

      return client.query(sql, params)
    })

    const results = await Promise.all(queries)
    return results
  } catch (error) {
    console.error('Error updating cash flow statements:', {
      message: error.message,
      companyId,
      rowCount: stockDataToUpdate?.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to update cash flow statements', error)
  }
}

const updateCashFlowStatementReit = async (stockDataToUpdate, companyId, client) => {
  try {
    return stockDataToUpdate.map(async (stockInfo, i) => {
      const FFO = (Number(stockInfo.net_income) + Number(stockInfo.depreciation_and_amortization) - Number(stockInfo.sale_of_assets)).toFixed(2)
      i === 10
        ? await client.query(updateTtmReitCashFlowStatementSql, [
          companyId, // company_id
          stockInfo.operating_cash_flow, // operating_cash_flow
          stockInfo.dividends_paid ? stockInfo.dividends_paid : 0, // dividends_paid
          stockInfo.debt_issued ? stockInfo.debt_issued : 0, // debt_issued
          stockInfo.debt_repaid ? stockInfo.debt_repaid : 0, // debt_repaid
          stockInfo.stocks_compensations ? stockInfo.stocks_compensations : 0, // stocks_compensations
          stockInfo.repurchased_shares ? stockInfo.repurchased_shares : 0, // repurchased_shares
          stockInfo.depreciation_and_amortization, // depreciation_and_amortization
          FFO || 0,
          'ttm',
          stockInfo.sale_of_assets || 0
        ])

        : await client.query(updateCashFlowStatementReitSql, [
          companyId, // company_id
          stockInfo.year, // fiscal_year
          stockInfo.operating_cash_flow, // operating_cash_flow
          stockInfo.dividends_paid ? stockInfo.dividends_paid : 0, // dividends_paid
          stockInfo.debt_issued ? stockInfo.debt_issued : 0, // debt_issued
          stockInfo.debt_repaid ? stockInfo.debt_repaid : 0, // debt_repaid
          stockInfo.stocks_compensations ? stockInfo.stocks_compensations : 0, // stocks_compensations
          stockInfo.repurchased_shares ? stockInfo.repurchased_shares : 0, // repurchased_shares
          stockInfo.depreciation_and_amortization, // depreciation_and_amortization
          FFO || 0, // free_cash_flow
          'annual',
          stockInfo.sale_of_assets || 0

        ])
    })
  } catch (error) {
    console.log(error)
  }
}

const updateStock = (newStockDescription, companyId) => {
  return query('UPDATE company_info SET price = $1, country = $2, sector = $3, industry = $4, currency = $5 WHERE company_id = $6', [
    newStockDescription.price,
    newStockDescription.country,
    newStockDescription.sector,
    newStockDescription.industry,
    newStockDescription.currency,
    companyId
  ])
}

const updateMetrics = async (arrayOfHistoricData, companyId, client) => {
  if (!arrayOfHistoricData || arrayOfHistoricData.length === 0) {
    throw new DatabaseError('Historic data is required')
  }

  try {
    const changeInNetWorkingCapital = arrayOfHistoricData.map((stock, i) =>
      calculateChangeInWorkingCapital(i, arrayOfHistoricData)
    )

    const arrayOfHistoricFcf = arrayOfHistoricData.map((stock, i) =>
      calculateRealFcf(arrayOfHistoricData[i], changeInNetWorkingCapital[i])
    )

    const metricsData = getUpdatedMetricData(
      arrayOfHistoricData,
      changeInNetWorkingCapital,
      arrayOfHistoricFcf
    )

    const score = calculateScore(metricsData.scoreMetrics)

    const sanitizeNumber = (value, defaultValue = 0) => {
      return isNaN(value) || !isFinite(value) ? defaultValue : Number(value)
    }

    const params = [
      companyId,
      sanitizeNumber(metricsData.debtToEquity),
      sanitizeNumber(metricsData.debtToEbitda),
      sanitizeNumber(metricsData.currentRatio),
      sanitizeNumber(metricsData.returnOnEquity),
      sanitizeNumber(metricsData.ttmRoic),
      sanitizeNumber(metricsData.grossMargin),
      sanitizeNumber(metricsData.operatingMargin),
      sanitizeNumber(metricsData.netMargin),
      sanitizeNumber(metricsData.netCashPerShare),
      sanitizeNumber(metricsData.cashConversion),
      sanitizeNumber(metricsData.fiveYearsAverageRoic),
      sanitizeNumber(metricsData.fiveYearsAverageGm),
      sanitizeNumber(metricsData.fiveYearsAverageOm),
      sanitizeNumber(metricsData.fiveYearsAverageFcfM),
      sanitizeNumber(metricsData.shareDilution),
      sanitizeNumber(metricsData.tenYearsRevenueGrowth),
      sanitizeNumber(metricsData.tenYearsEquityGrowth),
      sanitizeNumber(metricsData.tenYearsFcfGrowth),
      sanitizeNumber(metricsData.tenYearsEpsGrowth),
      sanitizeNumber(metricsData.fiveYearsAverageReinvestment),
      sanitizeNumber(score),
      sanitizeNumber(metricsData.consecutiveYearsIncreasingDividends),
      sanitizeNumber(metricsData.fiveYearsDividendGrowth),
      sanitizeNumber(metricsData.tenYearsDividendGrowth),
      sanitizeNumber(metricsData.consecutiveYearsPayingDividends),
      sanitizeNumber(metricsData.freeCashFlowMargin),
      sanitizeNumber(metricsData.ebitdaMargin)
    ]

    const result = await client.query(updateMetricsSql, params)

    return result
  } catch (error) {
    console.error('Error updating metrics:', {
      message: error.message,
      companyId,
      dataPoints: arrayOfHistoricData?.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to update metrics', error)
  }
}

const updateHistoricMetrics = async (stockHistoricData, companyId, client) => {
  if (!stockHistoricData || stockHistoricData.length === 0) {
    throw new DatabaseError('Stock historic data is required')
  }

  const values = stockHistoricData.map((stockInfo, index) => {
    const isTTM = index === stockHistoricData.length - 1 && stockHistoricData.length > 1
    const periodType = isTTM ? 'ttm' : 'annual'
    const fiscalYear = isTTM ? null : stockInfo.year

    const historicMetricData = preparationForHistoricMetrics(stockInfo, stockHistoricData, index)
    const {
      ROE,
      ROCE,
      ROIC,
      structuralGrowthRoe,
      structuralGrowthRoic,
      structuralGrowtoRoce,
      operatingMargin,
      debtToEquity,
      netMargin,
      grossMargin,
      fcfMargin,
      ebitdaMargin,
      netCashPerShare,
      cashConversion,
      netDebtToEbitda,
      freeCashFlowConversion,
      reinvestmentRate,
      debtCapitalAllocation,
      sharesCapitalAllocation,
      dividendsCapitalAllocation
    } = historicMetricData

    const sanitize = (value) => {
      const num = Number(value)
      return isNaN(num) || !isFinite(num) ? null : num
    }

    return [
      companyId,
      fiscalYear,
      periodType,
      sanitize(ROE),
      sanitize(structuralGrowthRoe),
      sanitize(ROIC),
      sanitize(structuralGrowthRoic),
      sanitize(ROCE),
      sanitize(structuralGrowtoRoce),
      sanitize(operatingMargin),
      sanitize(debtToEquity),
      sanitize(netMargin),
      sanitize(grossMargin),
      sanitize(fcfMargin),
      sanitize(ebitdaMargin),
      sanitize(netCashPerShare),
      sanitize(cashConversion),
      sanitize(netDebtToEbitda),
      sanitize(freeCashFlowConversion),
      sanitize(reinvestmentRate),
      sanitize(debtCapitalAllocation),
      sanitize(sharesCapitalAllocation),
      sanitize(dividendsCapitalAllocation)
    ]
  })

  const columnsPerRow = 23
  const placeholders = values.map((_, rowIndex) => {
    const rowPlaceholders = Array.from(
      { length: columnsPerRow },
      (_, colIndex) => `$${rowIndex * columnsPerRow + colIndex + 1}`
    )
    return `(${rowPlaceholders.join(',')})`
  }).join(',')

  const flatValues = values.flat()

  const sql = `
    INSERT INTO historic_metrics (
      company_id,
      fiscal_year,
      period_type,
      return_on_equity,
      roe_structural_growth,
      return_on_invested_capital,
      roic_structural_growth,
      return_on_capital_employed,
      roce_structural_growth,
      operating_margin,
      debt_to_equity,
      net_margin,
      gross_margin,
      free_cash_flow_margin,
      ebitda_margin,
      net_cash_per_share,
      cash_conversion,
      net_debt_ebitda,
      free_cash_flow_conversion,
      reinvestment_rate,
      debt_capital_allocation,
      shares_capital_allocation,
      dividends_capital_allocation
    ) VALUES ${placeholders}
    ON CONFLICT (company_id, fiscal_year, period_type)
    DO UPDATE SET
      period_type = EXCLUDED.period_type,
      return_on_equity = EXCLUDED.return_on_equity,
      roe_structural_growth = EXCLUDED.roe_structural_growth,
      return_on_invested_capital = EXCLUDED.return_on_invested_capital,
      roic_structural_growth = EXCLUDED.roic_structural_growth,
      return_on_capital_employed = EXCLUDED.return_on_capital_employed,
      roce_structural_growth = EXCLUDED.roce_structural_growth,
      operating_margin = EXCLUDED.operating_margin,
      debt_to_equity = EXCLUDED.debt_to_equity,
      net_margin = EXCLUDED.net_margin,
      gross_margin = EXCLUDED.gross_margin,
      free_cash_flow_margin = EXCLUDED.free_cash_flow_margin,
      ebitda_margin = EXCLUDED.ebitda_margin,
      net_cash_per_share = EXCLUDED.net_cash_per_share,
      cash_conversion = EXCLUDED.cash_conversion,
      net_debt_ebitda = EXCLUDED.net_debt_ebitda,
      updated_at = NOW(),
      free_cash_flow_conversion = EXCLUDED.free_cash_flow_conversion,
      reinvestment_rate = EXCLUDED.reinvestment_rate,
      debt_capital_allocation = EXCLUDED.debt_capital_allocation,
      shares_capital_allocation = EXCLUDED.shares_capital_allocation,
      dividends_capital_allocation = EXCLUDED.dividends_capital_allocation
  `

  try {
    const result = await client.query(sql, flatValues)
    return result
  } catch (error) {
    console.error('Error upserting historic metrics:', {
      message: error.message,
      companyId,
      rowCount: stockHistoricData.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to upsert historic metrics', error)
  }
}

const createMetrics = async (arrayOfHistoricData, companyId, client) => {
  try {
    const changeInNetWorkingCapital = arrayOfHistoricData.map((stock, i) => calculateChangeInWorkingCapital(i, arrayOfHistoricData))
    const arrayOfHistoricFcf = arrayOfHistoricData.map((stock, i) => calculateRealFcf(arrayOfHistoricData[i], changeInNetWorkingCapital[i]))

    const metricsData = getUpdatedMetricData(arrayOfHistoricData, changeInNetWorkingCapital, arrayOfHistoricFcf)
    const score = calculateScore(metricsData.scoreMetrics)
    return client.query(createMetricsSql,
      [
        companyId,
        metricsData.debtToEquity,
        metricsData.debtToEbitda,
        metricsData.currentRatio,
        metricsData.returnOnEquity,
        metricsData.ttmRoic,
        metricsData.grossMargin,
        metricsData.operatingMargin,
        metricsData.netMargin,
        metricsData.netCashPerShare,
        metricsData.cashConversion,
        metricsData.fiveYearsAverageRoic,
        metricsData.fiveYearsAverageGm,
        metricsData.fiveYearsAverageOm,
        metricsData.fiveYearsAverageFcfM,
        metricsData.shareDilution,
        metricsData.tenYearsRevenueGrowth,
        metricsData.tenYearsEquityGrowth,
        metricsData.tenYearsFcfGrowth,
        metricsData.tenYearsEpsGrowth,
        metricsData.fiveYearsAverageReinvestment,
        score,
        metricsData.consecutiveYearsIncreasingDividends,
        metricsData.consecutiveYearsPayingDividends,
        metricsData.fiveYearsDividendGrowth,
        metricsData.tenYearsDividendGrowth,
        metricsData.freeCashFlowMargin,
        metricsData.ebitdaMargin
      ]
    )
  } catch (error) {
    console.log(error)
    throw new DatabaseError('Something went wrong')
  }
}
const createCompanyInfo = async (stockDescription, client) => {
  try {
    return await client.query('INSERT INTO company_info (ticker, price) VALUES ($1,$2) RETURNING company_id ', [
      stockDescription.ticker,
      stockDescription.price
    ])
  } catch (error) {
    console.log(error)
    throw new DatabaseError('Something went wrong')
  }
}

const createIncomeStatemente = async (stockHistoricData, companyId, client) => {
  if (!stockHistoricData || stockHistoricData.length === 0) {
    throw new DatabaseError('Stock historic data is required')
  }

  const values = stockHistoricData.map((stockInfo, index) => {
    const operatingIncome = Number(stockInfo?.operating_income) || 0
    const incomeTax = Number(stockInfo?.income_tax_expense) || 0
    const incomeBeforeTax = Number(stockInfo?.income_before_taxes) || 0

    const taxRate = incomeBeforeTax !== 0 ? incomeTax / incomeBeforeTax : 0
    const NOPAT = operatingIncome * (1 + taxRate)

    const isTTM = index === stockHistoricData.length - 1 && stockHistoricData.length > 1
    const periodType = isTTM ? 'ttm' : 'annual'
    const fiscalYear = isTTM ? null : stockInfo.year

    return [
      companyId,
      fiscalYear,
      Number(stockInfo.revenue) || 0,
      Number(stockInfo.net_income) || 0,
      Number(stockInfo.earnings_per_share) || 0,
      Number(stockInfo.cost_of_goods_sold) || 0,
      Number(stockInfo.operating_income) || 0,
      Number(stockInfo.dividends_per_share) || 0,
      Number(stockInfo.diluted_shares_outstanding) || 0,
      Number(stockInfo.interest_expense) || 0,
      Number(stockInfo.income_before_taxes) || 0,
      Number(stockInfo.income_tax_expense) || 0,
      periodType,
      NOPAT,
      Number(stockInfo.interest_income) || 0
    ]
  })

  const columnsPerRow = 15
  const placeholders = values.map((_, rowIndex) => {
    const rowPlaceholders = Array.from(
      { length: columnsPerRow },
      (_, colIndex) => `$${rowIndex * columnsPerRow + colIndex + 1}`
    )
    return `(${rowPlaceholders.join(',')})`
  }).join(',')

  const flatValues = values.flat()

  const sql = `
    INSERT INTO income_statements (
      company_id,
      fiscal_year,
      revenue,
      net_income,
      earnings_per_share,
      cost_of_goods_sold,
      operating_income,
      dividends_per_share,
      diluted_shares_outstanding,
      interest_expense,
      income_before_taxes,
      income_tax_expense,
      period_type,
      nopat,
      interest_income
    ) VALUES ${placeholders}
  `

  try {
    const result = await client.query(sql, flatValues)
    return result
  } catch (error) {
    console.error('Error inserting income statements:', {
      message: error.message,
      companyId,
      rowCount: stockHistoricData.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to create income statements', error)
  }
}

const createBalanceSheet = async (stockHistoricData, companyId, client) => {
  if (!stockHistoricData || stockHistoricData.length === 0) {
    throw new DatabaseError('Stock historic data is required')
  }

  const values = stockHistoricData.map((stockInfo, index) => {
    const longTermCapitalLeases = Number(stockInfo.long_term_capital_leases) || 0
    const shortTermCapitalLeases = Number(stockInfo.short_term_capital_leases) || 0
    const totalDebt = Number(stockInfo.total_debt) || 0
    const financialDebt = (totalDebt - longTermCapitalLeases - shortTermCapitalLeases).toFixed(2)
    const costOfDebt = calculateCostOfDebt(stockInfo.interest_expense, financialDebt)
    const isTTM = index === stockHistoricData.length - 1 && stockHistoricData.length > 1
    const periodType = isTTM ? 'ttm' : 'annual'
    const fiscalYear = isTTM ? null : stockInfo.year
    const totalUnearnedRevenues = calculateTotalUnearnedRevenues(stockInfo.unearned_revenues, stockInfo.unearned_revenues_non_current)

    return [
      companyId,
      fiscalYear,
      Number(stockInfo.current_assets) || 0,
      Number(stockInfo.current_liabilities) || 0,
      Number(stockInfo.total_cash) || 0,
      Number(stockInfo.equity) || 0,
      Number(stockInfo.inventories) || 0,
      stockInfo.short_term_debt ? Number(stockInfo.short_term_debt) : null,
      stockInfo.long_term_debt ? Number(stockInfo.long_term_debt) : null,
      Number(stockInfo.total_debt) || 0,
      stockInfo.long_term_capital_leases ? Number(stockInfo.long_term_capital_leases) : null,
      stockInfo.short_term_capital_leases ? Number(stockInfo.short_term_capital_leases) : null,
      Number(stockInfo.unearned_revenues) || 0,
      Number(stockInfo.unearned_revenues_non_current) || 0,
      Number(stockInfo.accounts_receivable) || 0,
      Number(stockInfo.accounts_payable) || 0,
      Number(stockInfo.goodwill) || 0,
      Number(stockInfo.total_assets) || 0,
      Number(stockInfo.other_intangibles) || 0,
      financialDebt,
      periodType,
      costOfDebt,
      totalUnearnedRevenues
    ]
  })

  const columnsPerRow = values[0].length

  const placeholders = values.map((_, rowIndex) => {
    const rowPlaceholders = Array.from(
      { length: columnsPerRow },
      (_, colIndex) => `$${rowIndex * columnsPerRow + colIndex + 1}`
    )
    return `(${rowPlaceholders.join(',')})`
  }).join(',')

  const flatValues = values.flat()

  const sql = `
    INSERT INTO balance_sheets (
      company_id,
      fiscal_year,
      current_assets,
      current_liabilities,
      total_cash,
      equity,
      inventories,
      short_term_debt,
      long_term_debt,
      total_debt,
      long_term_capital_leases,
      short_term_capital_leases,
      unearned_revenues,
      unearned_revenues_non_current,
      accounts_receivable,
      accounts_payable,
      goodwill,
      total_assets,
      other_intangibles,
      financial_debt,
      period_type,
      cost_of_debt,
      total_unearned_revenues
    ) VALUES ${placeholders}
  `

  try {
    const result = await client.query(sql, flatValues)
    return result
  } catch (error) {
    console.error('Error inserting balance sheets:', {
      message: error.message,
      companyId,
      rowCount: stockHistoricData.length,
      columnsPerRow,
      stack: error.stack
    })
    throw new DatabaseError('Failed to create balance sheets', error)
  }
}

const createHistoricMetrics = async (stockHistoricData, companyId, client) => {
  if (!stockHistoricData || stockHistoricData.length === 0) {
    throw new DatabaseError('Stock historic data is required')
  }

  const values = stockHistoricData.map((stockInfo, index) => {
    const isTTM = index === stockHistoricData.length - 1 && stockHistoricData.length > 1
    const periodType = isTTM ? 'ttm' : 'annual'
    const fiscalYear = isTTM ? null : stockInfo.year

    const historicMetricData = preparationForHistoricMetrics(stockInfo, stockHistoricData, index)
    const {
      ROE,
      ROCE,
      ROIC,
      structuralGrowthRoe,
      structuralGrowthRoic,
      structuralGrowtoRoce,
      operatingMargin,
      debtToEquity,
      netMargin,
      grossMargin,
      fcfMargin,
      ebitdaMargin,
      netCashPerShare,
      cashConversion,
      netDebtToEbitda,
      freeCashFlowConversion,
      reinvestmentRate,
      debtCapitalAllocation,
      sharesCapitalAllocation,
      dividendsCapitalAllocation
    } = historicMetricData

    const sanitize = (value) => {
      const num = Number(value)
      return isNaN(num) || !isFinite(num) ? null : num
    }

    return [
      companyId,
      fiscalYear,
      periodType,
      sanitize(ROE),
      sanitize(structuralGrowthRoe),
      sanitize(ROIC),
      sanitize(structuralGrowthRoic),
      sanitize(ROCE),
      sanitize(structuralGrowtoRoce),
      sanitize(operatingMargin),
      sanitize(debtToEquity),
      sanitize(netMargin),
      sanitize(grossMargin),
      sanitize(fcfMargin),
      sanitize(ebitdaMargin),
      sanitize(netCashPerShare),
      sanitize(cashConversion),
      sanitize(netDebtToEbitda),
      sanitize(freeCashFlowConversion),
      sanitize(reinvestmentRate),
      sanitize(debtCapitalAllocation),
      sanitize(sharesCapitalAllocation),
      sanitize(dividendsCapitalAllocation)
    ]
  })

  const columnsPerRow = 23
  const placeholders = values.map((_, rowIndex) => {
    const rowPlaceholders = Array.from(
      { length: columnsPerRow },
      (_, colIndex) => `$${rowIndex * columnsPerRow + colIndex + 1}`
    )
    return `(${rowPlaceholders.join(',')})`
  }).join(',')

  const flatValues = values.flat()

  const sql = `
    INSERT INTO historic_metrics (
      company_id,
      fiscal_year,
      period_type,
      return_on_equity,
      roe_structural_growth,
      return_on_invested_capital,
      roic_structural_growth,
      return_on_capital_employed,
      roce_structural_growth,
      operating_margin,
      debt_to_equity,
      net_margin,
      gross_margin,
      free_cash_flow_margin,
      ebitda_margin,
      net_cash_per_share,
      cash_conversion,
      net_debt_ebitda,
      free_cash_flow_conversion,
      reinvestment_rate,
      debt_capital_allocation,
      shares_capital_allocation,
      dividends_capital_allocation
   
    ) VALUES ${placeholders}
  `

  try {
    const result = await client.query(sql, flatValues)
    return result
  } catch (error) {
    console.error('Error inserting historic metrics:', {
      message: error.message,
      companyId,
      rowCount: stockHistoricData.length,
      stack: error.stack
    })
    throw new DatabaseError('Failed to create historic metrics', error)
  }
}

const createCashFlowStatement = async (stockHistoricData, companyId, client, lastYearWorkingCapital) => {
  if (!stockHistoricData || stockHistoricData.length === 0) {
    throw new DatabaseError('Stock historic data is required')
  }

  const values = stockHistoricData.map((stockInfo, index) => {
    const isTTM = index === stockHistoricData.length - 1 && stockHistoricData.length > 1
    const periodType = isTTM ? 'ttm' : 'annual'
    const fiscalYear = isTTM ? null : stockInfo.year

    let changeInNetWorkingCapital
    if (isTTM && stockHistoricData[index].operating_cash_flow === stockHistoricData[index - 1].operating_cash_flow) {
      changeInNetWorkingCapital = calculateChangeInWorkingCapital(index - 1, stockHistoricData, lastYearWorkingCapital)
    } else {
      changeInNetWorkingCapital = calculateChangeInWorkingCapital(index, stockHistoricData, lastYearWorkingCapital)
    }

    const fcf = calculateRealFcf(stockInfo, changeInNetWorkingCapital)
    const addYearFcf = calculateRealFcf(
      stockHistoricData,
      calculateChangeInWorkingCapital(index, stockHistoricData, lastYearWorkingCapital)
    )

    const debtIssued = Number(stockInfo.debt_issued) || 0
    const debtRepaid = Number(stockInfo.debt_repaid) || 0
    const netDebtIssued = Number((debtIssued + debtRepaid).toFixed(2))

    const repurchasedShares = Number(stockInfo.repurchased_shares) || 0
    const issuedShares = Number(stockInfo.issued_shares) || 0
    const netRepurchasedShares = repurchasedShares + issuedShares

    const reinvestmentRate = getReinvestMentRate(index, stockHistoricData, addYearFcf)
    const safeReinvestmentRate = isFinite(reinvestmentRate) ? reinvestmentRate : 0

    const workingCapital = calculateWorkingCapital(
      stockInfo.accounts_receivable,
      stockInfo.inventories,
      stockInfo.prepaid_expenses,
      stockInfo.accounts_payable,
      stockInfo.accrued_expenses
    )
    const unleaveredFcf = Number(stockInfo.operating_cash_flow) + Number(stockInfo.capital_expenditures)

    return [
      companyId,
      fiscalYear,
      Number(stockInfo.operating_cash_flow) || 0,
      Number(stockInfo.capital_expenditures) || 0,
      Number(stockInfo.dividends_paid) || 0,
      debtIssued,
      debtRepaid,
      Number(stockInfo.cash_acquisitions) || 0,
      Number(stockInfo.stocks_compensations) || 0,
      repurchasedShares,
      changeInNetWorkingCapital,
      safeReinvestmentRate,
      workingCapital,
      Number(stockInfo.depreciation_and_amortization) || 0,
      fcf,
      periodType,
      unleaveredFcf,
      Number(stockInfo.reported_change_in_working_capital) || 0,
      netDebtIssued,
      netRepurchasedShares,
      issuedShares
    ]
  })

  const columnsPerRow = values[0].length

  const placeholders = values.map((_, rowIndex) => {
    const rowPlaceholders = Array.from(
      { length: columnsPerRow },
      (_, colIndex) => `$${rowIndex * columnsPerRow + colIndex + 1}`
    )
    return `(${rowPlaceholders.join(',')})`
  }).join(',')

  const flatValues = values.flat()

  const sql = `
    INSERT INTO cash_flow_statements (
      company_id,
      fiscal_year,
      operating_cash_flow,
      capital_expenditures,
      dividends_paid,
      debt_issued,
      debt_repaid,
      cash_acquisitions,
      stocks_compensations,
      repurchased_shares,
      change_in_working_capital,
      reinvestment_rate,
      working_capital,
      depreciation_and_amortization,
      free_cash_flow,
      period_type,
      simple_free_cash_flow,
      reported_change_in_working_capital,
      net_debt_issued,
      net_repurchased_shares,
      issued_shares
    ) VALUES ${placeholders}
  `

  try {
    const result = await client.query(sql, flatValues)
    return result
  } catch (error) {
    console.error('Error inserting cash flow statements:', {
      message: error.message,
      companyId,
      rowCount: stockHistoricData.length,
      columnsPerRow,
      stack: error.stack
    })
    throw new DatabaseError('Failed to create cash flow statements', error)
  }
}

const createCashFlowStatementReit = async (stockHistoricData, companyId, client, lastYearWorkingCapital) => {
  try {
    return stockHistoricData.map((stockInfo, i) => {
      const FFO = (Number(stockInfo.net_income) + Number(stockInfo.depreciation_and_amortization) - Number(stockInfo.sale_of_assets)).toFixed(2)
      const addYearFcf = calculateRealFcf(stockHistoricData, calculateChangeInWorkingCapital(i, stockHistoricData, lastYearWorkingCapital))
      client.query(createCashFlowStatemenReitSql,

        stockHistoricData.length > 1
          ? [
              companyId,
              i === 10 ? null : stockInfo.year, // fiscal_year
              stockInfo.operating_cash_flow, // operating_cash_flow
              stockInfo.capital_expenditures, // capital_expenditures
              stockInfo.dividends_paid ? stockInfo.dividends_paid : 0, // dividends_paid
              stockInfo.debt_issued ? stockInfo.debt_issued : 0, // debt_issued
              stockInfo.debt_repaid ? stockInfo.debt_repaid : 0, // debt_repaid
              stockInfo.cash_acquisitions ? stockInfo.cash_acquisitions : 0, // cash_acquisitions
              stockInfo.stocks_compensations ? stockInfo.stocks_compensations : 0, // stocks_compensations
              stockInfo.repurchased_shares ? stockInfo.repurchased_shares : 0, // repurchased_shares
              null, // change_in_working_capital
              isFinite(getReinvestMentRate(i, stockHistoricData, addYearFcf)) ? getReinvestMentRate(i, stockHistoricData, addYearFcf) : 0, // reinvestment_rate
              calculateWorkingCapital(stockInfo.accounts_receivable, stockInfo.inventories, stockInfo.prepaid_expenses, stockInfo.accounts_payable, stockInfo.accrued_expenses), // working_capital
              stockInfo.depreciation_and_amortization, // depreciation_and_amortization
              FFO,
              i === 10 ? 'ttm' : 'annual',
              stockInfo.sale_of_assets || 0
            ]
          : [
              companyId, // company_id
              stockInfo.year, // fiscal_year
              stockInfo.operating_cash_flow, // operating_cash_flow
              stockInfo.capital_expenditures, // capital_expenditures
              stockInfo.dividends_paid ? stockInfo.dividends_paid : 0, // dividends_paid
              stockInfo.debt_issued ? stockInfo.debt_issued : 0, // debt_issued
              stockInfo.debt_repaid ? stockInfo.debt_repaid : 0, // debt_repaid
              stockInfo.cash_acquisitions ? stockInfo.cash_acquisitions : 0, // cash_acquisitions
              stockInfo.stocks_compensations ? stockInfo.stocks_compensations : 0, // stocks_compensations
              stockInfo.repurchased_shares ? stockInfo.repurchased_shares : 0, // repurchased_shares
              calculateChangeInWorkingCapital(i, stockHistoricData, lastYearWorkingCapital), // change_in_working_capital
              isFinite(getReinvestMentRate(i, stockHistoricData, addYearFcf)) ? getReinvestMentRate(i, stockHistoricData, addYearFcf) : 0, // reinvestment_rate
              null, // working_capital
              stockInfo.depreciation_and_amortization, // depreciation_and_amortization
              FFO, // free_cash_flow
              'annual', // period_type,
              stockInfo.sale_of_assets || 0
            ]

      )
    })
  } catch (error) {
    console.log(error)
    throw new DatabaseError('Something went wrong')
  }
}

const createThesis = async (companyId, text) => {
  try {
    query(`
      UPDATE company_info
      SET thesis = $1
      WHERE company_id = $2
      `, [text, companyId])
  } catch (error) {
    console.error('Error updating thesis:', error)
  }
}

const getThesis = async (companyId) => query(`
  
SELECT
    ci.ticker,
    ci.thesis
FROM
    company_info ci

WHERE
    ci.company_id = $1;
 
  
  `, [companyId])

const updateBuyPriceUser = async (futureDcfPrice, futurePrice, companyId, userId) => query('UPDATE user_company_radar SET user_estimated_price_in_five_years = $1, user_dcf_estimated_price = $2 WHERE company_id = $3 AND user_id = $4', [futurePrice, futureDcfPrice, companyId, userId])
const updateBuyPriceDefault = async (futureDcfPrice, futurePrice, companyId) => query('UPDATE company_info SET default_estimated_price_in_five_years = $1, default_dcf_estimated_price = $2 WHERE company_id = $3 ', [futurePrice, futureDcfPrice, companyId])
const updateForwardEps = async (forwardEps, companyId) => query('UPDATE company_metrics SET forward_earnings_per_share = $1 WHERE company_id = $2', [forwardEps, companyId])

const addStockToPortfolio = async (companyId, userId) => await query('INSERT INTO user_company_radar (user_id, company_id) VALUES ($1, $2) ', [userId, companyId])

const updateSharesOwned = async (userId, companyId, sharesOwned) => await query('UPDATE user_company_radar SET shares_owned = $1 WHERE company_id = $2 AND user_id = $3', [sharesOwned, companyId, userId])

const updatePrice = async (price, companyId) => { await query('UPDATE company_info SET price = $1 WHERE company_id = $2', [price, companyId]) }

const updateTtmBalanceSheet = async (stockData, companyId, client) => {
  if (!stockData || stockData.length === 0) {
    throw new DatabaseError('Stock data is required')
  }

  // TTM es siempre 1 fila, tomamos la primera
  const stockInfo = stockData[0]

  // Calcular financial debt
  const longTermCapitalLeases = Number(stockInfo.long_term_capital_leases) || 0
  const shortTermCapitalLeases = Number(stockInfo.short_term_capital_leases) || 0
  const totalDebt = Number(stockInfo.total_debt) || 0
  const financialDebt = Math.max(0, totalDebt - longTermCapitalLeases - shortTermCapitalLeases)

  try {
    const result = await client.query(updateBalanceSheetSqlTTM, [
      companyId,
      Number(stockInfo.current_assets) || 0,
      Number(stockInfo.current_liabilities) || 0,
      Number(stockInfo.total_cash) || 0,
      Number(stockInfo.equity) || 0,
      Number(stockInfo.inventories) || 0,
      stockInfo.short_term_debt ? Number(stockInfo.short_term_debt) : null,
      stockInfo.long_term_debt ? Number(stockInfo.long_term_debt) : null,
      Number(stockInfo.total_debt) || 0,
      stockInfo.long_term_capital_leases ? Number(stockInfo.long_term_capital_leases) : null,
      stockInfo.short_term_capital_leases ? Number(stockInfo.short_term_capital_leases) : null,
      Number(stockInfo.unearned_revenues) || 0,
      Number(stockInfo.accounts_receivable) || 0,
      Number(stockInfo.accounts_payable) || 0,
      Number(stockInfo.unearned_revenues_non_current) || 0,
      Number(stockInfo.goodwill) || 0,
      Number(stockInfo.total_assets) || 0,
      Number(stockInfo.other_intangibles) || 0,
      financialDebt
    ])

    return result
  } catch (error) {
    console.error('Error updating TTM balance sheet:', {
      message: error.message,
      companyId,
      stack: error.stack
    })
    throw new DatabaseError('Failed to update TTM balance sheet', error)
  }
}

const updateTtmCashFlowsStatement = async (stockData, companyId, client, lastYearWorkingCapital) => {
  if (!stockData || stockData.length === 0) {
    throw new DatabaseError('Stock data is required')
  }

  const stockInfo = stockData[0]
  const index = 0

  const changeInNetWorkingCapital = calculateChangeInWorkingCapital(
    index,
    stockData,
    lastYearWorkingCapital
  )

  const fcf = calculateRealFcf(stockInfo, changeInNetWorkingCapital)

  const reinvestmentRate = getReinvestMentRate(index, stockData, fcf)
  const safeReinvestmentRate = isFinite(reinvestmentRate) ? reinvestmentRate : 0

  const workingCapital = calculateWorkingCapital(
    stockInfo.accounts_receivable,
    stockInfo.inventories,
    stockInfo.prepaid_expenses,
    stockInfo.accounts_payable,
    stockInfo.accrued_expenses
  )

  const unleaveredFcf = Number(
    (Number(stockInfo.operating_cash_flow) + Number(stockInfo.capital_expenditures)).toFixed(2)
  )

  try {
    const result = await client.query(updateCashFlowStatementTtmSql, [
      companyId,
      Number(stockInfo.operating_cash_flow) || 0,
      Number(stockInfo.capital_expenditures) || 0,
      Number(stockInfo.dividends_paid) || 0,
      Number(stockInfo.debt_issued) || 0,
      Number(stockInfo.debt_repaid) || 0,
      Number(stockInfo.cash_acquisitions) || 0,
      Number(stockInfo.stocks_compensations) || 0,
      Number(stockInfo.repurchased_shares) || 0,
      changeInNetWorkingCapital,
      safeReinvestmentRate,
      workingCapital,
      Number(stockInfo.depreciation_and_amortization) || 0,
      fcf,
      'ttm',
      unleaveredFcf
    ])

    return result
  } catch (error) {
    console.error('Error updating TTM cash flow statement:', {
      message: error.message,
      companyId,
      stack: error.stack
    })
    throw new DatabaseError('Failed to update TTM cash flow statement', error)
  }
}

const updateTtmIncomeStatement = async (stockData, companyId, client) => {
  if (!stockData || stockData.length === 0) {
    throw new DatabaseError('Stock data is required')
  }

  if (stockData.length === 1) {
    const stockInfo = stockData[0]

    const operatingIncome = Number(stockInfo?.operating_income) || 0
    const incomeTax = Number(stockInfo?.income_tax_expense) || 0
    const incomeBeforeTax = Number(stockInfo?.income_before_taxes) || 0

    const taxRate = incomeBeforeTax !== 0 ? incomeTax / incomeBeforeTax : 0
    const NOPAT = operatingIncome * (1 - taxRate)

    try {
      const result = await client.query(updateIncomeStatementTtmSql, [
        companyId,
        Number(stockInfo.revenue) || 0,
        Number(stockInfo.net_income) || 0,
        Number(stockInfo.earnings_per_share) || 0,
        Number(stockInfo.cost_of_goods_sold) || 0,
        operatingIncome,
        Number(stockInfo.dividends_per_share) || 0,
        Number(stockInfo.diluted_shares_outstanding) || 0,
        Number(stockInfo.interest_expense) || 0,
        incomeBeforeTax,
        incomeTax,
        'ttm',
        NOPAT
      ])

      return result
    } catch (error) {
      console.error('Error updating TTM income statement:', {
        message: error.message,
        companyId,
        stack: error.stack
      })
      throw new DatabaseError('Failed to update TTM income statement', error)
    }
  }
}
const updateDate = async (company_id, client = false) => {
  const updatedDate = new Date()

  if (client) {
    await client.query('UPDATE company_info SET updated_at = $1 WHERE company_id = $2', [updatedDate, company_id])
  } else {
    await query('UPDATE company_info SET updated_at = $1 WHERE company_id = $2', [updatedDate, company_id])
  }
}

const deleteAdminPriceEstimation = async (company_id, client) => {
  await client.query('UPDATE company_info SET  default_dcf_estimated_price = null, default_estimated_price_in_five_years = null WHERE company_id = $1', [company_id])
  await client.query(
    'UPDATE user_company_radar SET user_estimated_price_in_five_years = null, user_dcf_estimated_price = null WHERE company_id = $1',
    [company_id]
  )
}

export default {
  updateForwardEps,
  deleteAdminPriceEstimation,
  updatePrice,
  addStockToPortfolio,
  getAllStocks,
  getOneStock,
  deleteStock,
  updateStock,
  updateDate,
  createThesis,
  getThesis,
  getDescriptionsLLM,
  createMetrics,
  createCompanyInfo,
  getOneStockTenYearsHistoric,
  getOneStockDescription,
  updateMetrics,
  updateBuyPriceUser,
  updateBuyPriceDefault,
  getAllTickers,
  getComparativeTickers,
  createIncomeStatemente,
  createBalanceSheet,
  createCashFlowStatement,
  createCashFlowStatementReit,
  getAllOwnedStocks,
  getAllOwnedTickers,
  updateSharesOwned,
  deleteStockFromPortfolio,
  updateIncomeStatement,
  updateBalanceSheet,
  updateCashFlowStatement,
  updateTtmCashFlowsStatement,
  updateTtmIncomeStatement,
  updateTtmBalanceSheet,
  updateCashFlowStatementReit,
  createHistoricMetrics,
  getHistoricMetrics,
  updateHistoricMetrics
}
