'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const User = require('../../../src/models/user')
const reqResNext = require('../../fixtures/req-res-next')
const refreshToken = require('../../../src/controllers/auth/refresh-token')

jest.mock('../../../src/models/user')

const userId = 'someMongodbObjectId'
const mockJwt = '09asd098asd098asd098asd'
const mockUser = {
  _id: userId,
  likedPosts: [],
  generateJWT: jest.fn().mockReturnValue(mockJwt)
}

describe('refreshToken', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
    User.findById = jest.fn(() => User)
  })

  it('should return 200 with user and token on success', async () => {
    req.token._id = userId
    User.exec = jest.fn().mockResolvedValue(mockUser)

    await refreshToken(req, res, next)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      profile: expect.any(Object),
      token: mockJwt
    }))
  })

  it('should reject with 404 when user not found', async () => {
    req.token._id = userId
    User.exec = jest.fn().mockResolvedValue(null)

    await refreshToken(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: expect.stringContaining('User not found')
    }))
  })

  it('should handle errors thrown from User DB method calls', async () => {
    expect.assertions(5)
    req.token._id = userId

    // mock Post model method rejection
    User.exec = jest.fn().mockRejectedValue(new Error('User Borked'))

    await refreshToken(req, res, next)
    expect(User.exec).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('User Borked')
    }))
  })
})
