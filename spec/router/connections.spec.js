'use strict'

const secret = 'shhhhhh'
process.env.JWT_SECRET = secret
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  getConnections,
  createConnection,
  updateConnection
} = require('../../src/controllers/connection')
const server = require('../../src/server')

jest.mock('../../src/middleware/request', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/middleware/error-handler', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/controllers/connection', () => ({
  getConnections: jest.fn().mockResolvedValue(true),
  createConnection: jest.fn().mockResolvedValue(true),
  updateConnection: jest.fn().mockResolvedValue(true)
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET >> /api/v2/connections', () => {
  const userId = 'foo'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: true }, secret)

    const response = await request(server)
      .get('/api/v2/connections')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(getConnections).toHaveBeenCalledTimes(1)
    expect(getConnections).toHaveBeenCalledWith({ userId: expect.any(String) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/connections')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/connections')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: false }, secret)

    const response = await request(server)
      .get('/api/v2/connections')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: true }, secret)
    getConnections.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get('/api/v2/connections')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('POST >> /api/v2/connections', () => {
  const userId = 'foo'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: true }, secret)

    const response = await request(server)
      .post('/api/v2/connections')
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(createConnection).toHaveBeenCalledTimes(1)
    expect(createConnection).toHaveBeenCalledWith({ body: expect.any(Object) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .post('/api/v2/connections')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .post('/api/v2/connections')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: false }, secret)

    const response = await request(server)
      .post('/api/v2/connections')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: true }, secret)
    createConnection.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .post('/api/v2/connections')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('PUT >> /api/v2/connections/:id', () => {
  const userId = 'foo'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: true }, secret)

    const response = await request(server)
      .put('/api/v2/connections/1')
      .send({ type: 'type' })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(updateConnection).toHaveBeenCalledTimes(1)
    expect(updateConnection).toHaveBeenCalledWith({
      connId: expect.any(String),
      type: expect.any(String)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .put('/api/v2/connections/1')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .put('/api/v2/connections/1')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: false }, secret)

    const response = await request(server)
      .put('/api/v2/connections/1')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, name: 'bar', validated: true }, secret)
    updateConnection.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .put('/api/v2/connections/1')
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})
