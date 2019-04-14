'use strict'

const Conversation = require('../../../src/models/conversation')
const User = require('../../../src/models/user')
const getConversations = require('../../../src/controllers/conversation/get-conversations')

jest.mock('../../../src/models/conversation', () => jest.fn())
jest.mock('../../../src/models/user', () => jest.fn())

const userId = '09asdlkj232345lkj'
const conversations = [
  {
    _id: 'conversation1Id',
    subject: 'subject1',
    participants: [],
    messages: [{
      unread: true,
      recipient: userId
    }],
    startDate: expect.any(Date),
    populateMessages: jest.fn(function () { return this })
  },
  {
    _id: 'conversation2Id',
    subject: 'subject2',
    participants: [],
    messages: [{
      unread: true,
      recipient: '232345lkj09asdlkj'
    }],
    startDate: expect.any(Date),
    populateMessages: jest.fn(function () { return this })
  }
]

describe('getConversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Conversation.findAllWithParticipants = jest.fn()
    User.findByIdAndUpdate = jest.fn(() => User)
  })

  it('should return a conversation on success', async () => {
    Conversation.findAllWithParticipants.mockResolvedValue(conversations)
    User.exec = jest.fn()

    const actual = await getConversations({ userId })
    expect(actual).toEqual({
      totalMessages: expect.any(Number),
      totalUnreads: expect.any(Number),
      conversations: expect.any(Array)
    })
  })

  it('should throw with 400 status if missing userId', async () => {
    await expect(getConversations({})).rejects
      .toThrow(expect.objectContaining({
        status: 400,
        message: 'Missing required userId'
      }))
  })

  it('should handle DB errors', async () => {
    Conversation.findAllWithParticipants.mockRejectedValue(new Error('Boom'))

    await expect(getConversations({ userId })).rejects
      .toThrow(/Boom/)
  })
})
