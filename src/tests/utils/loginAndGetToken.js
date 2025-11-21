export const loginAndGetToken = async (request) => {
  const payload = { username: 'admin', password: process.env.LOGIN_PASSWORD }

  const tokenResponse = await request
    .post('/auth/login')
    .send(payload)
    .set('Content-Type', 'application/json')
    .set('Credentials', 'included')

  return tokenResponse.headers['set-cookie']
}
