
export const getEmptyDescriptionsSql = `
SELECT  
company_id,
company_name,
description

FROM company_info

WHERE description = '' OR description IS NULL
`

export const getHistoricMetricsSql = `
  SELECT * FROM (
    SELECT 
      historic_metric_id,
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
      free_cash_flow_conversion,
      ebitda_margin,
      net_cash_per_share,
      cash_conversion,
      net_debt_ebitda,
      reinvestment_rate,
      debt_capital_allocation,
      shares_capital_allocation,
      dividends_capital_allocation,
      days_inventory_outstanding,
      days_sales_outstanding,
      days_payable_outstanding,
      cash_conversion_cycle,
      created_at,
      updated_at,
      ROW_NUMBER() OVER (
        PARTITION BY period_type 
        ORDER BY fiscal_year DESC NULLS FIRST
      ) as rn
    FROM historic_metrics
    WHERE company_id = $1
  ) ranked_data
  WHERE (period_type = 'annual' AND rn <= 10)
     OR (period_type = 'ttm' AND rn = 1)
  ORDER BY 
    CASE WHEN fiscal_year IS NULL THEN 9999 ELSE fiscal_year END ASC,
    period_type ASC;
`

export const getAllStocskSql =
    `
SELECT 
    ci.company_id,
    ci.ticker,
    ci.price,
    ci.sector,
    ci.country,
    ci.industry,
    ci.default_estimated_price_in_five_years,
    ci.created_at AS company_created_at,
    ci.updated_at AS company_updated_at,
    ci.default_dcf_estimated_price,
    ci.use_simple_fcf,
    
    -- Income Statement Data
    is_.net_income,
    is_.earnings_per_share,
    is_.dividends_per_share,
    is_.diluted_shares_outstanding,
    
    -- Balance Sheet Data
    bs.total_cash,
    bs.equity,
    bs.total_debt,
    
    -- Cash Flow Statement Data
    cfs.free_cash_flow_to_equity,
    cfs.reported_change_in_working_capital,
    
    -- Company Metrics Data
    cm.debt_to_equity,
    cm.debt_to_ebitda,
    cm.current_ratio,
    cm.return_on_invested_capital,
    cm.gross_margin,
    cm.operating_margin,
    cm.net_cash_per_share,
    cm.cash_conversion,
    cm.average_five_years_roic,
    cm.average_five_years_gross_margin,
    cm.average_five_years_operating_margin,
    cm.average_five_years_free_cash_flow_margin,
    cm.five_years_share_dilution,
    cm.ten_years_revenue_cagr,
    cm.ten_years_equity_cagr,
    cm.ten_years_free_cash_flow_cagr,
    cm.ten_years_earnings_per_share_cagr,
    cm.average_five_years_reinvestment_rate,
    cm.score,
    cm.consecutive_years_increasing_dividends,
    cm.consecutive_years_paying_dividends,
    cm.five_years_dividends_cagr,
    cm.forward_earnings_per_share

FROM 
    company_info ci

    LEFT JOIN (
        SELECT * 
        FROM income_statements 
        WHERE period_type = 'ttm'
    ) is_ 
        ON ci.company_id = is_.company_id

    LEFT JOIN (
        SELECT * 
        FROM balance_sheets 
        WHERE period_type = 'ttm'
    ) bs 
        ON ci.company_id = bs.company_id
  
    LEFT JOIN (
        SELECT * 
        FROM cash_flow_statements 
        WHERE period_type = 'ttm'
    ) cfs 
        ON ci.company_id = cfs.company_id
         
    LEFT JOIN company_metrics cm 
        ON ci.company_id = cm.company_id

ORDER BY 
    ci.company_id;


    `

