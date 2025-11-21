
import { defaultStrategy } from './scoreStrategies.js'

export const getLastItemOfArray = (array) => array[array.length - 1]

export const calculateFcfConversion = (fcf, netIncome) => (Number(fcf) / Number(netIncome) * 100).toFixed(2)

export const calculateDebtToEbitda = (stockHistoricInfo) => {
  const { total_debt, total_cash, operating_income, depreciation_and_amortization } = stockHistoricInfo

  const netDebt = Number(total_debt) - Number(total_cash)
  const ebitda = Number(operating_income) + Number(depreciation_and_amortization)

  return netDebt > 0 ? (netDebt / ebitda).toFixed(2) : 0
}
export const calculateNetDebtToEbitda = (stockHistoricInfo) => {
  const { total_debt, total_cash, operating_income, depreciation_and_amortization } = stockHistoricInfo

  const netDebt = Number(total_debt) - Number(total_cash)
  const ebitda = Number(operating_income) + Number(depreciation_and_amortization)

  return (netDebt / ebitda).toFixed(2)
}

const median = arr => {
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  return (arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2).toFixed(2)
}

const calculateCurrentRatio = (stockHistoricInfo) => {
  return (
    Number(stockHistoricInfo.current_assets) /
    Number(stockHistoricInfo.current_liabilities)
  ).toFixed(2)
}

export const calculateRoe = (equityT, equityMinusT, netIncome, index) => {
  if (index === 0) {
    return (Number(netIncome) / Number(equityT) * 100).toFixed(2)
  } else {
    return (Number(netIncome) / ((Number(equityT) + Number(equityMinusT)) / 2) * 100).toFixed(2)
  }
}

const calculateCurrentRoicWithArrayOfData = (stockHistoricInfo) => {
  const { operating_income, income_tax_expense, income_before_taxes, total_debt, equity, total_cash } = stockHistoricInfo
  return (
    (Number(operating_income) * (1 + Number(income_tax_expense) / Number(income_before_taxes)) / (Number(total_debt) - Number(total_cash) + Number(equity))) * 100).toFixed(2)
}

// Calcular tasa de reinversión
export const calculateReinvestmentRate = (net_income, dividends_paid, repurchased_shares) => {
  return (((Number(net_income) + Number(dividends_paid) + Number(repurchased_shares)) /
      Number(net_income)) * 100).toFixed(2)
}

// Calcular deuda neta pagada
export const calculateDebtCapitalAllocation = (debt_repaid, debt_issued, free_cash_flow) => {
  const netDebtRepaid = ((Number(debt_repaid) + Number(debt_issued)) / Number(free_cash_flow)) * 100

  return netDebtRepaid > 0 ? 0 : Math.abs(netDebtRepaid).toFixed(2)
}

export const calculateSharesCapitalAllocation = (repurchased_shares, free_cash_flow) => {
  const repurchasedShares = Number(repurchased_shares) || 0

  return Math.abs((repurchasedShares / Number(free_cash_flow) * 100).toFixed(2))
}

export const calculateDividendsCapitalAllocation = (free_cash_flow, dividends_paid) => {
  const dividendsPaid = Number(dividends_paid) || 0

  return Math.abs((dividendsPaid / Number(free_cash_flow) * 100).toFixed(2))
}

export const calculateCapexRate = (stockData) => {
  const capex = getGrowthCapex(stockData)
  const fcf = Number(stockData[FCF_TO_USE])
  return (capex / fcf * 100).toFixed(2)
}

export const calculateAcquisitionsRate = (stockData) => {
  const acquisitions = Math.abs(stockData.cash_acquisitions || 0)
  const fcf = Number(stockData[FCF_TO_USE])
  return (acquisitions / fcf * 100).toFixed(2)
}

export const calculateCurrentRoicWithSingleYear = (operatingIncome, incomeTaxExpense, incomeBeforeTax, netDebt, equity) => {
  const taxRate = Number(incomeTaxExpense) / Number(incomeBeforeTax)
  const nopat = Number(operatingIncome) * (1 + taxRate)
  const investedCapital = Number(netDebt) + Number(equity)

  return ((nopat / investedCapital) * 100).toFixed(2)
}

