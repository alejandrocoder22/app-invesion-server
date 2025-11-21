import pg from 'pg'

const pool = new pg.Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: 'invesion_app',
  host: 'localhost',
  port: 5432,
  idleTimeoutMillis: 30000
})

export default pool
