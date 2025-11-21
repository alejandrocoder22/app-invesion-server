import { calculateChangeInWorkingCapital, calculateRealFcf, calculateWorkingCapital, getReinvestMentRate } from '../../helpers/calculateMetrics.js'

export const prepareCashFlowData = (stockDataToUpdate) => {
  return stockDataToUpdate.map((stockInfo, i) => {
    const isTtm = i === 10
    const isTtmLastYear = i === 10 && stockInfo.revenue === stockDataToUpdate[9].revenue
    const prevIndex = isTtmLastYear ? i - 1 : i
    const changeInWorkingCapital = calculateChangeInWorkingCapital(prevIndex, stockDataToUpdate)

    const workingCapital =
       isTtm
         ? calculateWorkingCapital(stockDataToUpdate[prevIndex].inventories, stockDataToUpdate[prevIndex].accounts_payable, stockDataToUpdate[prevIndex].accounts_receivable, stockDataToUpdate[prevIndex].unearned_revenues, stockDataToUpdate[prevIndex].unearned_revenues_non_current)
         : calculateWorkingCapital(stockInfo.inventories, stockInfo.accounts_payable, stockInfo.accounts_receivable, stockInfo.unearned_revenues, stockInfo.unearned_revenues_non_current)

    const fcf = calculateRealFcf(stockInfo, changeInWorkingCapital)
    const maintenanceCapexPercentage = Number((stockInfo?.depreciation_and_amortization) / Number((stockInfo?.capital_expenditures)))
    const maintenanceCapexNormalised = maintenanceCapexPercentage < -1 ? -1 : maintenanceCapexPercentage
    const maintenanceCapex = (Number(stockInfo.capital_expenditures) * maintenanceCapexNormalised).toFixed(2)
    const debtIssued = Number(stockInfo.debt_issued || 0)
    const debtRepaid = Number(stockInfo.debt_repaid || 0)
    const repurchasedShares = Number(stockInfo.repurchased_shares || 0)
    const issuedShares = Number(stockInfo.issued_shares || 0)
    const netRepurchasedShares = repurchasedShares + issuedShares
    const netDebtIssued = (debtIssued + debtRepaid).toFixed(2)
    return {
      ...stockInfo,
      period_type: isTtm ? 'ttm' : 'annual',
      change_in_working_capital: changeInWorkingCapital,
      working_capital: workingCapital,
      free_cash_flow: fcf,
      reinvestment_rate: isFinite(getReinvestMentRate(i, stockDataToUpdate, fcf)) ? getReinvestMentRate(i, stockDataToUpdate, fcf) : 0,
      simple_free_cash_flow: Number(stockInfo.operating_cash_flow) - Number(maintenanceCapex),
      net_debt_issued: netDebtIssued,
      net_repurchased_shares: netRepurchasedShares
    }
  })
}