export const calculateRoce = (operatingIncomeT, operatingIncomeMinusT, equityT, equityMinusT, financialDebtT, financialDebtMinusT, index = null) => {
  if (index === 0) {
    return (Number(operatingIncomeT) / (Number(financialDebtT) + Number(equityT)) * 100).toFixed(2)
  } else {
    return ((((Number(operatingIncomeT) / (Number(financialDebtT) + Number(equityT))) + (operatingIncomeMinusT / (Number(equityMinusT) + Number(financialDebtMinusT)))) / 2) * 100).toFixed(2)
  }
}

export const calculateNOPAT = (operating_income, income_tax_expense, income_before_taxes) => {
  return (Number(operating_income) *
    (1 - (Number(income_tax_expense) / Number(income_before_taxes)))).toFixed(2)
}

export const calculateStructuralGrowthRoe = (ROE, net_income, dividends_paid, repurchased_shares) => {
  const retentionRatio = (Number(net_income) - Number(dividends_paid) - Number(repurchased_shares)) /
    Number(net_income)

  return (Number(ROE) * retentionRatio).toFixed(2)
}

export const calculateStructuralGrowthRoce = (ROCE, operating_income, dividends_paid, repurchased_shares) => {
  const retentionRatio = (Number(operating_income) - Number(dividends_paid) - Number(repurchased_shares)) /
    Number(operating_income)

  return ((Number(ROCE) / 100) * retentionRatio * 100).toFixed(2)
}

export const calculateStructuralGrowthRoic = (ROIC, operating_income, income_tax_expense, income_before_taxes, dividends_paid, repurchased_shares) => {
  const NOPAT = Number(operating_income) *
    (1 - (Number(income_tax_expense) / Number(income_before_taxes)))

  const retentionRatio = (NOPAT - Number(dividends_paid) - Number(repurchased_shares)) / NOPAT

  return ((Number(ROIC) / 100) * retentionRatio * 100).toFixed(2)
}
const calculateCagrFromArrayAndGivenYears = (years, data, metric) => {
  const CAGRFORMULA = (
    (Math.pow(
      data[data.length - 1][metric] / data[data.length - 1 - years][metric],
      1 / years
    ) -
      1) *
    100
  ).toFixed(2)

  return isFinite(CAGRFORMULA) ? CAGRFORMULA : 0
}

const calculateCagrFromArrayAndGivenYearsNoMetric = (years, data) => {
  const CAGRFORMULA = (
    (Math.pow(Number(data[9]) / Number(data[9 - years]), 1 / years) - 1) *
    100
  ).toFixed(2)

  return CAGRFORMULA
}

const calculateLastTenYearsFcf = (stockHistoricInfo) => {
  const tenYearsFcf = []

  for (let i = 0; i < 10; i++) {
    tenYearsFcf.push(
      Number(stockHistoricInfo[i].operating_cash_flow) +
        Number(stockHistoricInfo[i].capital_expenditures)
    )
  }

  return tenYearsFcf
}

export const calculateGrossMargin = (stockHistoricInfo) => {
  return (
    ((Number(stockHistoricInfo.revenue) -
      Number(stockHistoricInfo.cost_of_goods_sold)) /
      Number(stockHistoricInfo.revenue)) *
    100
  ).toFixed(2)
}

export const calculateOperatingMargin = (stockHistoricInfo) => {
  return (
    (Number(stockHistoricInfo.operating_income) /
      Number(stockHistoricInfo.revenue)) *
    100
  ).toFixed(2)
}

export const calculateCashConversion = (stockHistoricInfo) => {
  return (
    (Number(stockHistoricInfo.operating_cash_flow) /
      Number(stockHistoricInfo.operating_income)) *
    100
  ).toFixed(2)
}

const average = (arr) => Math.round((arr.reduce((previous, current) => previous + current) / arr.length) * 100) / 100

export const calculateFcfMargin = (fcf, revenue) => ((Number(fcf) / Number(revenue)) * 100).toFixed(2)

const calculateAverageMetricByYears = (years, stockInfo, changeInNetWorkingCapital = 0) => {
  const arrayOfFcf = []
  const arrayOfOm = []
  const arrayOfGm = []
  const arrayOfRoic = []

  for (let i = stockInfo.length - 1; i > stockInfo.length - years - 1; i--) {
    arrayOfFcf.push(Number(calculateFcfMargin(calculateRealFcf(stockInfo[i], changeInNetWorkingCapital[i]), stockInfo[i].revenue)))
    arrayOfOm.push(Number(calculateOperatingMargin(stockInfo[i])))
    arrayOfGm.push(Number(calculateGrossMargin(stockInfo[i])))
    arrayOfRoic.push(Number(calculateCurrentRoicWithArrayOfData(stockInfo[i])))
  }

  return {
    averageFcfMargin: average(arrayOfFcf),
    averageOmMargin: average(arrayOfOm),
    averageGmMargin: average(arrayOfGm),
    averageRoic: average(arrayOfRoic)
  }
}

