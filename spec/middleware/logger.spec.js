'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const makeLoggerMiddleware = require('../../src/middleware/logger')
const reqResNext = require('../fixtures/req-res-next')

describe('logger middleware', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should attach a logger to the request object & call next', () => {
    const logger = makeLoggerMiddleware()
    logger(req, res, next)
    expect(req.log).toEqual(expect.any(Object))
    expect(next).toHaveBeenCalledTimes(1)
  })
})
