'use strict'

const User = require('../../../src/models/user')
const updateProfile = require('../../../src/controllers/profile/update-profile')

jest.mock('../../../src/models/user')

describe('updateProfile', () => {
  beforeAll(() => {
    User.findOneAndUpdate = jest.fn(() => User)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 & updated profile on success', async () => {
    expect.assertions(2)
    const userId = '123'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    const body = { email: 'leroy@example.com' }
    User.exec = jest.fn().mockResolvedValue(expect.any(Object))

    const actual = await updateProfile({ userId, token, body })
    expect(actual).toEqual(expect.any(Object))
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userId, username: name },
      { email: body.email },
      { new: true }
    )
  })

  it('should throw with 404 status if no profile updated', async () => {
    const userId = '404'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    const body = { email: 'leroy@example.com' }
    User.exec = jest.fn().mockResolvedValue(undefined)

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
    User.exec = jest.fn().mockRejectedValue(new Error('boom'))

    await expect(updateProfile({ userId, token, body })).rejects
      .toThrow(/boom/)
  })

  it(`should throw with 400 status if missing 'userId' param`, async () => {
    const userId = '404'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    const body = { email: 'leroy@example.com' }
    User.exec = jest.fn().mockResolvedValue(undefined)

    await expect(updateProfile({ token, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required userId param'
      }))
  })

  it(`should throw with 400 status if missing 'token' param`, async () => {
    const userId = '404'
    const body = { email: 'leroy@example.com' }
    User.exec = jest.fn().mockResolvedValue(undefined)

    await expect(updateProfile({ userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required token param'
      }))
  })

  it(`should throw with 400 status if missing 'body' param`, async () => {
    const userId = '404'
    const name = 'Leroy'
    const token = { _id: userId, username: name }
    User.exec = jest.fn().mockResolvedValue(undefined)

    await expect(updateProfile({ userId, token })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required body param'
      }))
  })
})
