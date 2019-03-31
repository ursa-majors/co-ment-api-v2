'use strict'

const User = require('../../../src/models/user')
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
  beforeEach(() => {
    jest.clearAllMocks()
    User.findById = jest.fn(() => User)
  })

  it('should return user profile & token on success', async () => {
    User.exec = jest.fn().mockResolvedValue(mockUser)

    const actual = await refreshToken({ userId })
    expect(actual).toEqual(expect.objectContaining({
      profile: expect.any(Object),
      token: mockJwt
    }))
  })

  it('should throw when user not found', async () => {
    // mock no user found
    User.exec = jest.fn().mockResolvedValue(null)

    await expect(refreshToken({ userId })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: expect.stringContaining('User not found')
      }))
  })

  it('should handle errors thrown from User DB method calls', async () => {
    // mock User model method error
    User.exec = jest.fn().mockRejectedValue(new Error('User Borked'))

    await expect(refreshToken({ userId })).rejects
      .toThrow(expect.objectContaining({
        message: expect.stringContaining('User Borked')
      }))
  })
})
