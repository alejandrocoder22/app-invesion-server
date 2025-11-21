export class ValidationError extends Error {
  constructor (message, field = null, value = null) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
    this.status = 400

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }
  }

  toJSON () {
    return {
      error: this.name,
      message: this.message,
      field: this.field,
      status: this.status
    }
  }
}

export class DatabaseError extends Error {
  constructor (message, status) {
    super(message)
    this.name = 'DatabaseError'
    this.status = status
  }
}
