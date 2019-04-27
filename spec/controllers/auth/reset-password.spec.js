'use strict'

const User = require('../../../src/models/user')
const resetPassword = require('../../../src/controllers/auth/reset-password')

jest.mock('../../../src/models/user')

const username = 'username'
const password = 'password'
const key = '09asd098asd098asd098asd'
const mockUser = {
  _id: 1,
  username,
  passwordResetKey: { key },
  hashPassword: jest.fn(),
  save: jest.fn()
}

describe('refreshToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findOne = jest.fn(() => User)
  })

  it('should return success message on success', async () => {
    User.exec = jest.fn().mockResolvedValue(mockUser)

    const actual = await resetPassword({ username, password, key })
    expect(actual).toEqual(expect.objectContaining({
      message: 'Password reset successful'
    }))
  })

  it('should throw with 404 status when user not found', async () => {
    User.exec = jest.fn().mockResolvedValue(null)

    await expect(resetPassword({ username, password, key })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: expect.stringContaining('No user with that username')
      }))
  })

  it('should throw with 400 status when reset keys dont match', async () => {
    User.exec = jest.fn().mockResolvedValue(mockUser)
    const key = 'wrong key'

    await expect(resetPassword({ username, password, key })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('Invalid password reset key')
      }))
  })

  it('should handle errors thrown from User DB method calls', async () => {
    User.exec = jest.fn().mockRejectedValue(new Error('Reset barfed'))

    await expect(resetPassword({ username, password, key })).rejects
      .toThrow(/Reset barfed/)
  })

  it('should throw with 400 status when username is mssing', async () => {
    await expect(resetPassword({ password, key })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('Missing required username')
      }))
  })

  it('should throw with 400 status when password is mssing', async () => {
    await expect(resetPassword({ username, key })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('Missing required password')
      }))
  })

  it('should throw with 400 status when key is mssing', async () => {
    await expect(resetPassword({ username, password })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: expect.stringContaining('Missing required key')
      }))
  })
})
