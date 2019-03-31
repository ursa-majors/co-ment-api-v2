'use strict'

const User = require('../../../src/models/user')
const validate = require('../../../src/controllers/auth/validate')

jest.mock('../../../src/models/user')

const req = {
  query: {}
}

const res = {
  redirect: jest.fn()
}

const next = jest.fn()

describe('validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update user and call redirect on success', async () => {
    expect.assertions(3)
    req.query.uid = 'userId'
    req.query.key = 'somelonghexkey'
    const mockUpdatedUser = {
      signupKey: { key: req.query.key }
    }
    User.updateUser = jest.fn().mockResolvedValue(mockUpdatedUser)

    await validate(req, res, next)
    expect(res.redirect).toHaveBeenCalledTimes(1)
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/#/redirect=validate'
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next with 404 error if no user found', async () => {
    expect.assertions(3)
    req.query.uid = 'userId'
    req.query.key = 'somelonghexkey'
    User.updateUser = jest.fn().mockResolvedValue(null)

    await validate(req, res, next)
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: 'No user with that ID found'
    }))
  })

  it('should call next with 400 error on registration key mismatch', async () => {
    expect.assertions(3)
    req.query.uid = 'userId'
    req.query.key = 'somelonghexkey'
    const mockUpdatedUser = {
      signupKey: { key: 'noththesamelongasshexkey' }
    }
    User.updateUser = jest.fn().mockResolvedValue(mockUpdatedUser)

    await validate(req, res, next)
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Registration key mismatch'
    }))
  })

  it('should handle DB errors', async () => {
    expect.assertions(3)
    req.query.uid = 'userId'
    req.query.key = 'somelonghexkey'
    User.updateUser = jest.fn().mockRejectedValue(new Error('Boom'))

    await validate(req, res, next)
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Boom'
    }))
  })
})
