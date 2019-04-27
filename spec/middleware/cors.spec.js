'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const corsMiddleware = require('../../src/middleware/cors')
const reqResNext = require('../fixtures/req-res-next')

describe('corsMiddleware middleware', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    res.header = jest.fn()
    res.sendStatus = jest.fn()
    next = reqResNext.next
  })

  it('should set response headers and call next for simple requests', () => {
    expect.assertions(5)
    req.method = 'GET'
    corsMiddleware()(req, res, next)

    expect(res.header).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      expect.any(String)
    )
    expect(res.header).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Methods',
      expect.any(String)
    )
    expect(res.header).toHaveBeenNthCalledWith(
      3,
      'Access-Control-Allow-Headers',
      expect.any(String)
    )
    expect(res.sendStatus).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should set response headers and respond with 200 for complex requests', () => {
    expect.assertions(6)
    req.method = 'OPTIONS'
    corsMiddleware()(req, res, next)

    expect(res.header).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      expect.any(String)
    )
    expect(res.header).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Methods',
      expect.any(String)
    )
    expect(res.header).toHaveBeenNthCalledWith(
      3,
      'Access-Control-Allow-Headers',
      expect.any(String)
    )
    expect(res.sendStatus).toHaveBeenCalledTimes(1)
    expect(res.sendStatus).toHaveBeenCalledWith(200)
    expect(next).not.toHaveBeenCalled()
  })
})
