'use strict'

const Conversation = require('../../models/conversation')
const User = require('../../models/user')
const { populateMessages, errorWithStatus } = require('../../utils')

/**
 * Get all user's conversations with messages & metadata
 * Secured - valid JWT required
 * @returns  {Array}  Of user's conversations with most recent messages
 */
exports = module.exports = async function getConversations ({ userId }) {
  if (!userId) throw errorWithStatus(new Error('Missing required userId'), 400)

  const conversations = await Conversation.findAllWithParticipants({ userId })
    .then(populateMessages)
    .then(addConversationMetadata(userId))

  // set user's alreadyContacted flag to false so they rec
  // reminders of new messages
  const updates = { $set: { 'contactMeta.alreadyContacted': false } }
  await User.findByIdAndUpdate(userId, updates).exec()

  return conversations
}

// helpers

/**
 * Calculate number of unread messages where the user = 'recipient'
 * @param    {array}    messages  array of elements we want to filter
 * @param    {string}   userId    user's _id
 * @returns  {number}             number of unread messages
 */
function countUnreads (messages, userId) {
  return messages.filter(m => m.unread && m.recipient.toString() === userId).length
}

/**
 * Build 'getConversations' response object from conversations array
 * @param    {Array}   convos  array of conversation objects
 * @returns  {Object}          formatted response
*/
const addConversationMetadata = (user) => (convos) => {
  // count all messages
  const totalMessages = convos.reduce((sum, conv) => {
    return sum + conv.messages.length
  }, 0)

  // count user's unread messages over all conversations
  const totalUnreads = convos.reduce((sum, conv) => {
    return sum + countUnreads(conv.messages, user)
  }, 0)

  // remap conversations to include metadata
  const conversations = convos.map(c => ({
    _id: c._id,
    subject: c.subject,
    qtyMessages: c.messages.length,
    qtyUnreads: countUnreads(c.messages, user),
    startDate: c.startDate,
    participants: c.participants,
    latestMessage: c.messages[c.messages.length - 1]
  }))

  return { totalMessages, totalUnreads, conversations }
}
