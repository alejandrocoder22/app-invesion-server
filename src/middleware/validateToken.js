import jwt from 'jsonwebtoken'

export const validateToken = (req, res, next) => {
  const token = req.cookies['x-token'] || undefined

  if (!token) { return res.status(400).send({ status: 'FAILED', msg: 'User is not loged in' }) }

  try {
    const isValid = jwt.verify(token, process.env.JWT_PASSWORD)
    req.user = isValid


    if (isValid) {
      return next()
    }
  } catch (error) {
    return res.status(400).send({ status: 'FAILED', msg: 'Invalid token' })
  }
}

export const validateAdmin = (req, res, next) => {
  const token = req.cookies['x-token'] || undefined
  try {
    if (token === 'null' || !token) {
      res.status(401).send({ status: 'FAILED', msg: 'User is not admin' })
    }
    if (token) {
      const isValid = jwt.verify(token, process.env.JWT_PASSWORD)

      if (!isValid) {
        res.status(401).send({ status: 'FAILED', error: 'Invalid Token' })
      }

      if (!isValid.isAdmin) {
        res.status(401).send({ status: 'FAILED', error: 'User is not an Admin' })
      }

      if (isValid.isAdmin) {
        req.user = isValid
        next()
      }
    }
  } catch (error) {
    res.status(500).send({ status: 'FAILED', error: error })
  }
}
