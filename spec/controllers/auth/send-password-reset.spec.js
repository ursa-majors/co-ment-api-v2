'use strict'

const _cloneDeep = require('lodash/cloneDeep')
const mailer = require('../../../src/utils/mailer')
const User = require('../../../src/models/user')
const reqResNext = require('../../fixtures/req-res-next')
const sendPwReset = require('../../../src/controllers/auth/send-password-reset')

jest.mock('../../../src/utils/mailer', () => jest.fn())
jest.mock('../../../src/models/user')

const userId = 'someMongodbObjectId'
const foundUser = {
  _id: userId,
  email: 'user@user.com',
  username: 'foundUser',
  save: jest.fn()
}

describe('sendPwReset', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req = _cloneDeep(reqResNext.req)
    res = _cloneDeep(reqResNext.res)
    next = reqResNext.next
    User.findOne = jest.fn(() => User)
  })

  it('should send password reset email', async () => {
    expect.assertions(8)
    req.body.username = 'foundUser'
    User.exec = jest.fn().mockResolvedValue(foundUser)

    await sendPwReset(req, res, next)
    expect(foundUser.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledWith(
      foundUser.email, // toEmail
      'co/ment - Password Reset Request', // subject
      expect.objectContaining({ // body
        type: 'html',
        text: expect.any(String)
      })
    )
    expect(req.log.info).toHaveBeenCalledTimes(2)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password Reset email sent'
    })
  })

  it('should call next() w/ error if username not found', async () => {
    expect.assertions(4)
    req.body.username = 'notFound'
    User.findOne = jest.fn(() => User)
    User.exec = jest.fn() // returns undefined

    await sendPwReset(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: 'No user with that username'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should throw if missing username', () => {
    expect.assertions(4)
    sendPwReset(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: 'Missing required username'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from mailer service', async () => {
    expect.assertions(7)
    req.body.username = 'foundUser'
    User.exec = jest.fn().mockResolvedValue(foundUser)
    mailer.mockImplementation(() => {
      throw new Error('mailer barfed')
    })

    await sendPwReset(req, res, next)
    expect(foundUser.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(req.log.info).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'mailer barfed'
    }))
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })
})
