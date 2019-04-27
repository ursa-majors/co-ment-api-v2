'use strict'

const Message = require('../../../src/models/message')
const User = require('../../../src/models/user')
const mailer = require('../../../src/utils/mailer')
const createMessage = require('../../../src/controllers/conversation/create-message')

jest.mock('../../../src/models/message', () => jest.fn())
jest.mock('../../../src/models/user', () => jest.fn())
jest.mock('../../../src/utils/mailer')

const log = {
  info: jest.fn()
}
const userId = '765xcvuyt1234'
const body = {
  recipientId: '098asd123klhj',
  conversation: '123lkj876sdffds',
  messageBody: 'Some message body'
}

describe('createMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    User.findById = jest.fn(() => User)
  })

  it('should return a conversation on success', async () => {
    const foundUser = {
      username: 'username',
      email: 'user@example.com',
      contactMeta: { alreadyContacted: false },
      save: jest.fn()
    }
    const mockMessage = {
      conversation: body.conversation,
      body: body.messageBody,
      author: userId,
      recipient: body.recipientId,
      originatedFrom: userId,
      save: jest.fn().mockResolvedValue()
    }
    Message.mockImplementation(() => mockMessage)
    User.exec = jest.fn().mockResolvedValue(foundUser)

    const actual = await createMessage({ userId, body, log })
    expect(actual).toEqual({ message: mockMessage })
  })

  it('should throw with 400 status if missing userId', async () => {
    await expect(createMessage({ body, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required userId'
      }))
  })

  it('should throw with 400 status if missing body', async () => {
    await expect(createMessage({ userId, log })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required body'
      }))
  })

  it('should handle Message DB errors', async () => {
    Message.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Boom'))
    }))

    await expect(createMessage({ userId, body, log })).rejects
      .toThrow(/Boom/)
  })

  it('should handle User DB errors', async () => {
    Message.mockImplementation(() => ({
      save: jest.fn()
    }))
    User.exec = jest.fn().mockRejectedValue(new Error('Boom'))

    await expect(createMessage({ userId, body, log })).rejects
      .toThrow(/Boom/)
  })

  it('should handle mailer errors', async () => {
    const foundUser = {
      username: 'username',
      email: 'user@example.com',
      contactMeta: { alreadyContacted: false },
      save: jest.fn()
    }
    const mockMessage = {
      conversation: body.conversation,
      body: body.messageBody,
      author: userId,
      recipient: body.recipientId,
      originatedFrom: userId,
      save: jest.fn().mockResolvedValue()
    }
    Message.mockImplementation(() => mockMessage)
    User.exec = jest.fn().mockResolvedValue(foundUser)
    mailer.mockRejectedValue(new Error('mailer barfed'))

    await expect(createMessage({ userId, body, log })).rejects
      .toThrow(/mailer barfed/)
  })
})
