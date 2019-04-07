'use strict'

const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unread: {
    type: Boolean,
    default: true
  },
  originatedFrom: {
    type: String,
    enum: ['connection', 'conversation']
  }
},
{
  timestamps: true
})

/* ================================ METHODS ================================ */

/**
* Finds all messages for a conversation, toggling unread field to false
* @param    {String}  conversationId  Target conversation ID
* @returns  {Array}                   Of updated conversation objects
*/
messageSchema.statics.findByConversationAndRead = function findByConversationAndRead ({ conversationId }) {
  if (!conversationId) throw new Error('Missing required conversationId')

  const updates = { '$set': { 'unread': false } }
  const options = { new: true }

  return this.update({ conversationId }, updates, options).exec()
}

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Message', messageSchema)
