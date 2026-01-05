import { defaultStrategy } from "./scoreStrategies.js";

export const getLastItemOfArray = (array) => array[array.length - 1];

const median = (arr) => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return (
    arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
  ).toFixed(2);
};

const average = (arr) =>
  Math.round(
    (arr.reduce((previous, current) => previous + current) / arr.length) * 100
  ) / 100;

export const calculateFcfConversion = (fcf, netIncome) =>
  ((Number(fcf) / Number(netIncome)) * 100).toFixed(2);

export const calculateNetDebtToEbitda = (stockHistoricInfo) => {
  const {
    total_debt,
    total_cash,
    operating_income,
    depreciation_and_amortization,
  } = stockHistoricInfo;

  const netDebt = Number(total_debt) - Number(total_cash);
  const ebitda =
    Number(operating_income) + Number(depreciation_and_amortization);

  return (netDebt / ebitda).toFixed(2);
};

export const calculateCostOfDebt = (interest_expense, financial_debt) => {
  const expense = Number(interest_expense) || 0;
  const debt = Number(financial_debt) || 0;

  if (debt === 0) return "0.00";

  return ((expense / debt) * 100).toFixed(2);
};

const calculateCurrentRatio = (stockHistoricInfo) => {
  return (
    Number(stockHistoricInfo.current_assets) /
    Number(stockHistoricInfo.current_liabilities)
  ).toFixed(2);
};

export const calculateNormalizedRoe = (
  equityT,
  equityMinusT,
  netIncome,
  index
) => {
  if (index === 0) {
    return ((Number(netIncome) / Number(equityT)) * 100).toFixed(2);
  } else {
    return (
      (Number(netIncome) / ((Number(equityT) + Number(equityMinusT)) / 2)) *
      100
    ).toFixed(2);
  }
};

export const calculateReinvestmentRate = (
  net_income,
  dividends_paid,
  repurchased_shares
) => {
  return (
    ((Number(net_income) +
      Number(dividends_paid) +
      Number(repurchased_shares)) /
      Number(net_income)) *
    100
  ).toFixed(2);
};

export const calculateDebtCapitalAllocation = (
  debt_repaid,
  debt_issued,
  free_cash_flow
) => {
  const netDebtRepaid =
    ((Number(debt_repaid) + Number(debt_issued)) / Number(free_cash_flow)) *
    100;

  return netDebtRepaid > 0 ? 0 : Math.abs(netDebtRepaid).toFixed(2);
};

export const calculateSharesCapitalAllocation = (
  repurchased_shares,
  free_cash_flow
) => {
  const repurchasedShares = Number(repurchased_shares) || 0;

  return Math.abs(
    ((repurchasedShares / Number(free_cash_flow)) * 100).toFixed(2)
  );
};

export const calculateDividendsCapitalAllocation = (
  free_cash_flow,
  dividends_paid
) => {
  const dividendsPaid = Number(dividends_paid) || 0;

  return Math.abs(((dividendsPaid / Number(free_cash_flow)) * 100).toFixed(2));
};

export const calculateRoic = (
  operatingIncome,
  incomeTaxExpense,
  incomeBeforeTax,
  total_debt,
  total_cash,
  equity
) => {
  const NOPAT =
    Number(operatingIncome) *
    (1 + Number(incomeTaxExpense) / Number(incomeBeforeTax));
  const investedCapital =
    Number(total_debt) - Number(total_cash) + Number(equity);

  return ((NOPAT / investedCapital) * 100).toFixed(2);
};

export const calculateNormalizedRoce = (
  operatingIncomeT,
  operatingIncomeMinusT,
  equityT,
  equityMinusT,
  financialDebtT,
  financialDebtMinusT,
  index = null
) => {
  if (index === 0) {
    return (
      (Number(operatingIncomeT) / (Number(financialDebtT) + Number(equityT))) *
      100
    ).toFixed(2);
  } else {
    return (
      ((Number(operatingIncomeT) / (Number(financialDebtT) + Number(equityT)) +
        operatingIncomeMinusT /
          (Number(equityMinusT) + Number(financialDebtMinusT))) /
        2) *
      100
    ).toFixed(2);
  }
};

