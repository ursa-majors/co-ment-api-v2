'use strict'

const Conversation = require('../../models/conversation')
const Message = require('../../models/message')
const { errorWithStatus } = require('../../utils')

/**
 * Create a new onversation
 * Secured - valid JWT required
 * request body properties:
 *   {String} recipientId
 *   {String} message
 *   {String} subject
 * @returns  {Object}  success message & conversation object
 */
exports = module.exports = async function createConversation ({ userId, body }) {
  if (!body.recipientId) {
    throw errorWithStatus(new Error('Missing recipient ID.'), 400)
  }

  if (!body.message) {
    throw errorWithStatus(new Error('Missing message.'), 400)
  }

  if (!body.subject) {
    throw errorWithStatus(new Error('Missing subject.'), 400)
  }

  const conversation = new Conversation({
    subject: body.subject,
    participants: [userId, body.recipientId]
  })

  const message = new Message({
    conversation: conversation._id,
    body: body.message,
    author: userId,
    recipient: body.recipientId,
    originatedFrom: 'connection'
  })

  conversation.messages.push(message._id)

  await message.save()
  await conversation.save()
  return { message: 'Conversation started!', conversation }
}
