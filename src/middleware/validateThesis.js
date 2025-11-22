const validateThesis = (req, res, next) => {
  const { text } = req.body
  const errors = []

  // Validar que text exista
  if (!text) {
    errors.push({
      field: 'text',
      message: 'Text is required'
    })
  }

  // Validar que text sea un string
  if (text && typeof text !== 'string') {
    errors.push({
      field: 'text',
      message: 'Text must be a string'
    })
  }

  // Validar longitud mínima
  if (text && typeof text === 'string' && text.trim().length < 10) {
    errors.push({
      field: 'text',
      message: 'Text must be at least 10 characters long'
    })
  }

  // Validar longitud máxima
  if (text && typeof text === 'string' && text.length > 5000) {
    errors.push({
      field: 'text',
      message: 'Text cannot exceed 5000 characters'
    })
  }

  // Si hay errores, retornar 400
  if (errors.length > 0) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Validation error',
      errors
    })
  }

  // Si todo está bien, continuar
  next()
}

export default validateThesis
