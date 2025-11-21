// utils/responseHandlers.js
export const handleSuccess = (res, data, message = 'Success') => {
  res.status(200).json({ status: 'SUCCESS', message, data })
}

export const handleError = (res, statusCode = 400, message = 'Something went wrong') => {
  res.status(statusCode).json({ status: 'FAILED', message })
}
