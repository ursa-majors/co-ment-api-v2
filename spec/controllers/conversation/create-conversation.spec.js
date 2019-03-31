'use strict'

const Conversation = require('../../../src/models/conversation')
const Message = require('../../../src/models/message')
const createConversation = require('../../../src/controllers/conversation/create-conversation')

jest.mock('../../../src/models/conversation', () => jest.fn())
jest.mock('../../../src/models/message', () => jest.fn())

const userId = '09asdlkj232345lkj'
const body = {
  recipientId: 'j234098sdf897yu098asd',
  message: 'Yo this is my message and stuff',
  subject: 'Subject of my message'
}

describe('createConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return new conversation on success', async () => {
    Conversation.mockImplementation(() => ({
      messages: [],
      save: jest.fn()
    }))
    Message.mockImplementation(() => ({
      save: jest.fn()
    }))
    const actual = await createConversation({ userId, body })
    expect(actual).toEqual({
      message: 'Conversation started!',
      conversation: expect.objectContaining({
        messages: expect.any(Array)
      })
    })
  })

  it('should throw with 400 status if missing recipient ID.', async () => {
    const body = {
      message: 'Yo this is my message and stuff',
      subject: 'Subject of my message'
    }
    await expect(createConversation({ userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing recipient ID.'
      }))
  })
  it('should throw with 400 status if missing message.', async () => {
    const body = {
      recipientId: 'j234098sdf897yu098asd',
      subject: 'Subject of my message'
    }
    await expect(createConversation({ userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing message.'
      }))
  })
  it('should throw with 400 status if missing subject.', async () => {
    const body = {
      recipientId: 'j234098sdf897yu098asd',
      message: 'Yo this is my message and stuff'
    }
    await expect(createConversation({ userId, body })).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing subject.'
      }))
  })
})