export const calculateNetCashPerShare = (stockHistoricInfo) => {
  return (
    (Number(stockHistoricInfo.total_cash) - Number(stockHistoricInfo.total_debt)) /
    Number(stockHistoricInfo.diluted_shares_outstanding)
  ).toFixed(2)
}

export const calculateWorkingCapital = (inventories = 0, accountsPayable, accountsReceivable, unearnedrevenuesCurrent = 0, unearned_revenues_non_current = 0) => {
  return (Number(inventories) + Number(accountsReceivable) - Number(accountsPayable) - Number(unearnedrevenuesCurrent) - Number(unearned_revenues_non_current)).toFixed(2)
}

export const calculateChangeInWorkingCapital = (i, stockHistoricData, lastYearWorkingCapital = null) => {
  if (lastYearWorkingCapital) {
    return calculateWorkingCapital(stockHistoricData[i]?.inventories, stockHistoricData[i]?.accounts_payable, stockHistoricData[i]?.accounts_receivable, stockHistoricData[i]?.unearned_revenues, stockHistoricData[i]?.unearned_revenues_non_current) - Number(lastYearWorkingCapital)
  } else {
    return i === 0 ? null : calculateWorkingCapital(stockHistoricData[i]?.inventories, stockHistoricData[i]?.accounts_payable, stockHistoricData[i]?.accounts_receivable, stockHistoricData[i]?.unearned_revenues, stockHistoricData[i]?.unearned_revenues_non_current) - calculateWorkingCapital(stockHistoricData[i - 1]?.inventories, stockHistoricData[i - 1]?.accounts_payable, stockHistoricData[i - 1]?.accounts_receivable, stockHistoricData[i - 1]?.unearned_revenues, stockHistoricData[i - 1]?.unearned_revenues_non_current)
  }
}

export const calculateScore = (allScoreMetrics) => defaultStrategy(allScoreMetrics)

export const calculateRealFcf = (stockData) => {
  const workingCapital = stockData.reported_change_in_working_capital || stockData.change_in_working_capital || 0

  const getMaintenanceCapex = Number((stockData.depreciation_and_amortization) / stockData.capital_expenditures) * 100
  const normalisedMaintenanceCapex = getMaintenanceCapex < -100 ? -100 : getMaintenanceCapex.toFixed(2)
  const capexExGrowth = Math.abs(stockData.capital_expenditures * (Number(normalisedMaintenanceCapex) / 100)) * -1
  const realFcf = (Number(stockData.operating_income) + Number(stockData.interest_expense) + Number(stockData.income_tax_expense) + Number(stockData.depreciation_and_amortization) + Number(workingCapital) + Number(capexExGrowth)).toFixed(2)
  return realFcf
}

const calculateRealNormalisedUnleveredFcf = (stockData) => {
  const taxRate = 1 + Number(stockData.averageTaxRate) / 100

  return (Number(stockData.normalisedOperatingIncome) * taxRate + Number(stockData.normalisedDa) - Number(stockData.normalisedWorkingCapital) + Number(stockData.normalisedcapex)).toFixed(2)
}

const roundNumber = (number) => Math.round(number * 100) / 100

const getAverageFiveYearsOperatingIncome = (historicData) => {
  const numbers = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      numbers.push(Number(historicData[i].operatingincome) / historicData[i].revenue * 100)
    }
  }
  return average(numbers)
}

export const calculateEbitdaMargin = (revenue, operatingIncome, depreciation_and_amortization) => (Number(revenue) / (Number(operatingIncome) + Number(depreciation_and_amortization))).toFixed(2)

const getAverageFiveYearsReinvestmentRate = (historicData) => {
  const numbers = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      numbers.push(Number(calculateReinvestmentRate(historicData[i].net_income, historicData[i].dividends_paid, historicData[i].repurchased_shares)))
    }
  }

  return average(numbers)
}

