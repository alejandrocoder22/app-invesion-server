import app from '../server.js'
import supertest from 'supertest'
import { cleanMockupTicker } from '../tests/utils/cleanTicker.js'
import { loginAndGetToken } from './utils/loginAndGetToken.js'
import stockHistoric from './mock/queryData.json'
import questionsData from './utils/questionsData.js'
const request = supertest(app)

describe('Tests in /stocks ', () => {
  let companyId
  it('/stocks/getAll Should return 200 and data if user is logged', async () => {
    const cookie = await loginAndGetToken(request)

    const response = await request
      .get('/stocks/')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body.data.length).toBeGreaterThan(0)
  })

  it('POST /stock/ should add the entery stock info and return 200', async () => {
    const cookie = await loginAndGetToken(request)

    const createdStock = await request
      .post('/stocks')
      .set('cookie', cookie)
      .send(stockHistoric)
    companyId = createdStock?.body.data.companyId
    expect(createdStock.status).toBe(200)
  })

  it('/stocks/:companyId/questions should update keyQuestions and return 200', async () => {
    const cookie = await loginAndGetToken(request)
    const response = await request
      .post(`/stocks/${companyId}/questions`)
      .set('cookie', cookie)
      .send(questionsData)

    expect(response.status).toBe(200)
  })

  afterAll(() => {
    return cleanMockupTicker()
  })
})
