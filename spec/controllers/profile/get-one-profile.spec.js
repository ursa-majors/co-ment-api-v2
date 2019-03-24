'use strict'

const User = require('../../../models/user')
const getOneProfile = require('../../../controllers/profile/get-one-profile')

jest.mock('../../../models/user')

const log = {}
const req = {
  params: {},
  log
}
const res = {
  status: jest.fn(function () { return this }),
  json: jest.fn()
}
const next = jest.fn()

describe('getOneProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 & user profile if found', async () => {
    expect.assertions(5)
    const userId = '123'
    req.params.id = userId
    User.findById = jest.fn().mockResolvedValue(expect.any(Object))
    await getOneProfile(req, res, next)
    expect(User.findById).toHaveBeenCalledWith(userId)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should return 404 & message if no profile found', async () => {
    expect.assertions(4)
    req.params.id = '404'
    User.findById = jest.fn().mockResolvedValue(undefined)
    await getOneProfile(req, res, next)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: `User profile not found`
    }))
  })

  it('should handle database errors', async () => {
    expect.assertions(4)
    User.findById = jest.fn().mockRejectedValue(new Error('boom'))
    await getOneProfile(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'boom'
    }))
  })
})
