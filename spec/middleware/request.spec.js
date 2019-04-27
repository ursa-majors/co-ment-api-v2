'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const makeRequestMiddleware = require('../../src/middleware/request')
const reqResNext = require('../fixtures/req-res-next')

describe('request middleware', () => {
  let req, res, next, requestMiddleware

  beforeEach(() => {
    jest.clearAllMocks()
    requestMiddleware = makeRequestMiddleware()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    res.on = jest.fn()
    next = reqResNext.next
  })

  it('should call logger for each request', () => {
    req.method = 'POST'
    requestMiddleware(req, res, next)
    expect(req.log.info).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
