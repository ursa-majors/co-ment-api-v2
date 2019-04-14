const _cloneDeep = require('lodash/cloneDeep')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Conversation = require('../../src/models/conversation')
const Message = require('../../src/models/message')

const mockConversation = {
  subject: 'mockConversationSubject',
  participants: [
    ObjectId('456f456e810c19729de860ea'),
    ObjectId('123f123e810c19729de860eb')
  ],
  messages: [
    ObjectId('111f111e810c19729de860eb'),
    ObjectId('222f222e810c19729de860eb')
  ],
  startDate: new Date()
}
const mockMessages = [{ _id: '111' }, { _id: '222' }]

describe(`Conversation model`, () => {
  let conv

  beforeEach(() => {
    conv = _cloneDeep(mockConversation)
  })

  it(`should validate 'subject'`, async () => {
    delete conv.subject
    const c = new Conversation(conv)
    await expect(c.validate()).rejects
      .toThrow(/Conversation validation failed.*subject.*required/)
  })

  it(`should validate 'participants'`, async () => {
    conv.participants[0] = 'some non-ObjectID string'
    const c = new Conversation(conv)
    await expect(c.validate()).rejects
      .toThrow(/Conversation validation failed: participants/)
  })

  it(`should validate 'messages'`, async () => {
    conv.messages[0] = 'some non-ObjectID string'
    const c = new Conversation(conv)
    await expect(c.validate()).rejects
      .toThrow(/Conversation validation failed: messages/)
  })

  it(`should validate 'startDate'`, async () => {
    conv.startDate = { hey: 'Not a date' }
    const c = new Conversation(conv)
    await expect(c.validate()).rejects
      .toThrow(/Conversation validation failed: startDate/)
  })
})

describe(`Conversation model instance methods`, () => {
  let conv
  beforeAll(() => {
    Message.findByConversationAndRead = jest.fn().mockResolvedValue(mockMessages)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    conv = _cloneDeep(mockConversation)
  })

  describe(`.populateMessages()`, () => {
    it(`should add messages to a conversation`, async () => {
      const conversation = new Conversation(conv)
      const actual = await conversation.populateMessages()
      expect(actual._id).toEqual(expect.any(ObjectId))
      expect(actual.subject).toEqual(mockConversation.subject)
      expect(actual.participants.length).toEqual(2)
      expect(actual.startDate).toEqual(mockConversation.startDate)
      expect(actual.messages).toEqual(mockMessages)
    })
  })
})

describe(`Conversation model static methods`, () => {
  beforeAll(() => {
    Conversation.find = jest.fn(() => Conversation)
    Conversation.limit = jest.fn(() => Conversation)
    Conversation.select = jest.fn(() => Conversation)
    Conversation.populate = jest.fn(() => Conversation)
    Conversation.findOneAndUpdate = jest.fn(() => Conversation)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`.findAllWithParticipants()`, () => {
    it(`should return array of conversations with participants`, async () => {
      expect.assertions(5)
      const userId = '456f456e810c19729de860ea'
      Conversation.exec = jest.fn().mockResolvedValue(expect.any(Array))
      const actual = await Conversation.findAllWithParticipants({ userId })
      expect(actual).toEqual(expect.any(Array))
      expect(Conversation.find).toHaveBeenCalledTimes(1)
      expect(Conversation.find).toHaveBeenCalledWith({ participants: userId })
      expect(Conversation.select).toHaveBeenCalledTimes(1)
      expect(Conversation.populate).toHaveBeenCalledTimes(1)
    })

    it(`should throw when missing required 'userId' param`, () => {
      expect(() => Conversation.findAllWithParticipants({}))
        .toThrow(/Missing required userId/)
      expect(Conversation.find).not.toHaveBeenCalled()
    })
  })

  describe(`.findOneWithParticipants()`, () => {
    it(`should return a conversation with its participants`, async () => {
      expect.assertions(6)
      const conversationId = '456f456e810c19729de860ea'
      Conversation.exec = jest.fn().mockResolvedValue(expect.any(Array))
      const actual = await Conversation.findOneWithParticipants({ conversationId })
      expect(actual).toEqual(expect.any(Array))
      expect(Conversation.find).toHaveBeenCalledTimes(1)
      expect(Conversation.find).toHaveBeenCalledWith({ _id: conversationId })
      expect(Conversation.limit).toHaveBeenCalledTimes(1)
      expect(Conversation.select).toHaveBeenCalledTimes(1)
      expect(Conversation.populate).toHaveBeenCalledTimes(1)
    })

    it(`should throw when missing required 'conversationId' param`, () => {
      expect(() => Conversation.findOneWithParticipants({}))
        .toThrow(/Missing required conversationId/)
      expect(Conversation.find).not.toHaveBeenCalled()
      expect(Conversation.limit).not.toHaveBeenCalled()
      expect(Conversation.select).not.toHaveBeenCalled()
      expect(Conversation.populate).not.toHaveBeenCalled()
    })
  })
})
