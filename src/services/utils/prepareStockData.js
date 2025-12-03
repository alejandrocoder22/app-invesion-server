import { calculateChangeInWorkingCapital, calculateFCFF, calculateRealFcf, calculateSimpleFcf, calculateWorkingCapital, getReinvestMentRate } from '../../helpers/calculateMetrics.js'

export const prepareCashFlowData = (stockDataToUpdate) => {
  return stockDataToUpdate.map((stockInfo, i) => {
    const isTtm = i === 10
    const isTtmLastYear = i === 10 && stockInfo.revenue === stockDataToUpdate[9].revenue
    const prevIndex = isTtmLastYear ? i - 1 : i
    const workingCapital =
       isTtm
         ? calculateWorkingCapital(stockDataToUpdate[prevIndex].accounts_receivable, stockDataToUpdate[prevIndex].inventories, stockDataToUpdate[prevIndex].prepaid_expenses, stockDataToUpdate[prevIndex].accounts_payable, stockDataToUpdate[prevIndex].accrued_expenses, stockDataToUpdate[prevIndex].total_unearned_revenues)
         : calculateWorkingCapital(stockInfo.accounts_receivable, stockInfo.inventories, stockInfo.prepaid_expenses, stockInfo.accounts_payable, stockInfo.accrued_expenses, stockInfo.total_unearned_revenues)

    const changeInWorkingCapital = calculateChangeInWorkingCapital(prevIndex, stockDataToUpdate)

    const FCFE = calculateRealFcf(stockInfo, changeInWorkingCapital)
    const FCFF = calculateFCFF(stockInfo, changeInWorkingCapital)
    const simpleFcf = calculateSimpleFcf(stockInfo)
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
      free_cash_flow: FCFE,
      free_cash_flow_to_firm: FCFF,
      reinvestment_rate: isFinite(getReinvestMentRate(i, stockDataToUpdate, FCFE)) ? getReinvestMentRate(i, stockDataToUpdate, FCFE) : 0,
      simple_free_cash_flow: simpleFcf,
      net_debt_issued: netDebtIssued,
      net_repurchased_shares: netRepurchasedShares
    }
  })
}
