'use strict'

const secret = 'shhhhhh'
process.env.JWT_SECRET = secret
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  getConversations,
  getConversation,
  createConversation,
  createMessage
} = require('../../src/controllers/conversation')
const server = require('../../src/server')
const userId = 'foo'

jest.mock('../../src/middleware/request', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/middleware/error-handler', () => jest.fn(() => (req, res, next) => next()))
jest.mock('../../src/controllers/conversation', () => ({
  getConversations: jest.fn().mockResolvedValue(true),
  getConversation: jest.fn().mockResolvedValue(true),
  createConversation: jest.fn().mockResolvedValue(true),
  createMessage: jest.fn().mockResolvedValue(true)
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET >> /conversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(getConversations).toHaveBeenCalledTimes(1)
    expect(getConversations).toHaveBeenCalledWith({ userId: expect.any(String) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/conversations')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    getConversations.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('GET >> /conversations/:id', () => {
  it('should respond with 200 status on success', async () => {
    const conversationId = 'abcd123'
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .get(`/api/v2/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(getConversation).toHaveBeenCalledTimes(1)
    expect(getConversation).toHaveBeenCalledWith({ conversationId: expect.any(String) })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/conversations')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    getConversation.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('POST >> /conversations', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .post('/api/v2/conversations')
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(createConversation).toHaveBeenCalledTimes(1)
    expect(createConversation).toHaveBeenCalledWith({
      userId: expect.any(String),
      body: expect.any(Object)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .get('/api/v2/conversations')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    createConversation.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .get('/api/v2/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})

describe('POST >> /conversations/messages', () => {
  it('should respond with 200 status on success', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)

    const response = await request(server)
      .post('/api/v2/conversations/messages')
      .send({ body: {} })
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(true)
    expect(createMessage).toHaveBeenCalledTimes(1)
    expect(createMessage).toHaveBeenCalledWith({
      userId: expect.any(String),
      body: expect.any(Object),
      log: expect.any(Object)
    })
  })

  it('should respond with 401 error if request includes invalid JWT', async () => {
    const response = await request(server)
      .post('/api/v2/conversations/messages')
      .set('Authorization', `Bearer invalid`)
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/jwt malformed/))
  })

  it('should respond with 401 error if request is missing JWT', async () => {
    const response = await request(server)
      .post('/api/v2/conversations/messages')
    expect(response.statusCode).toEqual(401)
    expect(response.error.text).toEqual(expect.stringMatching(/No authorization token was found/))
  })

  it('should respond with 403 error if user not validated', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: false }, secret)

    const response = await request(server)
      .post('/api/v2/conversations/messages')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(403)
    expect(response.error.text).toEqual(expect.stringMatching(/need to validate/))
  })

  it('should handle errors thrown from controller', async () => {
    const token = jwt.sign({ _id: userId, username: 'bar', validated: true }, secret)
    createMessage.mockRejectedValue(new Error('kaboom'))

    const response = await request(server)
      .post('/api/v2/conversations/messages')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toEqual(500)
    expect(response.error.text).toEqual(expect.stringMatching(/kaboom/))
  })
})
