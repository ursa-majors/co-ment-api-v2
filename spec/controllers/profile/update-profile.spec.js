'use strict'

const User = require('../../../src/models/user')
const updateProfile = require('../../../src/controllers/profile/update-profile')

jest.mock('../../../src/models/user')

const log = {}
const req = {
  body: {},
  params: {},
  token: {},
  log
}
const res = {
  status: jest.fn(function () { return this }),
  json: jest.fn()
}
const next = jest.fn()

describe('updateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 & updated profile on success', async () => {
    expect.assertions(5)
    const userId = '123'
    const name = 'Leroy'
    req.body.email = 'leroy@example.com'
    req.params.id = userId
    req.token._id = userId
    req.token.username = name
    User.updateUser = jest.fn().mockResolvedValue(expect.any(Object))

    await updateProfile(req, res, next)
    expect(User.updateUser).toHaveBeenCalledWith(expect.objectContaining({
      options: { new: true },
      target: { _id: '123', username: name },
      updates: { email: req.body.email }
    }))
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should call next with 404 error if no profile updated', async () => {
    expect.assertions(4)
    req.params.id = '404'
    req.token._id = '404'
    req.token.username = 'Leroy'
    User.updateUser = jest.fn().mockResolvedValue(undefined)

    await updateProfile(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: 'Update error: user not found'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    expect.assertions(4)
    User.updateUser = jest.fn().mockRejectedValue(new Error('boom'))
    await updateProfile(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'boom'
    }))
  })
})
