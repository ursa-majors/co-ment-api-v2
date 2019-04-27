'use strict'

const User = require('../../../src/models/user')
const mailer = require('../../../src/utils/mailer')
const sendEmail = require('../../../src/controllers/contact/send-email')

jest.mock('../../../src/utils/mailer', () => jest.fn())
jest.mock('../../../src/models/user')

const userId = '87asdkhj298asdklhj'
const username = 'UserName'
const body = {
  recipient: 'Recipient',
  copySender: true,
  type: 'request',
  body: 'Some really cool body text',
  connectionId: '098asdlkj234098asdflkjq2',
  subject: 'Connection request yo'
}

const mockSender = {
  username: 'Sender',
  email: 'sender@example.com'
}

const mockRecipient = {
  username: 'Recipient',
  email: 'recipient@example.com'
}

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findById = jest.fn(() => User)
    User.findOne = jest.fn(() => User)
  })

  it('should call mailer and return success message on success', async () => {
    expect.assertions(3)
    User.exec = jest.fn()
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockRecipient)

    const actual = await sendEmail({ username, userId, body })
    expect(actual).toEqual({ message: 'Message sent successfully.' })
    expect(mailer).toHaveBeenCalledTimes(1)
    expect(mailer).toHaveBeenCalledWith(
      expect.any(Array), // recipientList
      expect.any(String), // subject
      expect.objectContaining({ // body
        type: 'html',
        text: expect.any(String)
      })
    )
  })

  it('should throw with 400 status when trying to contact yourself', async () => {
    expect.assertions(3)
    const newBody = { ...body, recipient: username }
    User.exec = jest.fn()

    await expect(sendEmail({ username, userId, body: newBody })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'You cannot contact yourself!'
      }))
    expect(User.exec).not.toHaveBeenCalled()
    expect(mailer).not.toHaveBeenCalled()
  })

  it('should throw with 404 status when recipient not found', async () => {
    expect.assertions(2)
    User.exec = jest.fn()
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(null)

    await expect(sendEmail({ username, userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'Recipient user not found!'
      }))
    expect(mailer).not.toHaveBeenCalled()
  })

  it('should throw with 404 status when sender not found', async () => {
    expect.assertions(2)
    User.exec = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockRecipient)

    await expect(sendEmail({ username, userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'Sender user not found!'
      }))
    expect(mailer).not.toHaveBeenCalled()
  })
})
