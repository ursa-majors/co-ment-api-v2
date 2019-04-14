const _cloneDeep = require('lodash/cloneDeep')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Message = require('../../src/models/message')

describe(`Message model`, () => {
  let mess
  const mockMessage = {
    conversation: ObjectId('111f111e111c11111de860ea'),
    body: 'mock body',
    subject: 'mock subject',
    author: ObjectId('222f222e222c22222de860ea'),
    recipient: ObjectId('333f333e333c33333de860ea'),
    unread: true,
    originatedFrom: 'connection'
  }

  beforeEach(() => {
    mess = _cloneDeep(mockMessage)
  })

  it(`should validate 'conversation' existence`, async () => {
    delete mess.conversation
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed.*conversation.*required/)
  })

  it(`should validate 'conversation' type`, async () => {
    mess.conversation = 'wrong type'
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: conversation/)
  })

  it(`should validate 'body' existence`, async () => {
    delete mess.body
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed.*body.*required/)
  })

  it(`should validate 'body' type`, async () => {
    mess.body = { wrong: 'type' }
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: body/)
  })

  it(`should validate 'subject' type`, async () => {
    mess.subject = { wrong: 'type' }
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: subject/)
  })

  it(`should validate 'author' type`, async () => {
    mess.author = 'wrong type'
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: author/)
  })

  it(`should validate 'recipient' type`, async () => {
    mess.recipient = 'wrong type'
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: recipient/)
  })

  it(`should validate 'unread' type`, async () => {
    mess.unread = 'wrong type'
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: unread/)
  })

  it(`should validate 'originatedFrom' type`, async () => {
    mess.originatedFrom = 'invalid enum'
    const m = new Message(mess)
    await expect(m.validate()).rejects
      .toThrow(/Message validation failed: originatedFrom/)
  })
})

describe(`Message model static methods`, () => {
  beforeAll(() => {
    Message.update = jest.fn(() => Message)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`.findByConversationAndRead()`, () => {
    it(`should return an array of messages setting 'unread' to false`, async () => {
      const conversationId = '111f111e111c11111de860ea'
      Message.exec = jest.fn().mockResolvedValue(expect.any(Array))
      const actual = await Message.findByConversationAndRead({ conversationId })
      expect(actual).toEqual(expect.any(Array))
      expect(Message.update).toHaveBeenCalledTimes(1)
      expect(Message.update).toHaveBeenCalledWith(
        { conversationId },
        { '$set': { 'unread': false } },
        { new: true }
      )
    })

    it(`should throw if missing required 'conversationId' param`, () => {
      expect(() => Message.findByConversationAndRead({}))
        .toThrow(/Missing required conversationId/)
    })
  })
})