export const calculateNOPAT = (
  operating_income,
  income_tax_expense,
  income_before_taxes
) => {
  return (
    Number(operating_income) *
    (1 - Number(income_tax_expense) / Number(income_before_taxes))
  ).toFixed(2);
};

export const calculateStructuralGrowthRoe = (
  ROE,
  net_income,
  dividends_paid,
  repurchased_shares
) => {
  const retentionRatio =
    (Number(net_income) + Number(dividends_paid) + Number(repurchased_shares)) /
    Number(net_income);

  return (Number(ROE) * retentionRatio).toFixed(2);
};

export const calculateStructuralGrowthRoce = (
  ROCE,
  operating_income,
  dividends_paid,
  repurchased_shares
) => {
  const retentionRatio =
    (Number(operating_income) +
      Number(dividends_paid) +
      Number(repurchased_shares)) /
    Number(operating_income);

  return ((Number(ROCE) / 100) * retentionRatio * 100).toFixed(2);
};

export const calculateStructuralGrowthRoic = (
  ROIC,
  operating_income,
  income_tax_expense,
  income_before_taxes,
  dividends_paid,
  repurchased_shares
) => {
  const NOPAT =
    Number(operating_income) *
    (1 - Number(income_tax_expense) / Number(income_before_taxes));

  const retentionRatio =
    (NOPAT + Number(dividends_paid) + Number(repurchased_shares)) / NOPAT;

  return ((Number(ROIC) / 100) * retentionRatio * 100).toFixed(2);
};
const calculateCagrFromArrayAndGivenYears = (years, data, metric) => {
  const CAGRFORMULA = (
    (Math.pow(
      data[data.length - 1][metric] / data[data.length - 1 - years][metric],
      1 / years
    ) -
      1) *
    100
  ).toFixed(2);

  return isFinite(CAGRFORMULA) ? CAGRFORMULA : 0;
};

const calculateCagrFromArrayAndGivenYearsNoMetric = (years, data) => {
  const CAGRFORMULA = (
    (Math.pow(Number(data[9]) / Number(data[9 - years]), 1 / years) - 1) *
    100
  ).toFixed(2);

  return CAGRFORMULA;
};

const calculateLastTenYearsFcf = (stockHistoricInfo) => {
  const tenYearsFcf = [];

  for (let i = 0; i < 10; i++) {
    tenYearsFcf.push(
      Number(stockHistoricInfo[i].operating_cash_flow) +
        Number(stockHistoricInfo[i].capital_expenditures)
    );
  }

  return tenYearsFcf;
};

export const calculateGrossMargin = (stockHistoricInfo) => {
  return (
    ((Number(stockHistoricInfo.revenue) -
      Number(stockHistoricInfo.cost_of_goods_sold)) /
      Number(stockHistoricInfo.revenue)) *
    100
  ).toFixed(2);
};

export const calculateOperatingMargin = (stockHistoricInfo) => {
  return (
    (Number(stockHistoricInfo.operating_income) /
      Number(stockHistoricInfo.revenue)) *
    100
  ).toFixed(2);
};

export const calculateCashConversion = (stockHistoricInfo) => {
  return (
    (Number(stockHistoricInfo.operating_cash_flow) /
      Number(stockHistoricInfo.operating_income)) *
    100
  ).toFixed(2);
};

export const calculateFcfMargin = (fcf, revenue) =>
  ((Number(fcf) / Number(revenue)) * 100).toFixed(2);

