'use strict'

const secret = 'shhhhhh'
process.env.JWT_SECRET = secret
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  refreshToken,
  register,
  login,
  sendPwReset,
  resetPassword
} = require('../../src/controllers/auth')
const server = require('../../src/server')

jest.mock('../../src/middleware/request', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/middleware/error-handler', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/controllers/auth/index', () => ({
  refreshToken: jest.fn().mockResolvedValue(true),
  register: jest.fn().mockResolvedValue(true),
  validate: jest.fn(),
  login: jest.fn().mockResolvedValue(true),
  sendPwReset: jest.fn().mockResolvedValue(true),
  resetPassword: jest.fn().mockResolvedValue(true)
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET >> /refreshtoken', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: 'foo', name: 'bar' }, secret)

    const response = await request(server)
      .get('/api/v2/auth/refreshtoken')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(refreshToken).toHaveBeenCalledTimes(1)
    expect(refreshToken).toHaveBeenCalledWith({ userId: expect.any(String) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/auth/refreshtoken')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
    expect(refreshToken).not.toHaveBeenCalled()
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/auth/refreshtoken')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
    expect(refreshToken).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: 'foo', name: 'bar' }, secret)
    refreshToken.mockRejectedValue(new Error('kaboom'))
    const response = await request(server)
      .get('/api/v2/auth/refreshtoken')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
    expect(refreshToken).toHaveBeenCalledTimes(1)
    expect(refreshToken).toHaveBeenCalledWith({ userId: expect.any(String) })
  })
})

describe('POST >> /register', () => {
  it('should respond with 200 status on success', async () => {
    const response = await request(server)
      .post('/api/v2/auth/register')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(register).toHaveBeenCalledTimes(1)
    expect(register).toHaveBeenCalledWith({
      body: expect.any(Object),
      log: expect.any(Object)
    })
  })

  it('should handle errors thrown from controller', async () => {
    register.mockRejectedValue(new Error('kaboom'))
    const response = await request(server)
      .post('/api/v2/auth/register')
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
    expect(register).toHaveBeenCalledTimes(1)
    expect(register).toHaveBeenCalledWith({
      body: expect.any(Object),
      log: expect.any(Object)
    })
  })
})

describe('POST >> /login', () => {
  const username = 'username'
  const password = 'password'

  it('should respond with 200 status on success', async () => {
    const response = await request(server)
      .post('/api/v2/auth/login')
      .send({ username, password })
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(login).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledWith({
      username: expect.any(String),
      password: expect.any(String)
    })
  })

  it('should handle errors thrown from controller', async () => {
    login.mockRejectedValue(new Error('kaboom'))
    const response = await request(server)
      .post('/api/v2/auth/login')
      .send({ username, password })
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
    expect(login).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledWith({
      username: expect.any(String),
      password: expect.any(String)
    })
  })
})

describe('POST >> /sendresetemail', () => {
  const username = 'username'
  const password = 'password'

  it('should respond with 200 status on success', async () => {
    const response = await request(server)
      .post('/api/v2/auth/sendresetemail')
      .send({ username, password })
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(sendPwReset).toHaveBeenCalledTimes(1)
    expect(sendPwReset).toHaveBeenCalledWith({
      username: expect.any(String),
      log: expect.any(Object)
    })
  })

  it('should handle errors thrown from controller', async () => {
    sendPwReset.mockRejectedValue(new Error('kaboom'))
    const response = await request(server)
      .post('/api/v2/auth/sendresetemail')
      .send({ username, password })
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
    expect(sendPwReset).toHaveBeenCalledTimes(1)
    expect(sendPwReset).toHaveBeenCalledWith({
      username: expect.any(String),
      log: expect.any(Object)
    })
  })
})

describe('POST >> /resetpassword', () => {
  const username = 'username'
  const password = 'password'
  const key = 'key'

  it('should respond with 200 status on success', async () => {
    const response = await request(server)
      .post('/api/v2/auth/resetpassword')
      .send({ username, password, key })
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(resetPassword).toHaveBeenCalledTimes(1)
    expect(resetPassword).toHaveBeenCalledWith({
      username: expect.any(String),
      password: expect.any(String),
      key: expect.any(String)
    })
  })

  it('should handle errors thrown from controller', async () => {
    resetPassword.mockRejectedValue(new Error('kaboom'))
    const response = await request(server)
      .post('/api/v2/auth/resetpassword')
      .send({ username, password, key })
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
    expect(resetPassword).toHaveBeenCalledTimes(1)
    expect(resetPassword).toHaveBeenCalledWith({
      username: expect.any(String),
      password: expect.any(String),
      key: expect.any(String)
    })
  })
})