export const getTtmDataByCompanyId = `

SELECT 
    ci.ticker,
    ci.company_id,
    i.fiscal_year AS year,
    i.revenue,
    i.net_income,
    i.earnings_per_share,
    i.cost_of_goods_sold,
    i.operating_income,
    i.dividends_per_share,
    i.diluted_shares_outstanding,
    i.interest_expense,
    i.income_before_taxes,
    i.income_tax_expense,
    i.nopat,
    b.current_assets,
    b.current_liabilities,
    b.goodwill,
    b.total_assets,
    b.total_cash,
    b.other_intangibles,
    b.equity,
    b.inventories,
    b.short_term_debt,
    b.long_term_debt,
    b.total_debt,
    b.long_term_capital_leases,
    b.short_term_capital_leases,
    b.unearned_revenues,
    b.unearned_revenues_non_current,
    b.accounts_receivable,
    b.accounts_payable,
    b.financial_debt,
    c.operating_cash_flow,
    c.capital_expenditures,
    c.dividends_paid,
    c.debt_issued,
    c.debt_repaid,
    c.cash_acquisitions,
    c.stocks_compensations,
    c.repurchased_shares,
    c.net_repurchased_shares,
    c.change_in_working_capital,
    c.reinvestment_rate,
    c.working_capital,
    c.depreciation_and_amortization,
    c.free_cash_flow_to_equity,
    c.simple_free_cash_flow,
    c.sale_of_assets,
    c.reported_change_in_working_capital,
    c.net_debt_issued,
    c.issued_shares
FROM 
    company_info ci
    JOIN income_statements i ON ci.company_id = i.company_id AND i.period_type = 'ttm'
    JOIN balance_sheets b ON ci.company_id = b.company_id AND b.period_type = 'ttm'
    JOIN cash_flow_statements c ON ci.company_id = c.company_id AND c.period_type = 'ttm'
WHERE 
    ci.company_id = $1;



`

export const getAllOwnedTickersSql = `

SELECT 
    ci.company_id,
    ci.ticker,

    ucr.company_id

FROM 
    company_info ci
    JOIN user_company_radar ucr 
        ON ci.company_id = ucr.company_id
        AND ucr.user_id = $1  
ORDER BY 
    ci.company_id;

`

export const getAllOwnedStocskSql = `

-- Consulta principal para obtener los datos del último año
SELECT 
    ci.company_id,
    ci.ticker,
    ci.price,
    ci.currency,
    ci.sector,
    ci.country,
    ci.industry,
    ci.default_estimated_price_in_five_years,
    ci.default_dcf_estimated_price,
    ci.use_simple_fcf,
    ci.dividend_months,
    ci.created_at AS company_created_at,
    ci.updated_at AS company_updated_at,
    
    -- Income Statement Data
    is_.net_income,
    is_.earnings_per_share,
    is_.dividends_per_share,
    is_.diluted_shares_outstanding,
    is_.interest_expense,
    is_.income_before_taxes,
    is_.income_tax_expense,
    
    -- BalanceSheet Data
    bs.current_assets,
    bs.current_liabilities,
    bs.total_cash,
    bs.equity,
    bs.inventories,
    bs.total_debt,
    
    -- Cash Flow Statement Data
    cfs.operating_cash_flow,
    cfs.capital_expenditures,
    cfs.dividends_paid,
    cfs.debt_issued,
    cfs.debt_repaid,
    cfs.reinvestment_rate,
    cfs.free_cash_flow_to_equity,

    
    -- Company Metrics Data
    cm.debt_to_equity,
    cm.debt_to_ebitda,
    cm.current_ratio,
    cm.return_on_equity,
    cm.return_on_invested_capital,
    cm.gross_margin,
    cm.operating_margin,
    cm.net_margin,
    cm.net_cash_per_share,
    cm.cash_conversion,
    cm.average_five_years_roic,
    cm.average_five_years_gross_margin,
    cm.average_five_years_operating_margin,
    cm.average_five_years_free_cash_flow_margin,
    cm.five_years_share_dilution,
    cm.ten_years_revenue_cagr,
    cm.ten_years_equity_cagr,
    cm.ten_years_free_cash_flow_cagr,
    cm.ten_years_earnings_per_share_cagr,
    cm.score,
    cm.consecutive_years_increasing_dividends,
    cm.consecutive_years_paying_dividends,
    cm.five_years_dividends_cagr,
    cm.average_five_years_reinvestment_rate,
    cm.forward_earnings_per_share,


    -- shares_owned
    ucr.shares_owned,
    ucr.user_estimated_price_in_five_years,
    ucr.user_dcf_estimated_price

FROM 
    company_info ci
    JOIN user_company_radar ucr 
        ON ci.company_id = ucr.company_id
        AND ucr.user_id = $1  
    LEFT JOIN income_statements is_ 
        ON ci.company_id = is_.company_id
        AND is_.period_type = 'ttm'
    LEFT JOIN balance_sheets bs 
        ON ci.company_id = bs.company_id
        AND bs.period_type = 'ttm'
    LEFT JOIN cash_flow_statements cfs 
        ON ci.company_id = cfs.company_id
        AND cfs.period_type = 'ttm'
    LEFT JOIN company_metrics cm 
        ON ci.company_id = cm.company_id
ORDER BY 
    ci.company_id;



`

