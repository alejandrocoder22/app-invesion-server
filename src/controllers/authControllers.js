import { handleError, handleSuccess } from '../utils/responsesHandlers.js'
import { generateToken } from '../helpers/generateToken.js'
import authServices from '../services/authServices.js'
import { authValidations } from '../helpers/authValidations.js'
import bcrypt from 'bcrypt'

const login = async (req, res, next) => {
  const loginData = req.body
  const { username, password } = loginData
  try {
    authValidations(password, username)

    const userFromDatabase = await authServices.getUserFromDatabaseByUsername(loginData)

    // Hash falso para comparar si no existe el usuario
    const passwordHash = userFromDatabase
      ? userFromDatabase.password
      : '$2b$10$fakehashfakehashfakehashfakehashfakehashfakehashfakeh'

    // Evitar ataques de timing attack que lekeen si existe usuario

    const isPasswordMatch = await bcrypt.compare(password, passwordHash)

    if (!userFromDatabase || !isPasswordMatch) {
      return handleError(res, 400, 'Invalid username or password')
    }

    generateToken(res, userFromDatabase.username, userFromDatabase.is_admin, userFromDatabase.user_id)
    handleSuccess(res, { username: username }, 'User logged in')
  } catch (error) {
    next(error)
  }
}

const logOut = (req, res) => {
  res.cookie('x-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    expires: new Date(0)
  })

  return res.status(200).json({ message: 'Logout successful' })
}

const createUser = async (req, res, next) => {
  const loginData = req.body

  try {
    const userFromDatabase = await authServices.getUserFromDatabaseByUsername(loginData)

    if (userFromDatabase) return handleError(res, 400, 'Username or email already exist')

    const saltRouds = 10
    const hashedPassword = await bcrypt.hash(loginData.password, saltRouds)

    const loginDataWithHashedPassword = { ...loginData, password: hashedPassword }

    await authServices.createUser(loginDataWithHashedPassword)
    handleSuccess(res, {}, 'User created')
  } catch (error) {
    console.log(error)
    next(error)
  }
}
const verifyToken = (req, res) => {
  res.status(200).send({ status: 'SUCESS', data: req.user })
}

const swapToken = (req, res) => {
  const { username } = req.user

  if (username === 'testa') {
    generateToken(res, 'admin', true, '1')
    handleSuccess(res, { userName: 'admin', isAdmin: true }, 'Changed to user')
  } else if (username === 'admin') {
    generateToken(res, 'testa', false, '36')
    handleSuccess(res, { userName: 'testa', isAdmin: false }, 'Changed to admin')
  } else {
    handleError(res, 401, 'You are not authorized')
  }
}

export default {
  login, verifyToken, createUser, logOut, swapToken
}