const calculateAverageMetricByYears = (
  years,
  stockInfo,
  changeInNetWorkingCapital = 0
) => {
  const arrayOfFcf = [];
  const arrayOfOm = [];
  const arrayOfGm = [];
  const arrayOfRoic = [];

  for (let i = stockInfo.length - 1; i > stockInfo.length - years - 1; i--) {
    arrayOfFcf.push(
      Number(
        calculateFcfMargin(
          calculateRealFcf(stockInfo[i], changeInNetWorkingCapital[i]),
          stockInfo[i].revenue
        )
      )
    );
    arrayOfOm.push(Number(calculateOperatingMargin(stockInfo[i])));
    arrayOfGm.push(Number(calculateGrossMargin(stockInfo[i])));
    arrayOfRoic.push(
      Number(
        calculateRoic(
          stockInfo[i].operating_income,
          stockInfo[i].income_tax_expense,
          stockInfo[i].income_before_taxes,
          stockInfo[i].total_debt,
          stockInfo[i].total_cash,
          stockInfo[i].equity
        )
      )
    );
  }

  return {
    averageFcfMargin: average(arrayOfFcf),
    averageOmMargin: average(arrayOfOm),
    averageGmMargin: average(arrayOfGm),
    averageRoic: average(arrayOfRoic),
  };
};

export const calculateNetCashPerShare = (stockHistoricInfo) => {
  return (
    (Number(stockHistoricInfo.total_cash) -
      Number(stockHistoricInfo.total_debt)) /
    Number(stockHistoricInfo.diluted_shares_outstanding)
  ).toFixed(2);
};

export const calculateFinancialDebt = (
  total_debt,
  long_term_capital_leases,
  short_term_capital_leases
) => {
  return (
    Number(total_debt) -
    Number(long_term_capital_leases) -
    Number(short_term_capital_leases)
  ).toFixed(2);
};

export const calculateWorkingCapital = (
  accounts_receivable,
  inventories,
  prepaid_expenses = 0,
  accounts_payable,
  accrued_expenses,
  total_unearned_revenues
) => {
  return (
    Number(accounts_receivable) +
    Number(inventories) +
    Number(prepaid_expenses) -
    Number(accounts_payable) -
    Number(accrued_expenses) -
    Number(total_unearned_revenues)
  ).toFixed(2);
};

export const calculateTaxRate = (income_tax_expense, income_before_taxes) => {
  const incomeTaxExpense = income_tax_expense || 0;

  const incomeBeforeTax = income_before_taxes || 0;

  return ((Number(incomeTaxExpense) / Number(incomeBeforeTax)) * 100).toFixed(
    2
  );
};

export const calculateChangeInWorkingCapital = (
  i,
  stockHistoricData,
  lastYearWorkingCapital = null
) => {
  if (lastYearWorkingCapital) {
    return (
      calculateWorkingCapital(
        stockHistoricData[i]?.accounts_receivable,
        stockHistoricData[i]?.inventories,
        stockHistoricData[i]?.prepaid_expenses,
        stockHistoricData[i]?.accounts_payable,
        stockHistoricData[i]?.accrued_expenses,
        stockHistoricData[i]?.total_unearned_revenues
      ) - Number(lastYearWorkingCapital)
    );
  } else {
    return i === 0
      ? null
      : calculateWorkingCapital(
          stockHistoricData[i]?.accounts_receivable,
          stockHistoricData[i]?.inventories,
          stockHistoricData[i]?.prepaid_expenses,
          stockHistoricData[i]?.accounts_payable,
          stockHistoricData[i]?.accrued_expenses,
          stockHistoricData[i]?.total_unearned_revenues
        ) -
          calculateWorkingCapital(
            stockHistoricData[i - 1]?.accounts_receivable,
            stockHistoricData[i - 1]?.inventories,
            stockHistoricData[i - 1]?.prepaid_expenses,
            stockHistoricData[i - 1]?.accounts_payable,
            stockHistoricData[i - 1]?.accrued_expenses,
            stockHistoricData[i - 1]?.total_unearned_revenues
          );
  }
};

export const calculateScore = (allScoreMetrics) =>
  defaultStrategy(allScoreMetrics);

// export const calculateRealFcf = (stockData) => {
//   const workingCapital = stockData.reported_change_in_working_capital || stockData.change_in_working_capital || 0