const getAverageFiveYearTaxRate = (historicData) => {
  const ArrayOFHistoricData = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      ArrayOFHistoricData.push((Number(historicData[i].incometaxexpense) / Number(historicData[i].incomebeforetax) * 100))
    }
  }
  return average(ArrayOFHistoricData)
}

const getAverageFiveYearDA = (historicData) => {
  const numbers = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      numbers.push((Number(historicData[i].da)) / Number(historicData[i].revenue) * 100)
    }
  }
  return average(numbers)
}
const getAverageFiveYearWorkingCapital = (historicData) => {
  const numbers = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      numbers.push(Number((historicData[i].changeinworkingcapital) / Number(historicData[i].revenue) * 100))
    }
  }
  return average(numbers)
}

const getAverageFiveYearCapex = (historicData) => {
  const numbers = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      numbers.push(Number((historicData[i].capitalexpenditures) / Number(historicData[i].revenue) * 100))
    }
  }
  return average(numbers)
}

const getAverageFiveYearMaintenanceCapex = (historicData) => {
  const numbers = []
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      const getMaintenanceCapex = Number((historicData[historicData.length - i - 1]?.da) / Number(historicData[historicData.length - i - 1]?.capitalexpenditures) * 100)
      numbers.push(getMaintenanceCapex < -100 ? -100 : getMaintenanceCapex)
    }
  }

  return average(numbers)
}

const calculateNormalisedFcfData = (historicData) => {
  const fiveLastYears = historicData.slice((historicData.length - 5), historicData.length)

  const averageOperatingMargin = roundNumber(getAverageFiveYearsOperatingIncome(fiveLastYears))
  const averageTaxRate = roundNumber(getAverageFiveYearTaxRate(fiveLastYears))
  const averageDA = roundNumber(getAverageFiveYearDA(fiveLastYears))
  const averageWorkingCapital = roundNumber(getAverageFiveYearWorkingCapital(fiveLastYears))
  const averageMaintenanceCapex = roundNumber(getAverageFiveYearMaintenanceCapex(fiveLastYears))
  const averageCapex = roundNumber(getAverageFiveYearCapex(fiveLastYears))

  const normalisedOperatingIncome = Math.round((historicData[historicData.length - 1]?.revenue * averageOperatingMargin) / 100)
  const normalisedDa = Math.round((historicData[historicData.length - 1]?.revenue * averageDA) / 100)
  const normalisedWorkingCapital = Math.round((historicData[historicData.length - 1]?.revenue * averageWorkingCapital) / 100)
  const normalisedcapex = Math.round((historicData[historicData.length - 1]?.revenue * (averageCapex * (averageMaintenanceCapex / 100)) * -1) / 100)

  return {
    normalisedOperatingIncome,
    averageTaxRate,
    normalisedDa,
    normalisedWorkingCapital,
    normalisedcapex,
    averageOperatingMargin,
    averageDA,
    averageWorkingCapital,
    averageCapex
  }
}

function evaluarTendencia (margenesOperativos) {
  // Validar entrada
  if (!Array.isArray(margenesOperativos) || margenesOperativos.length < 2) {
    return null // O podrías lanzar un error: throw new Error('Se requieren al menos 2 valores numéricos');
  }

  // Validar que todos los elementos sean números válidos
  if (!margenesOperativos.every(val => typeof val === 'number' && isFinite(val))) {
    return null // O throw new Error('Todos los valores deben ser numéricos');
  }

  // Calcular el promedio de crecimientos anuales
  const crecimientos = margenesOperativos.slice(1).map((valor, indice) => {
    const anterior = margenesOperativos[indice]
    // Evitar división por cero
    if (anterior === 0) {
      return valor > 0 ? Infinity : valor < 0 ? -Infinity : 0
    }
    return (valor - anterior) / Math.abs(anterior)
  })

  // Calcular el promedio de los crecimientos
  const promedioCrecimiento = crecimientos.reduce((sum, val) => sum + val, 0) / crecimientos.length

  // Definir un umbral pequeño para considerar la tendencia como neutra
  const UMBRAL_NEUTRAL = 0.01 // 1% de cambio promedio

  if (promedioCrecimiento > UMBRAL_NEUTRAL) {
    return 'Positive'
  } else if (promedioCrecimiento < -UMBRAL_NEUTRAL) {
    return 'Negative'
  } else {
    return 'Neutral'
  }
}

export const calculateDebtToEquity = (total_debt, equity) => {
  if (!equity || Number(equity) === 0) return 0
  return Number((Number(total_debt) / Number(equity)).toFixed(2))
}

