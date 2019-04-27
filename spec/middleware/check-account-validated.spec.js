'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const checkAccountValidated = require('../../src/middleware/check-account-validated')
const reqResNext = require('../fixtures/req-res-next')

describe('checkAccountValidated middleware', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should call next if user account is validated', () => {
    expect.assertions(3)
    req.token.validated = true
    checkAccountValidated(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should call next with error if user account not validated', () => {
    expect.assertions(4)
    req.token.validated = false
    checkAccountValidated(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 403,
      message: expect.stringMatching(/You need to validate your account/)
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })
})
