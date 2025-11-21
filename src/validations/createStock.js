import { ValidationError } from '../helpers/customErrors.js'

const REGEX_PATTERNS = {
  isAnyNumber: /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/,
  isAnyPositiveNumber: /^(?:0|[1-9]\d*)(?:\.\d+)?$/,
  isAnyNumberOrEmpty: /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?)?$/,
  isTicker: /^[A-Z]{1,5}$/
}

const STOCK_VALIDATION_RULES = {
  revenue: {
    regex: 'isAnyNumber',
    message: 'Revenue must be a number'
  },
  net_income: {
    regex: 'isAnyNumber',
    message: 'Net income must be a number'
  },
  diluted_shares_outstanding: {
    regex: 'isAnyPositiveNumber',
    message: 'Shares must be a positive number'
  },
  cost_of_goods_sold: {
    regex: 'isAnyPositiveNumber',
    message: 'COGS must be a positive number'
  },
  equity: {
    regex: 'isAnyNumber',
    message: 'Equity must be a number'
  },
  operating_income: {
    regex: 'isAnyNumber',
    message: 'Operating income must be a number'
  },
  income_before_taxes: {
    regex: 'isAnyNumber',
    message: 'Income before tax must be a number'
  },
  income_tax_expense: {
    regex: 'isAnyNumber',
    message: 'Income tax expense must be a number'
  },
  earnings_per_share: {
    regex: 'isAnyNumber',
    message: 'EPS must be a number'
  },
  total_cash: {
    regex: 'isAnyPositiveNumber',
    message: 'Cash must be a positive number'
  },
  current_assets: {
    regex: 'isAnyNumber',
    message: 'Current assets must be a number'
  },
  current_liabilities: {
    regex: 'isAnyNumber',
    message: 'Current liabilities must be a number'
  },
  total_debt: {
    regex: 'isAnyNumberOrEmpty',
    message: 'Total debt must be a number or empty',
    allowEmpty: true
  },
  cash_acquisitions: {
    regex: 'isAnyNumberOrEmpty',
    message: 'Cash acquisitions must be a number or empty',
    allowEmpty: true
  },
  dividends_per_share: {
    regex: 'isAnyNumberOrEmpty',
    message: 'Dividend per share must be a number or empty',
    allowEmpty: true
  },
  operating_cash_flow: {
    regex: 'isAnyNumber',
    message: 'Operating cash flow must be a number'
  },
  capital_expenditures: {
    regex: 'isAnyNumber',
    message: 'Capital expenditures must be a number'
  }
}

const validateNumber = (regex, metricToValidate, errorMessage, fieldName = '', allowEmpty = false) => {
  if (allowEmpty && (metricToValidate === null || metricToValidate === undefined || metricToValidate === '')) {
    return
  }

  if (metricToValidate == null) {
    throw new ValidationError(errorMessage, fieldName, metricToValidate)
  }

  if (!regex.test(String(metricToValidate))) {
    throw new ValidationError(errorMessage, fieldName, metricToValidate)
  }
}

export const validateCreateStock = (stock, stockDescription) => {
  if (!Array.isArray(stock) || stock.length === 0) {
    throw new ValidationError('Stock data must be a non-empty array', 'stock', stock)
  }

  if (!stockDescription || typeof stockDescription !== 'object') {
    throw new ValidationError('Stock description must be an object', 'stockDescription', stockDescription)
  }

  validateNumber(
    REGEX_PATTERNS.isAnyNumber,
    stockDescription.price,
    'Price must be a number',
    'price'
  )

  validateNumber(
    REGEX_PATTERNS.isTicker,
    stockDescription.ticker,
    'Introduce a valid ticker',
    'ticker'
  )

  stock.forEach((singleStock, index) => {
    if (!singleStock || typeof singleStock !== 'object') {
      throw new ValidationError(
        `Stock data at index ${index} must be an object`,
        `stock[${index}]`,
        singleStock
      )
    }

    for (const [fieldName, rule] of Object.entries(STOCK_VALIDATION_RULES)) {
      const regexPattern = REGEX_PATTERNS[rule.regex]
      const fieldValue = singleStock[fieldName]

      validateNumber(
        regexPattern,
        fieldValue,
        rule.message,
        `${fieldName}[${index}]`,
        rule.allowEmpty || false
      )
    }
  })
}
