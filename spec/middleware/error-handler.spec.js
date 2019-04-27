'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const makeErrorHandler = require('../../src/middleware/error-handler')
const reqResNext = require('../fixtures/req-res-next')

describe('error handler middleware', () => {
  let req, res, next, errorHandler

  beforeEach(() => {
    jest.clearAllMocks()
    errorHandler = makeErrorHandler()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should handle errors with attached status codes', () => {
    const err = new Error('Unauthorized')
    err.status = 403
    errorHandler(err, req, res, next)
    expect(req.log.error).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' })
  })

  it('should use default status code when errors have no http status', () => {
    const err = new Error('Internal Server Error')
    errorHandler(err, req, res, next)
    expect(req.log.error).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' })
  })

  it('should use default status message when errors have no own message', () => {
    const err = new Error()
    err.status = 401
    errorHandler(err, req, res, next)
    expect(req.log.error).toHaveBeenCalledTimes(1)
    expect(req.log.error).toHaveBeenCalledWith(
      expect.any(Object),
      '401 Unauthorized'
    )
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  it('should log the error to stdout if no logger is attached', () => {
    delete req.log
    jest.spyOn(global.console, 'error').mockImplementation(() => {})
    const err = new Error('Console yo!')
    errorHandler(err, req, res, next)
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ message: 'Console yo!' })
  })
})
