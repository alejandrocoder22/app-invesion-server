import app from '../server.js'
import supertest from 'supertest'
import { cleanMockupTicker } from '../tests/utils/cleanTicker.js'
import { loginAndGetToken } from './utils/loginAndGetToken.js'
import stockHistoric from './mock/queryData.json'
import questionsData from './utils/questionsData.js'

const request = supertest(app)

describe('Tests in /stocks', () => {
  let cookie
  let testCompanyId

  beforeAll(async () => {
    cookie = await loginAndGetToken(request)
  })

  beforeEach(async () => {
    await cleanMockupTicker()
  })

  afterAll(async () => {
    await cleanMockupTicker()
  })

  describe('GET /stocks/', () => {
    it('should return 200 and data if user is logged', async () => {
      const response = await request
        .get('/stocks/')
        .set('Cookie', cookie)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return 401 if user is not authenticated', async () => {
      const response = await request.get('/stocks/')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /stocks/', () => {
    it('should add stock info and return 200 with companyId', async () => {
      const response = await request
        .post('/stocks')
        .set('Cookie', cookie)
        .send(stockHistoric)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.companyId).toBeDefined()
      expect(typeof response.body.data.companyId).toBe('number')
    })

    it('should return 400 if stock data is invalid', async () => {
      const response = await request
        .post('/stocks')
        .set('Cookie', cookie)
        .send({ invalid: 'data' })

      expect(response.status).toBe(400)
    })

    it('should return 401 if user is not authenticated', async () => {
      const response = await request
        .post('/stocks')
        .send(stockHistoric)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /stocks/thesis/:companyId', () => {
    // Setup específico: crear un stock antes de cada test
    beforeEach(async () => {
      const createdStock = await request
        .post('/stocks')
        .set('Cookie', cookie)
        .send(stockHistoric)

      testCompanyId = createdStock.body.data.companyId
    })

    it('should update keyQuestions and return 200', async () => {
      const response = await request
        .post(`/stocks/thesis/${testCompanyId}`)
        .set('Cookie', cookie)
        .send(questionsData)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
    })

    it('should return 400 if questionsData is invalid', async () => {
      const response = await request
        .post(`/stocks/thesis/${testCompanyId}`)
        .set('Cookie', cookie)
        .send({ invalid: 'data' })

      expect(response.status).toBe(400)
    })
  })
})
