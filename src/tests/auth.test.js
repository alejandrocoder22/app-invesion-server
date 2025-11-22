import app from '../server.js'
import supertest from 'supertest'
import { loginAndGetToken } from './utils/loginAndGetToken.js'
import pool from '../database/database.js'

const request = supertest(app)

describe('Tests in auth system', () => {
  it('Return 200 on right login data', async () => {
    const payload = { username: 'admin', password: process.env.LOGIN_PASSWORD }

    const loginResponse = await request
      .post('/auth/login')
      .send(payload)
      .set('Content-Type', 'application/json')

    expect(loginResponse.status).toBe(200)
  })

  it('Return 400 on right login data', async () => {
    const payload = { username: 'admin', password: '123456' }

    const loginResponse = await request
      .post('/auth/login')
      .send(payload)
      .set('Content-Type', 'application/json')

    expect(loginResponse.status).toBe(400)
  })

  it('Return 400 if there is username or password is not provided', async () => {
    const payload = { username: '', password: '' }

    const loginResponse = await request
      .post('/auth/login')
      .send(payload)
      .set('Content-Type', 'application/json')
    expect(loginResponse.status).toBe(400)
    expect(loginResponse.body.message).toBe('Username and password are required')
  })

  it('Return 200 token is provided on refresh', async () => {
    const cookie = await loginAndGetToken(request)

    const response = await request
      .get('/auth/verify')
      .set('cookie', cookie)

    expect(response.status).toBe(200)
  })

  it('/auth/register is creating users properly', async () => {
    const createUserResponse = await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        username: 'test',
        password: '123456',
        email: 'test@gmail.com'
      })

    expect(createUserResponse.status).toBe(200)
  })

  afterAll(() => {
    pool.query('DELETE from users where username = $1', ['test'])
  })
})
