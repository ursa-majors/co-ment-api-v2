'use strict'

const Conversation = require('../../models/conversation')
const { populateMessages, errorWithStatus } = require('../../utils')

// GET A CONVERSATION WITH MESSAGES
//   Example: GET >> /api/conversations/:id
//   Secured: yes, valid JWT required
//   Expects:
//     1) conversation '_id' from the request params
//   Returns: conversation object with nested array of messages
exports = module.exports = async function getConversation ({ conversationId }) {
  if (!conversationId) throw errorWithStatus(new Error('Missing required conversationId'), 400)
  const [conversation] = await Conversation.findOneWithParticipants({ conversationId })
  if (!conversation) throw errorWithStatus(new Error('Conversation not found'), 404)

  return populateMessages(conversation)
}
