'use strict'

const passport = require('passport')
const _cloneDeep = require('lodash/cloneDeep')
const reqResNext = require('../../fixtures/req-res-next')
const login = require('../../../src/controllers/auth/login')

jest.mock('../../../src/models/user')
jest.mock('passport')

describe('login', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
  })

  it('should call function returned from passport.authenticate', async () => {
    req.body.password = 'password'
    req.body.username = 'username'
    const returnedFn = jest.fn()
    passport.authenticate = jest.fn().mockReturnValue(returnedFn)

    await login(req, res, next)
    expect(returnedFn).toHaveBeenCalled()
    expect(returnedFn).toHaveBeenCalledWith(req, res, next)
  })

  it('should throw if missing username', () => {
    expect.assertions(4)
    req.body.password = 'password'
    login(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Missing required username'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should throw if missing password', () => {
    expect.assertions(4)
    req.body.username = 'username'
    login(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Missing required password'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })
})
