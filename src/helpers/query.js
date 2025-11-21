import pool from '../database/database.js'
import { DatabaseError } from './customErrors.js'

const query = async (sql, params = []) => {
  const start = Date.now()

  try {
    const result = await pool.query(sql, params)
    const timeLapsed = Date.now() - start
    if (!process.NODE_ENV === 'test') {
      console.log('Time Lapsed since SQL call: ' + timeLapsed + 'ms')
    }
    return result.rows
  } catch (error) {
    console.log(error)
    if (error.code === '23505') throw new DatabaseError('You already have this stock', 400)
    throw new DatabaseError('Something went wrong')
  }
}

export default query