//   const realFcf = (Number(stockData.operating_income) + Number(stockData.interest_expense) + Number(stockData.interest_income) + Number(stockData.income_tax_expense) + Number(stockData.depreciation_and_amortization) + Number(workingCapital) + Number(stockData.capital_expenditures)).toFixed(2)
//   return realFcf
// }

export const calculateRealFcf = (stockData) => {
  const workingCapital =
    stockData.reported_change_in_working_capital ||
    stockData.change_in_working_capital ||
    0;

  const debtIssued = Number(stockData.debt_issued) || 0;
  const debtRepaid = Number(stockData.debt_repaid) || 0;

  const netBorrow = debtIssued + debtRepaid;

  const realFcf = (
    Number(stockData.net_income) +
    Number(stockData.depreciation_and_amortization) +
    Number(workingCapital) +
    Number(stockData.capital_expenditures) +
    netBorrow
  ).toFixed(2);
  return realFcf;
};

export const calculateFCFF = (stockData) => {
  const workingCapital =
    Number(stockData.reported_change_in_working_capital) ||
    Number(stockData.change_in_working_capital) ||
    0;

  const taxRate =
    Number(stockData.income_tax_expense) /
    Number(stockData.income_before_taxes);

  const FCFF =
    Number(stockData.operating_income) * (1 + Number(taxRate)) +
    Number(stockData.depreciation_and_amortization) +
    workingCapital +
    Number(stockData.capital_expenditures);

  return FCFF.toFixed(2);
};

export const calculateSimpleFcf = (stockData) => {
  const simpleFcf =
    Number(stockData.operating_cash_flow) +
    Number(stockData.capital_expenditures) -
    Number(stockData.stocks_compensations);
  return simpleFcf.toFixed(2);
};

export const calculateTotalUnearnedRevenues = (
  unearnedRevenuesCurrent,
  unearnedRevenuesNonCurrent
) => {
  const unearnedCurrent = unearnedRevenuesCurrent || 0;
  const unearnedNonCurrent = unearnedRevenuesNonCurrent || 0;

  return (Number(unearnedCurrent) + Number(unearnedNonCurrent)).toFixed(2);
};

export const calculateEbitdaMargin = (
  revenue,
  operatingIncome,
  depreciation_and_amortization
) =>
  (
    Number(revenue) /
    (Number(operatingIncome) + Number(depreciation_and_amortization))
  ).toFixed(2);

const getAverageFiveYearsReinvestmentRate = (historicData) => {
  const numbers = [];
  if (historicData.length > 0) {
    for (let i = 0; i < historicData.length; i++) {
      numbers.push(
        Number(
          calculateReinvestmentRate(
            historicData[i].net_income,
            historicData[i].dividends_paid,
            historicData[i].repurchased_shares
          )
        )
      );
    }
  }

  return average(numbers);
};

function evaluarTendencia(margenesOperativos) {
  // Validar entrada
  if (!Array.isArray(margenesOperativos) || margenesOperativos.length < 2) {
    return null;
  }

  // Validar que todos los elementos sean números válidos
  if (
    !margenesOperativos.every((val) => typeof val === "number" && isFinite(val))
  ) {
    return null;
  }

  const n = margenesOperativos.length;

  const x = Array.from({ length: n }, (_, i) => i);
  const y = margenesOperativos;

  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_xx = 0;

  for (let i = 0; i < n; i++) {
    sum_x += x[i];
    sum_y += y[i];
    sum_xy += x[i] * y[i];
    sum_xx += x[i] * x[i];
  }

  const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);

  const promedio = sum_y / n;

  const pendienteNormalizada =
    promedio !== 0 ? slope / Math.abs(promedio) : slope;
  const UMBRAL_NEUTRAL = 0.02;

  if (pendienteNormalizada > UMBRAL_NEUTRAL) {
    return "Positive";
  } else if (pendienteNormalizada < -UMBRAL_NEUTRAL) {
    return "Negative";
  } else {
    return "Neutral";
  }
}

export const calculateDebtToEquity = (total_debt, equity) => {
  if (!equity || Number(equity) === 0) return 0;
  return Number((Number(total_debt) / Number(equity)).toFixed(2));
};

