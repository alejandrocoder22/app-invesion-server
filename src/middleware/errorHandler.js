import { ValidationError } from '../helpers/customErrors.js'

const errorHandler = (err, req, res, next) => {
  console.log(err)
  let statusCode = err.status || 500
  let message
  if (err instanceof ValidationError) {
    statusCode = 400
    message = err.message
  }

  // violation de NOT NULL

  if (err.code === '23502') {
    statusCode = 400
    message = `Missing required field: ${err.column}`
  }
  res.status(statusCode).json({
    name: err?.name,
    message: message || 'Internal Server Error'
  })
}

export default errorHandler
