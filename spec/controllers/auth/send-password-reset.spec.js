'use strict'

const mailer = require('../../../src/utils/mailer')
const User = require('../../../src/models/user')
const sendPwReset = require('../../../src/controllers/auth/send-password-reset')

jest.mock('../../../src/utils/mailer', () => jest.fn())
jest.mock('../../../src/models/user')

// injectable mock logger
const log = { info: jest.fn() }
const userId = 'someMongodbObjectId'
const foundUser = {
  _id: userId,
  email: 'user@user.com',
  username: 'foundUser',
  save: jest.fn()
}

describe('sendPwReset', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findOne = jest.fn(() => User)
  })

  it('should send password reset email', async () => {
    expect.assertions(4)
    const username = 'foundUser'
    User.exec = jest.fn().mockResolvedValue(foundUser)

    const actual = await sendPwReset({ username, log })
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
    expect(actual).toEqual({
      message: 'Password Reset email sent'
    })
  })

  it('should throw with 404 status if username not found', async () => {
    expect.assertions(2)
    const username = 'notFound'
    User.exec = jest.fn() // returns undefined

    await expect(sendPwReset({ username, log })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'No user with that username'
      }))
    expect(mailer).not.toHaveBeenCalled()
  })

  it('should throw with 400 status if missing username', async () => {
    expect.assertions(2)
    await expect(sendPwReset({ log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required username'
      }))
    expect(mailer).not.toHaveBeenCalled()
  })

  it('should handle errors thrown from mailer service', async () => {
    expect.assertions(4)
    const username = 'foundUser'
    User.exec = jest.fn().mockResolvedValue(foundUser)
    mailer.mockImplementation(() => {
      throw new Error('mailer barfed')
    })

    await expect(sendPwReset({ username, log })).rejects
      .toThrow(expect.objectContaining({
        message: 'mailer barfed'
      }))
    expect(foundUser.save).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(log.info).toHaveBeenCalledTimes(1)
  })
})
