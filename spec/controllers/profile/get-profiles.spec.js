'use strict'

const User = require('../../../src/models/user')
const getProfiles = require('../../../src/controllers/profile/get-profiles')

jest.mock('../../../src/models/user')

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

describe('getProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return an array of user profiles', async () => {
    expect.assertions(4)
    User.findAllUsers = jest.fn().mockResolvedValue(expect.any(Array))
    await getProfiles(req, res, next)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.any(Array))
  })

  it('should handle database errors', async () => {
    expect.assertions(4)
    User.findAllUsers = jest.fn().mockRejectedValue(new Error('boom'))
    await getProfiles(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'boom'
    }))
  })
})
