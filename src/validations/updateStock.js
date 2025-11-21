import { ValidationError } from '../helpers/customErrors.js'

const validateNumber = (regex, metricToValidate, errorMessage) => {
  // Maneja casos undefined o null
  if (metricToValidate == null) {
    throw new ValidationError(errorMessage)
  }
  if (!regex.test(String(metricToValidate))) {
    throw new ValidationError(errorMessage)
  }
}

export const validateUpdateStock = async (stock) => {
  const isAnyNumber = /^-?\d*(\.\d+)?$/ // Permite enteros, decimales, y negativos
  const isAnyNumberOrEmpty = /^(-?\d*(\.\d+)?|-?\.\d+|)$|^$/ // Permite números o vacío
  const isAnyPositiveNumber = /^(0|[1-9]\d*)(\.\d+)?$/ // Solo positivos, incluye 0 y decimales
  const isTicker = /^[A-Z]{1,5}$/

  for (const singleStock of stock) {
    const {
      ticker,
      cost_of_goods_sold,
      operating_income,
      income_before_taxes,
      income_tax_expense,
      earnings_per_share,
      net_income,
      diluted_shares_outstanding,
      total_cash,
      current_assets,
      current_liabilities,
      total_debt,
      equity,
      operating_cash_flow,
      capital_expenditures,
      cash_acquisitions,
      dividends_per_share,
      revenue
    } = singleStock

    validateNumber(isTicker, ticker, 'Invalid ticker')

    validateNumber(isAnyNumber, revenue, 'Revenue must be a number')
    validateNumber(isAnyNumber, net_income, 'Net income must be a number')
    validateNumber(isAnyPositiveNumber, diluted_shares_outstanding, 'Shares must be a positive number')
    validateNumber(isAnyPositiveNumber, cost_of_goods_sold, 'COGS must be a positive number')
    validateNumber(isAnyNumber, equity, 'Equity must be a number')
    validateNumber(isAnyNumber, operating_income, 'Operating income must be a number')
    validateNumber(isAnyNumber, income_before_taxes, 'Income before tax must be a number')
    validateNumber(isAnyNumber, income_tax_expense, 'Income tax expense must be a number')
    validateNumber(isAnyNumber, earnings_per_share, 'EPS must be a number')
    validateNumber(isAnyPositiveNumber, total_cash, 'Cash must be a positive number')
    validateNumber(isAnyNumber, current_assets, 'Current assets must be a number')
    validateNumber(isAnyNumber, current_liabilities, 'Current liabilities must be a number')
    validateNumber(isAnyNumberOrEmpty, total_debt, 'Total debt must be a number or empty')
    validateNumber(isAnyNumberOrEmpty, cash_acquisitions, 'Cash acquisitions must be a number or empty')
    validateNumber(isAnyNumberOrEmpty, dividends_per_share, 'Dividend per share must be a number or empty')
    validateNumber(isAnyNumber, operating_cash_flow, 'Operating cash flow must be a number')
    validateNumber(isAnyNumber, capital_expenditures, 'Capital expenditures must be a number')
  }
}
