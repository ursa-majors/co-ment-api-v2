'use strict'

const User = require('../../../src/models/user')
const getOneProfile = require('../../../src/controllers/profile/get-one-profile')

jest.mock('../../../src/models/user')

describe('getOneProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findById = jest.fn(() => User)
  })

  it('should return user profile on success', async () => {
    expect.assertions(2)
    const userId = '123'
    User.exec = jest.fn().mockResolvedValue(expect.any(Object))
    const actual = await getOneProfile({ userId })
    expect(User.findById).toHaveBeenCalledWith(userId, expect.any(Object))
    expect(actual).toEqual(expect.any(Object))
  })

  it('should throw with 404 status if no profile found', async () => {
    const userId = '404'
    User.exec = jest.fn().mockResolvedValue(undefined)
    await expect(getOneProfile({ userId })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: `User profile not found`
      }))
  })

  it('should handle database errors', async () => {
    const userId = '123'
    User.exec = jest.fn().mockRejectedValue(new Error('boom'))
    await expect(getOneProfile({ userId })).rejects
      .toThrow(/boom/)
  })
})
