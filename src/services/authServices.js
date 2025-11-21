import pool from '../database/database.js'
import { DatabaseError } from '../helpers/customErrors.js'
import query from '../helpers/query.js'

const getUserFromDatabaseByUsername = async (loginData) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE username= $1', [loginData.username])

    if (user.rows.length === 0) return false

    return user.rows[0]
  } catch (error) {
    throw new DatabaseError('Error selecting from database', 400)
  }
}

export const createUser = async (loginData) => {
  const { username, password, email } = loginData

  await query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password])
}

export default {
  getUserFromDatabaseByUsername,
  createUser
}
