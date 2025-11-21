import { validateToken } from '../middleware/validateToken.js'
import authControllers from '../controllers/authControllers.js'
import express from 'express'
import rateLimit from 'express-rate-limit'

const router = express.Router()

//  Base Route /auth/*

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/login', loginLimiter, authControllers.login)
router.post('/logout', authControllers.logOut)
router.post('/register', authControllers.createUser)
router.get('/verify', validateToken, authControllers.verifyToken)
router.get('/swap', validateToken, authControllers.swapToken)

export default router
