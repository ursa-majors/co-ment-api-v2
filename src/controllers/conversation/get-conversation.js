'use strict'

const Conversation = require('../../models/conversation')
const { populateMessages } = require('../../utils')

// GET A CONVERSATION WITH MESSAGES
//   Example: GET >> /api/conversations/:id
//   Secured: yes, valid JWT required
//   Expects:
//     1) conversation '_id' from the request params
//   Returns: conversation object with nested array of messages
exports = module.exports = async function getConversation (req, res, next) {
  const conversationId = req.params.id
  try {
    const [conversation] = await Conversation.findOneWithParticipants({ conversationId })
      .then(populateMessages)
    res.status(200).json(conversation)
  } catch (err) {
    return next(err)
  }
}