const getArrayOfOperatingMargin = (historicData) => {
  return historicData.map(singleHistoricData => (Number(singleHistoricData.operating_income) / Number(singleHistoricData.revenue)) * 100)
}

const getArrayOfGrossMargin = (historicData) => {
  return historicData.map(singleHistoricData => ((Number(singleHistoricData.revenue) - Number(singleHistoricData.cost_of_goods_sold)) / Number(singleHistoricData.revenue)) * 100)
}
const getArrayOfRoic = (historicData) => {
  return historicData.map(singleHistoricData => (calculateCurrentRoicWithSingleYear(singleHistoricData.operating_income, singleHistoricData.income_tax_expense, singleHistoricData.income_before_taxes, singleHistoricData.total_debt, singleHistoricData.equity)))
}

export const getReinvestMentRate = (i, historicData = undefined, arrayOfHistoricFcf = undefined) => {
  const expansionCapex = Math.abs(historicData[i]?.capital_expenditures) - historicData[i]?.depreciation_and_amortization
  const fcfToUse = arrayOfHistoricFcf[i] || historicData[i]?.free_cash_flow
  const finalCapex = expansionCapex > 0 ? expansionCapex : 0
  const reinvestmentOnAcquisitions = (Number(historicData[i]?.cash_acquisitions) * 100 / Number(fcfToUse)) * -1
  const reinvestmentOnCapex = finalCapex * 100 / Number(fcfToUse)

  return (reinvestmentOnAcquisitions + reinvestmentOnCapex).toFixed(2)
}

const getReturnOnEquity = (ttmData) => Number((Number(ttmData.net_income) / Number(ttmData.equity))).toFixed(2)

export const getNetMargin = (ttmData) => Number((Number(ttmData.net_income) / Number(ttmData.revenue) * 100).toFixed(2))

export const getConsecutiveDividendGrowthYears = (arrayOfHistoricData) => {
  let consecutiveYears = 0
  arrayOfHistoricData.forEach((_, i) => {
    if (i === 10 || i === 9) return
    if (arrayOfHistoricData[i + 1]?.dividends_per_share > arrayOfHistoricData[i]?.dividends_per_share) {
      consecutiveYears += 1
    } else {
      consecutiveYears = 0
    }
  }
  )

  return Number(consecutiveYears)
}

export const getConsecutiveYearsPayingDividend = (arrayOfHistoricData) => {
  let consecutiveYears = 0
  arrayOfHistoricData.forEach((_, i) => {
    if (i === 10 || i === 9) return
    if (arrayOfHistoricData[i + 1]?.dividends_per_share > 0) {
      consecutiveYears += 1
    }
  }
  )
  return Number(consecutiveYears)
}

