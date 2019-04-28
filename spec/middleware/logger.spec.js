'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const reqResNext = require('../fixtures/req-res-next')
const {
  makeLoggerMiddleware,
  _reqSerializer,
  _resSerializer
} = require('../../src/middleware/logger')

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

describe('_reqSerializer', () => {
  it('should return formated & sanitized request info', () => {
    reqResNext.req.method = 'POST'
    reqResNext.req.url = 'https://way/to/be'
    reqResNext.req.headers = { blah: 'blah', authorization: 'should be masked' }
    expect(_reqSerializer(reqResNext.req)).toEqual({
      method: 'POST',
      url: 'https://way/to/be',
      headers: {
        blah: 'blah',
        authorization: '<MASKED>'
      }
    })
  })
})

describe('_resSerializer', () => {
  it('should return formated & sanitized response info', () => {
    reqResNext.res.getHeaders = function () { return this.headers }
    reqResNext.res.statusCode = 200
    reqResNext.res.headers = { blah: 'blah', authorization: 'should be masked' }
    expect(_resSerializer(reqResNext.res)).toEqual({
      statusCode: 200,
      headers: {
        blah: 'blah',
        authorization: '<MASKED>'
      }
    })
  })

  it('should return malformed response objects as-is', () => {
    reqResNext.res.getHeaders = function () { return this.headers }
    delete reqResNext.res.statusCode
    reqResNext.res.headers = { authorization: 'should be in the clear' }
    expect(_resSerializer(reqResNext.res)).toEqual({
      getHeaders: expect.any(Function),
      status: expect.any(Function),
      json: expect.any(Function),
      headers: {
        authorization: 'should be in the clear'
      }
    })
  })
})
