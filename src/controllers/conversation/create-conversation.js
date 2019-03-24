'use strict'

const Conversation = require('../../models/conversation')
const Message = require('../../models/message')

/* ============================ ROUTE HANDLERS ============================= */

// CREATE NEW CONVERSATION
//   Example: POST >> /api/conversations
//   Secured: yes, valid JWT required
//   Expects:
//     1) user '_id' from JWT token
//     2) request body properties
//          recipientId : String
//          message     : String
//          subject     : String
//        }
//   Returns: success message on success
exports = module.exports = async function createConversation (req, res, next) {
  if (!req.body.recipientId) {
    return res.status(400).json({ message: 'Missing recipient ID.' })
  }

  if (!req.body.message) {
    return res.status(400).json({ message: 'Missing message.' })
  }

  if (!req.body.subject) {
    return res.status(400).json({ message: 'Missing subject.' })
  }

  const conversation = new Conversation({
    subject: req.body.subject,
    participants: [req.token._id, req.body.recipientId]
  })

  const message = new Message({
    conversation: conversation._id,
    body: req.body.message,
    author: req.token._id,
    recipient: req.body.recipientId,
    originatedFrom: 'connection'
  })

  conversation.messages.push(message._id)

  try {
    await message.save()
    await conversation.save()
    return res.status(200).json({ message: 'Conversation started!', conversation })
  } catch (err) {
    return next(err)
  }
}