export const getUpdatedMetricData = (arrayOfHistoricData, changeInNetWorkingCapital, arrayOfHistoricFcf) => {
  const ttmData = getLastItemOfArray(arrayOfHistoricData)

  const arrayWithoutTtmData = arrayOfHistoricData.slice(0, -1)

  let tenYearsEpsGrowth = null
  let tenYearsFcfGrowth = null
  let tenYearsEquityGrowth = null
  let tenYearsRevenueGrowth = null
  let fiveYearsAverageRoic = null
  let fiveYearsAverageGm = null
  let fiveYearsAverageOm = null
  let fiveYearsAverageFcfM = null
  let fiveYearsAverageReinvestment = null
  let tenYearsDividendGrowth = null
  let fiveYearsDividendGrowth = null
  let shareDilution = null
  let consecutiveYearsIncreasingDividends = null
  let consecutiveYearsPayingDividends = null
  let freeCashFlowMargin = null
  let ebitdaMargin = null

  if (arrayOfHistoricData.length > 9) {
    tenYearsEpsGrowth = calculateCagrFromArrayAndGivenYears(9, arrayWithoutTtmData, 'earnings_per_share')
    tenYearsFcfGrowth = calculateCagrFromArrayAndGivenYearsNoMetric(9, calculateLastTenYearsFcf(arrayWithoutTtmData))
    tenYearsEquityGrowth = calculateCagrFromArrayAndGivenYears(9, arrayWithoutTtmData, 'equity')
    tenYearsRevenueGrowth = calculateCagrFromArrayAndGivenYears(9, arrayWithoutTtmData, 'revenue')
    tenYearsDividendGrowth = calculateCagrFromArrayAndGivenYears(9, arrayWithoutTtmData, 'dividends_per_share')
    fiveYearsAverageRoic = calculateAverageMetricByYears(5, arrayWithoutTtmData).averageRoic
    fiveYearsAverageGm = calculateAverageMetricByYears(5, arrayWithoutTtmData).averageGmMargin
    fiveYearsAverageOm = calculateAverageMetricByYears(5, arrayWithoutTtmData).averageOmMargin
    fiveYearsAverageFcfM = calculateAverageMetricByYears(5, arrayWithoutTtmData, changeInNetWorkingCapital).averageFcfMargin
    fiveYearsAverageReinvestment = getAverageFiveYearsReinvestmentRate(arrayWithoutTtmData, arrayOfHistoricFcf)
    consecutiveYearsIncreasingDividends = getConsecutiveDividendGrowthYears(arrayOfHistoricData)
    consecutiveYearsPayingDividends = getConsecutiveYearsPayingDividend(arrayOfHistoricData)
  }

  if (arrayOfHistoricData.length > 4) {
    fiveYearsAverageRoic = calculateAverageMetricByYears(5, arrayWithoutTtmData).averageRoic
    fiveYearsAverageGm = calculateAverageMetricByYears(5, arrayWithoutTtmData).averageGmMargin
    fiveYearsAverageOm = calculateAverageMetricByYears(5, arrayWithoutTtmData).averageOmMargin
    fiveYearsAverageFcfM = calculateAverageMetricByYears(5, arrayWithoutTtmData, changeInNetWorkingCapital).averageFcfMargin
    fiveYearsAverageReinvestment = getAverageFiveYearsReinvestmentRate(arrayWithoutTtmData, arrayOfHistoricFcf)
    fiveYearsDividendGrowth = calculateCagrFromArrayAndGivenYears(5, arrayWithoutTtmData, 'dividends_per_share')
    shareDilution = calculateCagrFromArrayAndGivenYears(4, arrayWithoutTtmData, 'diluted_shares_outstanding')
    ebitdaMargin = calculateEbitdaMargin(ttmData.revenue, ttmData.operatingIncome, ttmData.depreciation_and_amortization)
    freeCashFlowMargin = calculateFcfMargin(calculateRealFcf(ttmData, changeInNetWorkingCapital[changeInNetWorkingCapital.length - 1]), ttmData?.revenue)
  }

  const ttmRoic = calculateCurrentRoicWithArrayOfData(ttmData)
  const currentRatio = calculateCurrentRatio(ttmData)
  const grossMargin = calculateGrossMargin(ttmData)
  const operatingMargin = calculateOperatingMargin(ttmData)
  const cashConversion = calculateCashConversion(ttmData)
  const netCashPerShare = calculateNetCashPerShare(ttmData)
  const debtToEbitda = calculateDebtToEbitda(ttmData, calculateRealNormalisedUnleveredFcf(calculateNormalisedFcfData(arrayOfHistoricData)))
  const debtToEquity = calculateDebtToEquity(ttmData)
  const returnOnEquity = getReturnOnEquity(ttmData)
  const netMargin = getNetMargin(ttmData)
  let arrayOfPayout = null
  if (consecutiveYearsIncreasingDividends >= 9) {
    arrayOfPayout = median(arrayOfHistoricData.map(s => Number(s.dividends_per_share) / (s.free_cash_flow / s.diluted_shares_outstanding)).slice(5, 10))
  }

  const arrayOfOperatingMargin = getArrayOfOperatingMargin(arrayWithoutTtmData)
  const arrayOfGrossMargin = getArrayOfGrossMargin(arrayWithoutTtmData)
  const arrayOfRoic = getArrayOfRoic(arrayWithoutTtmData)

  const scoreMetrics = {
    debt: debtToEbitda,
    currentRatio: currentRatio,
    anualisedEPS: tenYearsEpsGrowth,
    anualisedFCF: tenYearsFcfGrowth,
    roic: ttmRoic,
    revenueG: tenYearsRevenueGrowth,
    equityG: tenYearsEquityGrowth,
    shareDilution: shareDilution,
    grossmargin: grossMargin,
    operatingmargin: operatingMargin,
    cashConversion: cashConversion,
    lastFiveYearsROIC: fiveYearsAverageRoic,
    growOperatingMargin: evaluarTendencia(arrayOfOperatingMargin),
    growGrossMargin: evaluarTendencia(arrayOfGrossMargin),
    growRoic: evaluarTendencia(arrayOfRoic),
    netCashPerShare: netCashPerShare,
    medianPayoutRatio: arrayOfPayout,
    tenYearsDividendGrowth
  }

  return {
    returnOnEquity,
    scoreMetrics,
    debtToEbitda,
    debtToEquity,
    currentRatio,
    tenYearsEpsGrowth,
    tenYearsFcfGrowth,
    tenYearsRevenueGrowth,
    tenYearsEquityGrowth,
    ttmRoic,
    shareDilution,
    grossMargin,
    operatingMargin,
    netMargin,
    cashConversion,
    fiveYearsAverageRoic,
    fiveYearsAverageGm,
    fiveYearsAverageOm,
    netCashPerShare,
    fiveYearsAverageFcfM,
    fiveYearsAverageReinvestment,
    consecutiveYearsIncreasingDividends,
    tenYearsDividendGrowth,
    fiveYearsDividendGrowth,
    consecutiveYearsPayingDividends,
    freeCashFlowMargin,
    ebitdaMargin,
    median,
    calculateRoce
  }
}

