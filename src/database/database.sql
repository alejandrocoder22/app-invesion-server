
ALTER TABLE cash_flow_statements RENAME free_cash_flow to free_cash_flow_to_equity;
ALTER TABLE cash_flow_statements ADD COLUMN  free_cash_flow_to_firm NUMERIC(20,4);


CREATE DATABASE invesion_app;

CREATE TABLE company_info (
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    price NUMERIC(10,4)
    company_name VARCHAR(255),
    description TEXT,
    sector VARCHAR(150),
    country VARCHAR(50),
    industry VARCHAR(75),
    currency VARCHAR(10),
    thesis TEXT,
    default_estimated_price_in_five_years NUMERIC(10,4),
    default_dcf_estimated_price NUMERIC(10,4),
    dividend_months INTEGER[] DEFAULT '{}',
    use_simple_fcf BOOLEAN DEFAULT FALSE;
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE key_questions (
    question_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    income_sources TEXT,
    sector_perspectives TEXT,
    moat_and_competitors TEXT,
    ceo_information TEXT,
    recession_resistance_cyclicality TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

CREATE TABLE income_statements (
    historic_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    fiscal_year INT,
    period_type VARCHAR(10) CHECK (period_type IN ('annual', 'ttm')) DEFAULT 'annual';
    revenue NUMERIC(20,4) NOT NULL,
    nopat NUMERIC(20,4) NOT NULL,
    net_income NUMERIC(20,4) NOT NULL,
    earnings_per_share NUMERIC(20,4),
    cost_of_goods_sold NUMERIC(20,4) ,
    operating_income NUMERIC(20,4) ,
    dividends_per_share NUMERIC(20,4) NOT NULL,
    diluted_shares_outstanding NUMERIC(20,4) NOT NULL,
    interest_expense NUMERIC(20,4),
    interest_income NUMERIC(20,4),
    income_before_taxes NUMERIC(20,4),
    income_tax_expense NUMERIC(20,4),
    tax_rate NUMERIC(12,2),
    goodwill NUMERIC(20,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, fiscal_year)
    
);


CREATE TABLE balance_sheets (
    historic_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    fiscal_year INT,
    period_type VARCHAR(10) CHECK (period_type IN ('annual', 'ttm')) DEFAULT 'annual';
    current_assets NUMERIC(20,4),
    total_assets NUMERIC(20,4),
    total_liabilities NUMERIC(20,4),
    total_real_estate_assets NUMERIC(20,4),
    current_liabilities NUMERIC(20,4),
    total_cash NUMERIC(20,4),
    equity NUMERIC(20,4) NOT NULL,
    inventories NUMERIC(20,4),
    prepaid_expenses NUMERIC(20,4),
    short_term_debt NUMERIC(20,4),
    accrued_expenses NUMERIC(20,4);
    long_term_debt NUMERIC(20,4),
    total_debt NUMERIC(20,4),
    financial_debt NUMERIC(20,4),
    long_term_capital_leases NUMERIC(20,4),
    short_term_capital_leases NUMERIC(20,4),
    unearned_revenues NUMERIC(20,4),
    unearned_revenues_non_current NUMERIC(20,4),
    total_unearned_revenues NUMERIC(20,4),
    accounts_receivable NUMERIC(20,4),
    accounts_payable NUMERIC(20,4),
    other_intangibles NUMERIC(20,4),
    cost_of_debt NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, fiscal_year)
);


CREATE TABLE cash_flow_statements (
    historic_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    fiscal_year INT,
    period_type VARCHAR(10) CHECK (period_type IN ('annual', 'ttm')) DEFAULT 'annual';
    operating_cash_flow NUMERIC(20,4) ,
    capital_expenditures NUMERIC(20,4),
    dividends_paid NUMERIC(20,4),
    debt_issued NUMERIC(20,4),
    debt_repaid NUMERIC(20,4),
    cash_acquisitions NUMERIC(20,4),
    stocks_compensations NUMERIC(20,4),
    repurchased_shares NUMERIC(20,4),
    issued_shares NUMERIC(20,4),
    net_repurchased_shares NUMERIC(20,4),
    change_in_working_capital NUMERIC(12,4),
    reported_change_in_working_capital NUMERIC(12,4),
    reinvestment_rate NUMERIC(20,4),
    working_capital NUMERIC(20,4), 
    depreciation_and_amortization NUMERIC(20,4), 
    free_cash_flow NUMERIC(20,4) NOT NULL,
    simple_free_cash_flow NUMERIC(20,4),
    net_debt_issued NUMERIC(20,4),
    sale_of_assets NUMERIC(20,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, fiscal_year)
);

CREATE TABLE historic_metrics (
    historic_metric_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    fiscal_year INT,
    period_type VARCHAR(10) CHECK (period_type IN ('annual', 'ttm')) DEFAULT 'annual',
    return_on_equity NUMERIC(10,2),
    roe_structural_growth NUMERIC(10,2),
    return_on_invested_capital NUMERIC(10,2),
    roic_structural_growth NUMERIC(10,2),
    return_on_capital_employed NUMERIC(10,2),
    roce_structural_growth NUMERIC(10,2),
    operating_margin NUMERIC(10,2),
    debt_to_equity NUMERIC(10,2),
    net_margin NUMERIC(10,2),
    gross_margin NUMERIC(10,2),
    free_cash_flow_margin NUMERIC(10,2),
    free_cash_flow_conversion NUMERIC(10,2),
    ebitda_margin NUMERIC(10,2),
    net_cash_per_share NUMERIC(10,2),
    cash_conversion NUMERIC(10,2),
    net_debt_ebitda NUMERIC(10,2),
    reinvestment_rate NUMERIC(10,2),
    debt_capital_allocation NUMERIC(10,2),
    shares_capital_allocation NUMERIC(10,2),
    dividends_capital_allocation NUMERIC(10,2),

    days_inventory_outstanding NUMERIC(22,4),
    days_sales_outstanding NUMERIC(22,4),
    days_payable_outstanding NUMERIC(22,4),
    cash_conversion_cycle NUMERIC(22,4),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (company_id, fiscal_year, period_type)
);


CREATE TABLE company_metrics (
    metric_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    debt_to_equity NUMERIC(10,2),
    debt_to_ebitda NUMERIC(10,2),
    current_ratio NUMERIC(10,2),
    return_on_equity NUMERIC(10,2),
    return_on_invested_capital NUMERIC(10,2),
    forward_earnings_per_share NUMERIC (10,2),
    gross_margin NUMERIC(10,2),
    operating_margin NUMERIC(10,2),
    net_margin NUMERIC(10,2),
    net_cash_per_share NUMERIC(10,2),
    cash_conversion NUMERIC(10,2),
    free_cash_flow_margin NUMERIC(10,2),
    ebitda_margin NUMERIC(10,2),
    price_to_earnings_ratio NUMERIC(10,2),
    dividend_yield NUMERIC(10,2),
    consecutive_years_increasing_dividends NUMERIC (10,2),
    consecutive_years_paying_dividends NUMERIC (10,2),
    average_five_years_roic NUMERIC(10,2),
    average_five_years_gross_margin NUMERIC(10,2),
    average_five_years_operating_margin NUMERIC(10,2),
    average_five_years_free_cash_flow_margin NUMERIC(10,2),
    average_five_years_reinvestment_rate NUMERIC(10,2),
    five_years_share_dilution NUMERIC(10,2),
    five_years_dividends_cagr NUMERIC(10,2),
    ten_years_dividends_cagr NUMERIC(10,2),
    ten_years_share_dilution NUMERIC(10,2),
    ten_years_revenue_cagr NUMERIC(10,2),
    ten_years_equity_cagr NUMERIC(10,2),
    ten_years_free_cash_flow_cagr NUMERIC(10,2),
    ten_years_earnings_per_share_cagr NUMERIC(10,2),
    ten_years_operating_income_cagr NUMERIC(10,2),
    score NUMERIC(5,2)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);


CREATE TABLE stock_estimations (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
  year INT NOT NULL,
  revenue NUMERIC(12, 2),
  operating_income NUMERIC(12, 2),
  interest_expense NUMERIC(12, 2),
  interest_income NUMERIC(12, 2),
  accounts_receivable NUMERIC(12, 2),
  inventories NUMERIC(12, 2),
  prepaid_expenses NUMERIC(12, 2),
  accounts_payable NUMERIC(12, 2),
  accrued_expenses NUMERIC(12, 2),
  total_unearned_revenues NUMERIC(12, 2),
  capital_expenditures NUMERIC(12, 2),
  depreciation_and_amortization NUMERIC(12, 2),
  reported_change_in_working_capital NUMERIC(12, 2),
  diluted_shares_outstanding NUMERIC(12, 2),
  dividends_per_share NUMERIC(12, 2),
  net_income NUMERIC(12, 2),
  sale_of_assets NUMERIC(12, 2),
  simple_free_cash_flow NUMERIC(12, 2),
  tax_rate NUMERIC(12,2)
  cost_of_debt NUMERIC(12, 2), 
  net_debt_issued NUMERIC(12, 2),
  equity NUMERIC(12, 2),
  net_repurchased_shares NUMERIC(12, 2),
  discount NUMERIC(12, 2),
  ebit_multiple NUMERIC(12, 2),
  fair_multiple NUMERIC(12, 2),
  midterm_growth NUMERIC(12, 2),
  roe_mid NUMERIC(12, 2),
  terminal_rate NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, year)
);


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_company_radar (
    radar_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    company_id INT NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    shares_owned NUMERIC(20,4) DEFAULT 0,
    user_estimated_price_in_five_years NUMERIC(10,4),
    user_dcf_estimated_price NUMERIC(10,4),
    UNIQUE(user_id, company_id)
);

