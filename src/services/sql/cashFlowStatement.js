export const cashFlowStatementsQueries = {

  update: `
UPDATE cash_flow_statements
SET 
operating_cash_flow = $3,
capital_expenditures = $4,
dividends_paid = $5,
debt_issued = $6,
debt_repaid = $7,
cash_acquisitions = $8,
stocks_compensations = $9,
repurchased_shares = $10,
change_in_working_capital = $11,
reinvestment_rate = $12,
working_capital = $13,
depreciation_and_amortization = $14,
free_cash_flow_to_equity = $15,
period_type = $16,
updated_at = NOW(),
simple_free_cash_flow = $17,
reported_change_in_working_capital = $18,
net_debt_issued = $19,
issued_shares = $20,
net_repurchased_shares = $21,
free_cash_flow_to_firm = $22,
other_operating_activities = $23
WHERE company_id = $1 AND fiscal_year = $2
    `,
  updateTtm: `
UPDATE cash_flow_statements
SET 
    operating_cash_flow = $3,
    fiscal_year = $2,
    capital_expenditures = $4,
    dividends_paid = $5,
    debt_issued = $6,
    debt_repaid = $7,
    cash_acquisitions = $8,
    stocks_compensations = $9,
    repurchased_shares = $10,
    change_in_working_capital = $11,
    reinvestment_rate = $12,
    working_capital = $13,
    depreciation_and_amortization = $14,
    free_cash_flow_to_equity = $15,
    period_type = $16,
    simple_free_cash_flow = $17,
    reported_change_in_working_capital = $18,
    net_debt_issued = $19,
    issued_shares = $20,
    net_repurchased_shares = $21,
    free_cash_flow_to_firm = $22,
    other_operating_activities = $23
    updated_at = NOW()
WHERE company_id = $1 AND period_type = $16
`
}