const getArrayOfOperatingMargin = (historicData) => {
  return historicData.map(
    (singleHistoricData) =>
      (Number(singleHistoricData.operating_income) /
        Number(singleHistoricData.revenue)) *
      100
  );
};

const getArrayOfGrossMargin = (historicData) => {
  return historicData.map(
    (singleHistoricData) =>
      ((Number(singleHistoricData.revenue) -
        Number(singleHistoricData.cost_of_goods_sold)) /
        Number(singleHistoricData.revenue)) *
      100
  );
};
const getArrayOfRoic = (historicData) => {
  return historicData.map((singleHistoricData) =>
    Number(
      calculateRoic(
        singleHistoricData.operating_income,
        singleHistoricData.income_tax_expense,
        singleHistoricData.income_before_taxes,
        singleHistoricData.total_debt,
        singleHistoricData.total_cash,
        singleHistoricData.equity
      )
    )
  );
};

export const calculateRoce = (operatingIncomeT, equityT, financialDebtT) => {
  return (
    (Number(operatingIncomeT) / (Number(financialDebtT) + Number(equityT))) *
    100
  ).toFixed(2);
};

export const calculateRoe = (equity, netIncome) => {
  return ((Number(netIncome) / Number(equity)) * 100).toFixed(2);
};

export const getArrayOfRoe = (historicData) => {
  return historicData.map((singleHistoricData) =>
    Number(
      calculateRoe(singleHistoricData.equity, singleHistoricData.net_income)
    )
  );
};

export const getArrayOfRoce = (historicData) => {
  return historicData.map((singleHistoricData) => {
    const financialDebt = calculateFinancialDebt(
      singleHistoricData.total_debt,
      singleHistoricData.long_term_capital_leases,
      singleHistoricData.short_term_capital_leases
    );
    return Number(
      calculateRoce(
        singleHistoricData.operating_income,
        singleHistoricData.equity,
        financialDebt
      )
    );
  });
};

export const getReinvestMentRate = (
  i,
  historicData = undefined,
  arrayOfHistoricFcf = undefined
) => {
  const expansionCapex =
    Math.abs(historicData[i]?.capital_expenditures) -
    historicData[i]?.depreciation_and_amortization;
  const fcfToUse = arrayOfHistoricFcf[i] || historicData[i]?.free_cash_flow;
  const finalCapex = expansionCapex > 0 ? expansionCapex : 0;
  const reinvestmentOnAcquisitions =
    ((Number(historicData[i]?.cash_acquisitions) * 100) / Number(fcfToUse)) *
    -1;
  const reinvestmentOnCapex = (finalCapex * 100) / Number(fcfToUse);

  return (reinvestmentOnAcquisitions + reinvestmentOnCapex).toFixed(2);
};

const getReturnOnEquity = (ttmData) =>
  Number(Number(ttmData.net_income) / Number(ttmData.equity)).toFixed(2);

export const getNetMargin = (ttmData) =>
  Number(
    ((Number(ttmData.net_income) / Number(ttmData.revenue)) * 100).toFixed(2)
  );

export const getConsecutiveDividendGrowthYears = (arrayOfHistoricData) => {
  let consecutiveYears = 0;
  arrayOfHistoricData.forEach((_, i) => {
    if (i === 10 || i === 9) return;
    if (
      arrayOfHistoricData[i + 1]?.dividends_per_share >
      arrayOfHistoricData[i]?.dividends_per_share
    ) {
      consecutiveYears += 1;
    } else {
      consecutiveYears = 0;
    }
  });

  return Number(consecutiveYears);
};

export const getConsecutiveYearsPayingDividend = (arrayOfHistoricData) => {
  let consecutiveYears = 0;
  arrayOfHistoricData.forEach((_, i) => {
    if (i === 10 || i === 9) return;
    if (arrayOfHistoricData[i + 1]?.dividends_per_share > 0) {
      consecutiveYears += 1;
    }
  });
  return Number(consecutiveYears);
};