export const preparationForHistoricMetrics = (stockHistoric, arrayOfHistoricData, index) => {
  const { total_cash, debt_repaid, debt_issued, depreciation_and_amortization, revenue, operating_income, equity, total_debt, income_tax_expense, income_before_taxes, dividends_paid, net_income, repurchased_shares } = stockHistoric
  const netDebt = Number(total_debt) - Number(total_cash)

  const equityT = arrayOfHistoricData[index]?.equity
  const equityMinusT = index === 0 ? 0 : arrayOfHistoricData[index - 1]?.equity

  const operatingIncomeT = arrayOfHistoricData[index]?.operating_income
  const operatingIncomeMinusT = index === 0 ? 0 : arrayOfHistoricData[index - 1]?.operating_income

  const financialDebtT = arrayOfHistoricData[index]?.financial_debt
  const financialDebtMinusT = index === 0 ? 0 : arrayOfHistoricData[index - 1]?.financial_debt

  const ROE = calculateRoe(equityT, equityMinusT, stockHistoric.net_income, index)
  const ROCE = calculateRoce(operatingIncomeT, operatingIncomeMinusT, equityT, equityMinusT, financialDebtT, financialDebtMinusT, index)
  const ROIC = calculateCurrentRoicWithSingleYear(stockHistoric.operating_income, stockHistoric.income_tax_expense, stockHistoric.income_before_taxes, netDebt, stockHistoric.equity)
  const structuralGrowthRoe = calculateStructuralGrowthRoe(ROE, net_income, dividends_paid, repurchased_shares)
  const structuralGrowthRoic = calculateStructuralGrowthRoic(ROIC, operating_income, income_tax_expense, income_before_taxes, dividends_paid, repurchased_shares)
  const structuralGrowtoRoce = calculateStructuralGrowthRoce(ROCE, operating_income, dividends_paid, repurchased_shares)
  const operatingMargin = calculateOperatingMargin(stockHistoric)
  const debtToEquity = calculateDebtToEquity(total_debt, equity)
  const netMargin = getNetMargin(stockHistoric)
  const grossMargin = calculateGrossMargin(stockHistoric)
  const freeCashFlow = calculateRealFcf(stockHistoric)
  const fcfMargin = calculateFcfMargin(freeCashFlow, revenue)
  const ebitdaMargin = calculateEbitdaMargin(revenue, operating_income, depreciation_and_amortization)
  const netCashPerShare = calculateNetCashPerShare(stockHistoric)
  const cashConversion = calculateCashConversion(stockHistoric)
  const netDebtToEbitda = calculateNetDebtToEbitda(stockHistoric)
  const freeCashFlowConversion = calculateFcfConversion(freeCashFlow, net_income)
  const reinvestmentRate = calculateReinvestmentRate(net_income, dividends_paid, repurchased_shares)
  const debtCapitalAllocation = calculateDebtCapitalAllocation(debt_repaid, debt_issued, freeCashFlow)
  const sharesCapitalAllocation = calculateSharesCapitalAllocation(repurchased_shares, freeCashFlow)
  const dividendsCapitalAllocation = calculateDividendsCapitalAllocation(freeCashFlow, dividends_paid)

  return {
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
    freeCashFlow,
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
  }
}
