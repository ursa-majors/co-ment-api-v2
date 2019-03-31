'use strict'

const mailer = require('../../../src/utils/mailer')
const User = require('../../../src/models/user')
const register = require('../../../src/controllers/auth/register')

jest.mock('../../../src/utils/mailer', () => jest.fn())
jest.mock('../../../src/models/user')

// mock injectable logger
const log = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

const userId = 'someMongodbObjectId'
const mockJwt = '09asd098asd098asd098asd'
const foundUser = {
  _id: userId,
  email: 'user@user.com',
  username: 'foundMe',
  likedPosts: []
}
const newUser = {
  username: expect.any(String),
  email: expect.any(String),
  validated: expect.any(String),
  signupKey: expect.any(String),
  generateJWT: jest.fn().mockReturnValue(mockJwt)
}

describe('register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findOne = jest.fn(() => User)
  })

  it('should create a new user', async () => {
    expect.assertions(5)
    User.exec = jest.fn()
    User.prototype.hashPassword = jest.fn()
    User.prototype.save = jest.fn().mockResolvedValue(newUser)
    const body = {
      email: 'test@example.com',
      username: 'newUsername',
      password: 'newPassword'
    }

    const actual = await register({ body, log })
    expect(User.prototype.hashPassword).toHaveBeenCalledTimes(1)
    expect(User.prototype.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(newUser.generateJWT).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(expect.objectContaining({
      profile: expect.any(Object),
      token: expect.any(String)
    }))
  })

  it('should throw if username already exists', async () => {
    expect.assertions(5)
    User.exec = jest.fn().mockResolvedValue(foundUser)
    User.prototype.hashPassword = jest.fn()
    User.prototype.save = jest.fn().mockResolvedValue(newUser)
    const body = {
      email: 'no@no.com',
      username: 'foundMe',
      password: 'password'
    }

    await expect(register({ body, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Username already taken'
      }))
    expect(User.prototype.hashPassword).not.toHaveBeenCalled()
    expect(User.prototype.save).not.toHaveBeenCalled()
    expect(mailer).not.toHaveBeenCalled()
    expect(newUser.generateJWT).not.toHaveBeenCalled()
  })

  it('should call next() w/ error if email already exists', async () => {
    expect.assertions(5)
    User.exec = jest.fn().mockResolvedValue(foundUser)
    User.prototype.hashPassword = jest.fn()
    User.prototype.save = jest.fn().mockResolvedValue(newUser)
    const body = {
      email: 'user@user.com',
      username: 'username',
      password: 'password'
    }

    await expect(register({ body, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Email already registered'
      }))
    expect(User.prototype.hashPassword).not.toHaveBeenCalled()
    expect(User.prototype.save).not.toHaveBeenCalled()
    expect(mailer).not.toHaveBeenCalled()
    expect(newUser.generateJWT).not.toHaveBeenCalled()
  })

  it('should throw if missing username', async () => {
    expect.assertions(1)
    const body = {
      email: 'user@user.com',
      password: 'password'
    }
    await expect(register({ body, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Please complete all required fields'
      }))
  })

  it('should throw if missing email', async () => {
    expect.assertions(1)
    const body = {
      username: 'username',
      password: 'password'
    }
    await expect(register({ body, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Please complete all required fields'
      }))
  })

  it('should throw if missing password', async () => {
    expect.assertions(1)
    const body = {
      email: 'user@user.com',
      username: 'username'
    }
    await expect(register({ body, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Please complete all required fields'
      }))
  })

  it('should handle errors thrown from mailer service', async () => {
    expect.assertions(5)
    User.exec = jest.fn()
    User.prototype.hashPassword = jest.fn()
    User.prototype.save = jest.fn().mockResolvedValue(newUser)
    mailer.mockImplementation(() => {
      throw new Error('mailer barfed')
    })
    const body = {
      email: 'user@user.com',
      username: 'username',
      password: 'password'
    }

    await expect(register({ body, log })).rejects
      .toThrow(expect.objectContaining({
        message: 'mailer barfed'
      }))
    expect(User.prototype.hashPassword).toHaveBeenCalledTimes(1)
    expect(User.prototype.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(newUser.generateJWT).not.toHaveBeenCalled()
  })
})