export const updateStockMetricsSql = `UPDATE company_metrics
  SET
    debtToFcf = $1, 
    currentRatio = $2, 
    tenYearsEpsGrowth = $3, 
    tenYearsFcfGrowth = $4, 
    tenYearsRevenueGrowth = $5, 
    tenYearsEquityGrowth = $6, 
    ttmRoic = $7,
    shareDilution = $8,
    grossMargin = $9, 
    operatingMargin = $10,
    cashConversion = $11,
    averageFiveYearsRoic = $12, 
    averageFiveYearsGrossMargin = $13, 
    averageFiveYearsOperatingMargin = $14, 
    score = $15, 
    netCashPerShare = $16, 
    fcf = $17,
    averageFiveYearsFcfMargin = $19,
    normalisedFcf = $20,
    averagefiveyearsreinvestmentrate= $21
    
    
    WHERE company_id = $18
  `

export const createIncomeStatementSql = `
INSERT INTO income_statements 
(
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
nopat
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)

`

export const createBalancesheetSql = `
INSERT INTO balance_sheets  
(
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
period_type
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)

`

export const createCashFlowStatementSql = `
INSERT INTO cash_flow_statements  
(
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
free_cash_flow_to_equity,
period_type,
simple_free_cash_flow,
reported_change_in_working_capital,
net_debt_issued,
net_repurchased_shares,
issued_shares
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, $16,$17,$18,$19,$20,$21)

`

export const createCashFlowStatemenReitSql = `
INSERT INTO cash_flow_statements  
(
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
free_cash_flow_to_equity,
period_type,
sale_of_assets
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, $16, $17)

`

export const createMetricsSql = `INSERT INTO company_metrics
  (
company_id,
debt_to_equity,
debt_to_ebitda,
current_ratio,
return_on_equity,
return_on_invested_capital,
gross_margin,
operating_margin,
net_margin,
net_cash_per_share,
cash_conversion,
average_five_years_roic,
average_five_years_gross_margin,
average_five_years_operating_margin,
average_five_years_free_cash_flow_margin,
five_years_share_dilution,
ten_years_revenue_cagr,
ten_years_equity_cagr,
ten_years_free_cash_flow_cagr,
ten_years_earnings_per_share_cagr,
average_five_years_reinvestment_rate,
score,
consecutive_years_increasing_dividends,
consecutive_years_paying_dividends,
five_years_dividends_cagr,
ten_years_dividends_cagr,
free_cash_flow_margin,
ebitda_margin

  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
  `

export const updateMetricsSql = `
UPDATE company_metrics
SET
    company_id = $1,
    debt_to_equity = $2,
    debt_to_ebitda = $3,
    current_ratio = $4,
    return_on_equity = $5,
    return_on_invested_capital = $6,
    gross_margin = $7,
    operating_margin = $8,
    net_margin = $9,
    net_cash_per_share = $10,
    cash_conversion = $11,
    average_five_years_roic = $12,
    average_five_years_gross_margin = $13,
    average_five_years_operating_margin = $14,
    average_five_years_free_cash_flow_margin = $15,
    five_years_share_dilution = $16,
    ten_years_revenue_cagr = $17,
    ten_years_equity_cagr = $18,
    ten_years_free_cash_flow_cagr = $19,
    ten_years_earnings_per_share_cagr = $20,
    average_five_years_reinvestment_rate = $21,
    score = $22,
    consecutive_years_increasing_dividends = $23,
    five_years_dividends_cagr = $24,
    ten_years_dividends_cagr = $25,
    consecutive_years_paying_dividends = $26,
    free_cash_flow_margin = $27,
    ebitda_margin = $28
WHERE company_id = $1;

  `
