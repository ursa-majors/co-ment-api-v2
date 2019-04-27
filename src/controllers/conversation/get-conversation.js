'use strict'

const Conversation = require('../../models/conversation')
const { errorWithStatus } = require('../../utils')

/**
 * Get a single conversation by ID, with its participants & messages
 * Secured - valid JWT required
 * @returns  {Object}  Conversation with nested array of message objects
 */
exports = module.exports = async function getConversation ({ conversationId }) {
  if (!conversationId) throw errorWithStatus(new Error('Missing required conversationId'), 400)

  const [conversation] = await Conversation.findOneWithParticipants({ conversationId })
  if (!conversation) throw errorWithStatus(new Error('Conversation not found'), 404)

  return conversation.populateMessages()
}
