'use strict'

const User = require('../../../src/models/user')
const updateProfile = require('../../../src/controllers/profile/update-profile')

jest.mock('../../../src/models/user')

describe('updateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 & updated profile on success', async () => {
    expect.assertions(2)
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    const body = { email: 'leroy@example.com' }
    User.updateUser = jest.fn().mockResolvedValue(expect.any(Object))

    const actual = await updateProfile({ userId, token, body })
    expect(User.updateUser).toHaveBeenCalledWith(expect.objectContaining({
      options: { new: true },
      target: { _id: userId, username: name },
      updates: { email: body.email }
    }))
    expect(actual).toEqual(expect.any(Object))
  })

  it('should throw with 404 status if no profile updated', async () => {
    const userId = '404'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    const body = { email: 'leroy@example.com' }
    User.updateUser = jest.fn().mockResolvedValue(undefined)

    await expect(updateProfile({ userId, token, body })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'Update error: user not found'
      }))
  })

  it('should handle database errors', async () => {
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    const body = { email: 'leroy@example.com' }
    User.updateUser = jest.fn().mockRejectedValue(new Error('boom'))

    await expect(updateProfile({ userId, token, body })).rejects
      .toThrow(/boom/)
  })
})
