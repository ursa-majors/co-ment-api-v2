'use strict'

const Message = require('../models/message')

/**
 * Add array of messages to conversations. Happens when a user gets a
 * conversation. Like a "read" event, so we also set message 'unread' to false.
 * @param    {object}  convo   conversation object
 * @param    {string}  user    user's '_id'
 * @returns  {object}          conversation with its messages
 */
exports = module.exports = async function populateMessages (convo) {
  // get all messages for a conversation, updating their 'unread' status = false
  const messages = await Message.findByConversationAndRead({ conversationId: convo._id })

  return {
    _id: convo._id,
    subject: convo.subject,
    participants: convo.participants,
    startDate: convo.startDate,
    messages
  }
}
