'use strict'

const request = require('supertest')
const express = require('express')
const makeRequestMiddleware = require('../../src/middleware/request')

const mockLogger = {
  info: jest.fn(),
  error: jest.fn()
}

const mockLoggerMiddleware = (req, res, next) => {
  req.log = mockLogger
  next()
}

describe(`request middleware integration tests`, () => {
  let app

  beforeEach(() => {
    jest.clearAllMocks()
    app = express()
    app.use(mockLoggerMiddleware)
  })

  it(`should handle OK requests calling log.info twice`, async () => {
    app.use(makeRequestMiddleware())
    app.get('/ok', (req, res) => res.status(200).json({ ok: true }))

    await request(app).get('/ok')

    expect(mockLogger.info).toHaveBeenCalledTimes(2)
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      2,
      { data: expect.any(Object) },
      'Resolved GET >> 200 OK'
    )
  })

  it(`should handle errors`, async () => {
    app.use(makeRequestMiddleware())
    app.get('/notok', (req, res) => res.status(400).json({ ok: false }))

    await request(app).get('/notok')

    expect(mockLogger.info).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(
      { data: expect.any(Object) },
      'Resolved GET >> 400 Bad Request'
    )
  })

  it(`should attach userId when req.token is available`, async () => {
    const mockUserId = 'abcd1234'
    app.use((req, res, next) => {
      req.token = { _id: mockUserId }
      next()
    })
    app.use(makeRequestMiddleware())
    app.get('/ok', (req, res) => res.status(200).json({ ok: true }))
    await request(app).get('/ok')

    expect(mockLogger.info).toHaveBeenCalledTimes(2)
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      2,
      { data: { userId: mockUserId } },
      'Resolved GET >> 200 OK'
    )
  })
})
