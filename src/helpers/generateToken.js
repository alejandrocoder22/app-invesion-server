
import jwt from 'jsonwebtoken'

export const generateToken = (res, username, isAdmin, userId) => {
  const token = jwt.sign(
    { userId, username, isAdmin },
    process.env.JWT_PASSWORD, // Renombra JWT_PASSWORD
    { expiresIn: '1d' }
  )

  res.cookie('x-token', token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secure: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  })
}