export const updateIncomeStatementSql = `

UPDATE income_statements
SET 
    revenue = $3,
    net_income = $4,
    earnings_per_share = $5,
    cost_of_goods_sold = $6,
    operating_income = $7,
    dividends_per_share = $8,
    diluted_shares_outstanding = $9,
    interest_expense = $10,
    income_before_taxes = $11,
    income_tax_expense = $12,
    period_type = $13,
    nopat = $14,
    updated_at = NOW(),
    interest_income = $15,
    tax_rate = $16
WHERE company_id = $1 AND fiscal_year = $2


`

export const updateIncomeStatementTtmSql = `

UPDATE income_statements
SET 
    revenue = $2,
    net_income = $3,
    earnings_per_share = $4,
    cost_of_goods_sold = $5,
    operating_income = $6,
    dividends_per_share = $7,
    diluted_shares_outstanding = $8,
    interest_expense = $9,
    income_before_taxes = $10,
    income_tax_expense = $11,
    period_type = $12,
    nopat = $13,
    updated_at = NOW(),
    interest_income = $14,
    tax_rate = $15
 WHERE company_id = $1 AND period_type= $12


`

export const updateBalanceSheetSql = `
UPDATE balance_sheets
SET 
    current_assets = $3,
    current_liabilities = $4,
    total_cash = $5,
    equity = $6,
    inventories = $7,
    short_term_debt = $8,
    long_term_debt = $9,
    total_debt = $10,
    long_term_capital_leases = $11,
    short_term_capital_leases = $12,
    unearned_revenues = $13,
    accounts_receivable = $14,
    accounts_payable = $15,
    period_type = $16,
    unearned_revenues_non_current = $17,
    goodwill = $18,
    total_assets = $19,
    other_intangibles = $20,
    updated_at = NOW(),
    financial_debt = $21,
    cost_of_debt = $22,
    prepaid_expenses = $23,
    accrued_expenses = $24,
    total_unearned_revenues = $25
WHERE company_id = $1 AND fiscal_year = $2

`

export const updateBalanceSheetSqlTTM = `
UPDATE balance_sheets
SET 
    current_assets = $2,
    current_liabilities = $3,
    total_cash = $4,
    equity = $5,
    inventories = $6,
    short_term_debt = $7,
    long_term_debt = $8,
    total_debt = $9,
    long_term_capital_leases = $10,
    short_term_capital_leases = $11,
    unearned_revenues = $12,
    accounts_receivable = $13,
    accounts_payable = $14,
    unearned_revenues_non_current = $15,
    goodwill = $16,
    total_assets = $17,
    other_intangibles = $18,
    updated_at = NOW(),
    financial_debt = $19,
    cost_of_debt = $20,
    prepaid_expenses = $21,
    accrued_expenses = $22,
    total_unearned_revenues = $23
WHERE company_id = $1 AND period_type = 'ttm'

`

export const updateCashFlowStatementReitSql = `

UPDATE cash_flow_statements
SET 
    operating_cash_flow = $3,
    dividends_paid = $4,
    debt_issued = $5,
    debt_repaid = $6,
    stocks_compensations = $7,
    repurchased_shares = $8,
    depreciation_and_amortization = $9,
    free_cash_flow = $10,
    period_type = $11,
    sale_of_assets = $12,
    updated_at = NOW()
WHERE company_id = $1 AND fiscal_year = $2
`

export const updateTtmReitCashFlowStatementSql = `

UPDATE cash_flow_statements
SET 
    operating_cash_flow = $2,
    dividends_paid = $3,
    debt_issued = $4,
    debt_repaid = $5,
    stocks_compensations = $6,
    repurchased_shares = $7,
    depreciation_and_amortization = $8,
    free_cash_flow = $9,
    period_type = $10,
    sale_of_assets = $11,
    updated_at = NOW()
WHERE company_id = $1 AND period_type = $10
`

export const updateCashFlowStatementTtmSql = `

UPDATE cash_flow_statements
SET 
operating_cash_flow = $2,
capital_expenditures = $3,
dividends_paid = $4,
debt_issued = $5,
debt_repaid = $6,
cash_acquisitions = $7,
stocks_compensations = $8,
repurchased_shares = $9,
change_in_working_capital = $10,
reinvestment_rate = $11,
working_capital = $12,
depreciation_and_amortization = $13,
free_cash_flow_to_equity = $14,
simple_free_cash_flow = $16,
updated_at = NOW()
WHERE company_id = $1 AND period_type = $15
`
