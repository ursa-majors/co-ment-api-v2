'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const User = require('../../../src/models/user')
const reqResNext = require('../../fixtures/req-res-next')
const resetPassword = require('../../../src/controllers/auth/reset-password')

jest.mock('../../../src/models/user')

const userName = 'userName'
const password = 'password'
const key = '09asd098asd098asd098asd'
const mockUser = {
  _id: 1,
  userName,
  passwordResetKey: { key },
  hashPassword: jest.fn(),
  save: jest.fn()
}

describe('refreshToken', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
    User.findOne = jest.fn(() => User)
  })

  it('should return 200 success message on success', async () => {
    expect.assertions(5)
    req.body.username = userName
    req.body.password = password
    req.body.key = key
    User.exec = jest.fn().mockResolvedValue(mockUser)

    await resetPassword(req, res, next)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password reset successful'
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should reject with 404 when user not found', async () => {
    expect.assertions(5)
    req.body.username = userName
    req.body.password = password
    req.body.key = key
    User.exec = jest.fn().mockResolvedValue(null)

    await resetPassword(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: expect.stringContaining('No user with that username')
    }))
  })

  it('should reject with 400 when reset keys dont match', async () => {
    expect.assertions(5)
    req.body.username = userName
    req.body.password = password
    req.body.key = 'wrong key'
    User.exec = jest.fn().mockResolvedValue(mockUser)

    await resetPassword(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('Invalid password reset key')
    }))
  })

  it('should handle errors thrown from User DB method calls', async () => {
    expect.assertions(5)
    req.body.username = userName
    req.body.password = password
    req.body.key = key
    User.exec = jest.fn().mockRejectedValue(new Error('Reset Borked'))

    await resetPassword(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Reset Borked')
    }))
  })

  it('should call next with error when username is mssing', async () => {
    req.body.username = undefined
    req.body.password = password
    req.body.key = key

    await resetPassword(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('Missing required username')
    }))
  })

  it('should call next with error when password is mssing', async () => {
    req.body.username = userName
    req.body.password = undefined
    req.body.key = key

    await resetPassword(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('Missing required password')
    }))
  })

  it('should call next with error when key is mssing', async () => {
    req.body.username = userName
    req.body.password = password
    req.body.key = undefined

    await resetPassword(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('Missing required key')
    }))
  })

})