CREATE TABLE forex (
    forex_id SERIAL PRIMARY KEY,
    symbol VARCHAR(25),
    price NUMERIC(10,5)
);

CREATE TABLE subscription_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    billing_cycle VARCHAR(10) CHECK (billing_cycle IN ('monthly', 'annual')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES subscription_plans(plan_id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'canceled', 'expired')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    subscription_id INT NOT NULL REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(50), -- Ejemplo: 'credit_card', 'paypal'
    status VARCHAR(20) CHECK (status IN ('completed', 'failed', 'pending')) DEFAULT 'completed',
    transaction_id VARCHAR(100), -- ID de la transacción proporcionado por el procesador de pagos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE,
    invoice_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('paid', 'unpaid', 'overdue')) DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_error_logs (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),              
  error_message TEXT,            
  api_response JSONB,              
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);




-- Índices para las tablas históricas
CREATE INDEX idx_income_statements_company ON income_statements(company_id);
CREATE INDEX idx_balance_sheets_company ON balance_sheets(company_id);
CREATE INDEX idx_cash_flow_statements_company ON cash_flow_statements(company_id);

-- Índices para la relación de usuarios y compañías
CREATE INDEX idx_user_company_radar_user ON user_company_radar(user_id);
CREATE INDEX idx_user_company_radar_company ON user_company_radar(company_id);

-- Índice para las métricas
CREATE INDEX idx_company_metrics_company ON company_metrics(company_id);


