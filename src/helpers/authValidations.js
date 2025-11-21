import { ValidationError } from './customErrors.js'

export const authValidations = (password, username) => {
  if (!username || !password) {
    throw new ValidationError('Username and password are required', 400)
  }
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new ValidationError('Invalid input format', 400)
  }
  if (username.length > 255 || password.length > 255) {
    throw new ValidationError('Input too long', 400)
  }
}
