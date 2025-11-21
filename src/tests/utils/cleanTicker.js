import pool from '../../database/database'

export const cleanMockupTicker = () => {
  pool.query("DELETE from company_info WHERE ticker='TEST'")
}
