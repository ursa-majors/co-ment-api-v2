'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const mailer = require('../../../src/utils/mailer')
const User = require('../../../src/models/user')
const reqResNext = require('../../fixtures/req-res-next')
const register = require('../../../src/controllers/auth/register')

jest.mock('../../../src/utils/mailer', () => jest.fn())
jest.mock('../../../src/models/user')

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
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
    User.findOne = jest.fn(() => User)
  })

  it('should create a new user', async () => {
    expect.assertions(9)
    req.body.email = 'test@example.com'
    req.body.username = 'newUsername'
    req.body.password = 'newPassword'
    User.exec = jest.fn()
    User.prototype.hashPassword = jest.fn()
    User.prototype.save = jest.fn().mockResolvedValue(newUser)

    await register(req, res, next)
    expect(User.prototype.hashPassword).toHaveBeenCalledTimes(1)
    expect(User.prototype.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(req.log.info).toHaveBeenCalledTimes(1)
    expect(newUser.generateJWT).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      profile: expect.any(Object),
      token: expect.any(String)
    }))
  })

  it('should call next() w/ error if username already exists', async () => {
    expect.assertions(4)
    req.body.email = 'no@no.com'
    req.body.username = 'foundMe'
    req.body.password = 'password'
    User.findOne = jest.fn(() => User)
    User.exec = jest.fn().mockResolvedValue(foundUser)

    await register(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Username already taken'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should call next() w/ error if email already exists', async () => {
    expect.assertions(4)
    req.body.email = 'user@user.com'
    req.body.username = 'username'
    req.body.password = 'password'
    User.findOne = jest.fn(() => User)
    User.exec = jest.fn().mockResolvedValue(foundUser)

    await register(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Email already registered'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should throw if missing username', () => {
    expect.assertions(4)
    req.body.email = 'user@user.com'
    req.body.password = 'password'
    register(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Please complete all required fields'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should throw if missing email', () => {
    expect.assertions(4)
    req.body.username = 'username'
    req.body.password = 'password'
    register(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Please complete all required fields'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should throw if missing password', () => {
    expect.assertions(4)
    req.body.email = 'user@user.com'
    req.body.username = 'username'
    register(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Please complete all required fields'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from mailer service', async () => {
    expect.assertions(9)
    req.body.email = 'test@example.com'
    req.body.username = 'newUsername'
    req.body.password = 'newPassword'
    User.exec = jest.fn()
    User.prototype.hashPassword = jest.fn()
    User.prototype.save = jest.fn().mockResolvedValue(newUser)
    mailer.mockImplementation(() => {
      throw new Error('mailer barfed')
    })

    await register(req, res, next)
    expect(User.prototype.hashPassword).toHaveBeenCalledTimes(1)
    expect(User.prototype.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(newUser.generateJWT).not.toHaveBeenCalled()
    expect(req.log.info).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'mailer barfed'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })
})
