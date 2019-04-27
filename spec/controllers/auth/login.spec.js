'use strict'

const User = require('../../../src/models/user')
const login = require('../../../src/controllers/auth/login')

const mockToken = 'eyJhbGciOiJIUzI1.eyJfaWQiOiI1Yz.mitXdAfCqqpoFH63s'

const foundUser = {
  _id: '4c89e3285e0f7b214d29d03a',
  username: 'jay',
  email: 'user@example.com',
  salt: '098asdlkj23098asdlj',
  hash: 'sdlkj509asdlkjaf09ulkjasd89dsa',
  generateJWT: jest.fn().mockReturnValue(mockToken),
  toObject: jest.fn(function () { return this }),
  validatePassword: jest.fn()
}

jest.mock('../../../src/models/user')

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findOne = jest.fn(() => User)
  })

  it('should return profile & token on success', async () => {
    expect.assertions(3)
    const password = 'password'
    const username = 'username'
    foundUser.validatePassword.mockReturnValue(true)
    User.exec = jest.fn().mockResolvedValue(foundUser)

    const actual = await login({ username, password })
    expect(actual).toEqual({
      profile: expect.any(Object),
      token: mockToken
    })
    expect(actual.profile).not.toHaveProperty('hash')
    expect(actual.profile).not.toHaveProperty('salt')
  })

  it('should throw if missing username', async () => {
    await expect(login({ password: '1234' })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required username'
      }))
  })

  it('should throw if missing password', async () => {
    await expect(login({ username: '1234' })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required password'
      }))
  })

  it('should throw if no user found', async () => {
    const password = 'password'
    const username = 'username'
    User.exec = jest.fn().mockResolvedValue(null)

    await expect(login({ username, password })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'User not found'
      }))
  })

  it('should throw on invalid password', async () => {
    const password = 'password'
    const username = 'username'
    foundUser.validatePassword.mockReturnValue(false)
    User.exec = jest.fn().mockResolvedValue(foundUser)

    await expect(login({ username, password })).rejects
      .toThrow(expect.objectContaining({
        status: 401,
        message: 'Invalid password'
      }))
  })
})
