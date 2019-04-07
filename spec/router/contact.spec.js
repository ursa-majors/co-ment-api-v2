'use strict'

const secret = 'shhhhhh'
process.env.JWT_SECRET = secret
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  resendValidation,
  sendEmail
} = require('../../src/controllers/contact')
const server = require('../../src/server')

jest.mock('../../src/middleware/request', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/middleware/error-handler', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/controllers/contact', () => ({
  resendValidation: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true)
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET >> /contact/resendvalidation', () => {
  const userId = 'foo'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)

    const response = await request(server)
      .get('/api/v2/contact/resendvalidation')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(resendValidation).toHaveBeenCalledTimes(1)
    expect(resendValidation).toHaveBeenCalledWith({ userId: expect.any(String) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/contact/resendvalidation')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/contact/resendvalidation')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar' }, secret)
    resendValidation.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get('/api/v2/contact/resendvalidation')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('POST >> /contact/sendemail', () => {
  const userId = 'foo'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .post('/api/v2/contact/sendemail')
      .send({})
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith({
      body: expect.any(Object),
      username: expect.any(String),
      userId: expect.any(String)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .post('/api/v2/contact/sendemail')
      .send({})
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .post('/api/v2/contact/sendemail')
      .send({})
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .post('/api/v2/contact/sendemail')
      .send({})
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    sendEmail.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .post('/api/v2/contact/sendemail')
      .send({})
      .send({ userId })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})