export const calculateDaysInventoryOutstanding = (
  inventoryT,
  inventoryTminusOne,
  cost_of_goods_sold
) => {
  return (
    ((Number(inventoryT) + Number(inventoryTminusOne)) /
      2 /
      Number(cost_of_goods_sold)) *
    365
  ).toFixed(2);
};
export const calculateDaysPayableOutstanding = (
  accounts_payableT,
  accounts_payableMinusT,
  cost_of_goods_sold
) => {
  return (
    ((Number(accounts_payableT) + Number(accounts_payableMinusT)) /
      2 /
      Number(cost_of_goods_sold)) *
    365
  ).toFixed(2);
};
export const calculateDaysSalesOutstanding = (
  accountsReceivableT,
  accountsReceivableMinusT,
  revenue
) => {
  return (
    ((Number(accountsReceivableT) + Number(accountsReceivableMinusT)) /
      2 /
      Number(revenue)) *
    365
  ).toFixed(2);
};
export const calculateCashConversionCycle = (DIO, DSO, DPO) => {
  return (Number(DIO) + Number(DSO) - Number(DPO)).toFixed(2);
};

export const getUpdatedMetricData = (
  arrayOfHistoricData,
  changeInNetWorkingCapital,
  arrayOfHistoricFcf
) => {
  const ttmData = getLastItemOfArray(arrayOfHistoricData);

  const arrayWithoutTtmData = arrayOfHistoricData.slice(0, -1);

  let tenYearsEpsGrowth = null;
  let tenYearsFcfGrowth = null;
  let tenYearsEquityGrowth = null;
  let tenYearsRevenueGrowth = null;
  let fiveYearsAverageRoic = null;
  let fiveYearsAverageGm = null;
  let fiveYearsAverageOm = null;
  let fiveYearsAverageFcfM = null;
  let fiveYearsAverageReinvestment = null;
  let tenYearsDividendGrowth = null;
  let fiveYearsDividendGrowth = null;
  let shareDilution = null;
  let consecutiveYearsIncreasingDividends = null;
  let consecutiveYearsPayingDividends = null;
  let freeCashFlowMargin = null;
  let ebitdaMargin = null;

  if (arrayOfHistoricData.length > 9) {
    tenYearsEpsGrowth = calculateCagrFromArrayAndGivenYears(
      9,
      arrayWithoutTtmData,
      "earnings_per_share"
    );
    tenYearsFcfGrowth = calculateCagrFromArrayAndGivenYearsNoMetric(
      9,
      calculateLastTenYearsFcf(arrayWithoutTtmData)
    );
    tenYearsEquityGrowth = calculateCagrFromArrayAndGivenYears(
      9,
      arrayWithoutTtmData,
      "equity"
    );
    tenYearsRevenueGrowth = calculateCagrFromArrayAndGivenYears(
      9,
      arrayWithoutTtmData,
      "revenue"
    );
    tenYearsDividendGrowth = calculateCagrFromArrayAndGivenYears(
      9,
      arrayWithoutTtmData,
      "dividends_per_share"
    );
    fiveYearsAverageRoic = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData
    ).averageRoic;
    fiveYearsAverageGm = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData
    ).averageGmMargin;
    fiveYearsAverageOm = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData
    ).averageOmMargin;
    fiveYearsAverageFcfM = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData,
      changeInNetWorkingCapital
    ).averageFcfMargin;
    fiveYearsAverageReinvestment = getAverageFiveYearsReinvestmentRate(
      arrayWithoutTtmData,
      arrayOfHistoricFcf
    );
    consecutiveYearsIncreasingDividends =
      getConsecutiveDividendGrowthYears(arrayOfHistoricData);
    consecutiveYearsPayingDividends =
      getConsecutiveYearsPayingDividend(arrayOfHistoricData);
  }

  if (arrayOfHistoricData.length > 4) {
    fiveYearsAverageRoic = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData
    ).averageRoic;
    fiveYearsAverageGm = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData
    ).averageGmMargin;
    fiveYearsAverageOm = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData
    ).averageOmMargin;
    fiveYearsAverageFcfM = calculateAverageMetricByYears(
      5,
      arrayWithoutTtmData,
      changeInNetWorkingCapital
    ).averageFcfMargin;
    fiveYearsAverageReinvestment = getAverageFiveYearsReinvestmentRate(
      arrayWithoutTtmData,
      arrayOfHistoricFcf
    );
    fiveYearsDividendGrowth = calculateCagrFromArrayAndGivenYears(
      5,
      arrayWithoutTtmData,
      "dividends_per_share"
    );
    shareDilution = calculateCagrFromArrayAndGivenYears(
      4,
      arrayWithoutTtmData,
      "diluted_shares_outstanding"
    );
    ebitdaMargin = calculateEbitdaMargin(
      ttmData.revenue,
      ttmData.operatingIncome,
      ttmData.depreciation_and_amortization
    );
    freeCashFlowMargin = calculateFcfMargin(
      calculateRealFcf(
        ttmData,
        changeInNetWorkingCapital[changeInNetWorkingCapital.length - 1]
      ),
      ttmData?.revenue
    );
  }

  const ttmRoic = calculateRoic(
    ttmData.operating_income,
    ttmData.income_tax_expense,
    ttmData.income_before_taxes,
    ttmData.total_debt,
    ttmData.total_cash,
    ttmData.equity
  );
  const currentRatio = calculateCurrentRatio(ttmData);
  const grossMargin = calculateGrossMargin(ttmData);
  const operatingMargin = calculateOperatingMargin(ttmData);
  const cashConversion = calculateCashConversion(ttmData);
  const netCashPerShare = calculateNetCashPerShare(ttmData);
  const debtToEbitda = calculateNetDebtToEbitda(ttmData);
  const debtToEquity = calculateDebtToEquity(ttmData);
  const returnOnEquity = getReturnOnEquity(ttmData);
  const netMargin = getNetMargin(ttmData);
  let arrayOfPayout = null;
  if (consecutiveYearsIncreasingDividends >= 9) {
    arrayOfPayout = median(
      arrayOfHistoricData
        .map(
          (s) =>
            Number(s.dividends_per_share) /
            (s.free_cash_flow / s.diluted_shares_outstanding)
        )
        .slice(5, 10)
    );
  }

  const arrayOfOperatingMargin = getArrayOfOperatingMargin(arrayWithoutTtmData);
  const arrayOfGrossMargin = getArrayOfGrossMargin(arrayWithoutTtmData);
  const arrayOfRoic = getArrayOfRoce(arrayWithoutTtmData);

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
    tenYearsDividendGrowth,
  };

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
    calculateRoce: calculateNormalizedRoce,
  };
};

