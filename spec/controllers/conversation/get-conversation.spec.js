'use strict'

const Conversation = require('../../../src/models/conversation')
const getConversation = require('../../../src/controllers/conversation/get-conversation')

jest.mock('../../../src/models/conversation', () => jest.fn())

const conversationId = '09asdlkj232345lkj'
const conversations = [
  {
    _id: conversationId,
    subject: 'subject',
    participants: [],
    messages: [],
    startDate: expect.any(Date),
    populateMessages: jest.fn(function () { return this })
  }
]

describe('getConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Conversation.findOneWithParticipants = jest.fn()
  })

  it('should return a conversation on success', async () => {
    Conversation.findOneWithParticipants.mockResolvedValue(conversations)

    const actual = await getConversation({ conversationId })
    expect(actual).toEqual(conversations[0])
  })

  it('should throw with 400 status if missing conversationId', async () => {
    await expect(getConversation({})).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required conversationId'
      }))
  })

  it('should throw with 404 status if conversation not found', async () => {
    Conversation.findOneWithParticipants.mockResolvedValue([])

    await expect(getConversation({ conversationId })).rejects
      .toThrow(expect.objectContaining({
        status: 404,
        message: 'Conversation not found'
      }))
  })

  it('should handle DB errors', async () => {
    Conversation.findOneWithParticipants.mockRejectedValue(new Error('Boom'))

    await expect(getConversation({ conversationId })).rejects
      .toThrow(/Boom/)
  })
})