export const preparationForHistoricMetrics = (
  stockHistoric,
  arrayOfHistoricData,
  index
) => {
  const {
    cost_of_goods_sold,
    debt_repaid,
    debt_issued,
    depreciation_and_amortization,
    revenue,
    operating_income,
    equity,
    total_debt,
    income_tax_expense,
    income_before_taxes,
    dividends_paid,
    net_income,
    repurchased_shares,
  } = stockHistoric;

  const equityT = arrayOfHistoricData[index]?.equity;
  const equityMinusT = index === 0 ? 0 : arrayOfHistoricData[index - 1]?.equity;

  const inventoryT = arrayOfHistoricData[index]?.inventories;
  const inventoryMinusT =
    index === 0 ? 0 : arrayOfHistoricData[index - 1]?.inventories;

  const accountsPayableT = arrayOfHistoricData[index]?.accounts_payable;
  const accountsPayableMinusT =
    index === 0 ? 0 : arrayOfHistoricData[index - 1]?.accounts_payable;

  const accountsReceivableT = arrayOfHistoricData[index]?.accounts_receivable;
  const accountsReceivableMinusT =
    index === 0 ? 0 : arrayOfHistoricData[index - 1]?.accounts_receivable;

  const operatingIncomeT = arrayOfHistoricData[index]?.operating_income;
  const operatingIncomeMinusT =
    index === 0 ? 0 : arrayOfHistoricData[index - 1]?.operating_income;

  const financialDebtT = calculateFinancialDebt(
    arrayOfHistoricData[index]?.total_debt,
    arrayOfHistoricData[index]?.long_term_capital_leases,
    arrayOfHistoricData[index]?.short_term_capital_leases
  );
  const financialDebtMinusT =
    index === 0
      ? 0
      : calculateFinancialDebt(
          arrayOfHistoricData[index - 1]?.total_debt,
          arrayOfHistoricData[index - 1]?.long_term_capital_leases,
          arrayOfHistoricData[index - 1]?.short_term_capital_leases
        );

  const ROE = calculateNormalizedRoe(
    equityT,
    equityMinusT,
    stockHistoric.net_income,
    index
  );
  const ROCE = calculateNormalizedRoce(
    operatingIncomeT,
    operatingIncomeMinusT,
    equityT,
    equityMinusT,
    financialDebtT,
    financialDebtMinusT,
    index
  );
  const ROIC = calculateRoic(
    stockHistoric.operating_income,
    stockHistoric.income_tax_expense,
    stockHistoric.income_before_taxes,
    stockHistoric.total_debt,
    stockHistoric.total_cash,
    stockHistoric.equity
  );
  const structuralGrowthRoe = calculateStructuralGrowthRoe(
    ROE,
    net_income,
    dividends_paid,
    repurchased_shares
  );
  const structuralGrowthRoic = calculateStructuralGrowthRoic(
    ROIC,
    operating_income,
    income_tax_expense,
    income_before_taxes,
    dividends_paid,
    repurchased_shares
  );
  const structuralGrowtoRoce = calculateStructuralGrowthRoce(
    ROCE,
    operating_income,
    dividends_paid,
    repurchased_shares
  );
  const operatingMargin = calculateOperatingMargin(stockHistoric);
  const debtToEquity = calculateDebtToEquity(total_debt, equity);
  const netMargin = getNetMargin(stockHistoric);
  const grossMargin = calculateGrossMargin(stockHistoric);
  const freeCashFlow = calculateRealFcf(stockHistoric);
  const fcfMargin = calculateFcfMargin(freeCashFlow, revenue);
  const ebitdaMargin = calculateEbitdaMargin(
    revenue,
    operating_income,
    depreciation_and_amortization
  );
  const netCashPerShare = calculateNetCashPerShare(stockHistoric);
  const cashConversion = calculateCashConversion(stockHistoric);
  const netDebtToEbitda = calculateNetDebtToEbitda(stockHistoric);
  const freeCashFlowConversion = calculateFcfConversion(
    freeCashFlow,
    net_income
  );
  const reinvestmentRate = calculateReinvestmentRate(
    net_income,
    dividends_paid,
    repurchased_shares
  );
  const debtCapitalAllocation = calculateDebtCapitalAllocation(
    debt_repaid,
    debt_issued,
    freeCashFlow
  );
  const sharesCapitalAllocation = calculateSharesCapitalAllocation(
    repurchased_shares,
    freeCashFlow
  );
  const dividendsCapitalAllocation = calculateDividendsCapitalAllocation(
    freeCashFlow,
    dividends_paid
  );
  const daysInventoryOutstanding = calculateDaysInventoryOutstanding(
    inventoryT,
    inventoryMinusT,
    cost_of_goods_sold
  );
  const daysSalesOutstanding = calculateDaysSalesOutstanding(
    accountsReceivableT,
    accountsReceivableMinusT,
    revenue
  );
  const daysPayableOutstanding = calculateDaysPayableOutstanding(
    accountsPayableT,
    accountsPayableMinusT,
    cost_of_goods_sold
  );
  const cashConversionCycle = calculateCashConversionCycle(
    daysInventoryOutstanding,
    daysSalesOutstanding,
    daysPayableOutstanding
  );

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
    daysInventoryOutstanding,
    dividendsCapitalAllocation,
    daysSalesOutstanding,
    daysPayableOutstanding,
    cashConversionCycle,
  };
};
