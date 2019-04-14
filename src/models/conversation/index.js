'use strict'

const mongoose = require('mongoose')
const Message = require('../message')

const conversationSchema = new mongoose.Schema({
  subject: {
    type: String,
    trim: true,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  startDate: {
    type: Date,
    default: new Date().toISOString()
  }
})

/* ================================ METHODS ================================ */

conversationSchema.methods.populateMessages = async function populateMessages () {
  // get all messages for a conversation. Updates 'unread' status to false
  const messages = await Message.findByConversationAndRead({ conversationId: this._id })

  return {
    _id: this._id,
    subject: this.subject,
    participants: this.participants,
    startDate: this.startDate,
    messages
  }
}

conversationSchema.statics.findAllWithParticipants = function findAllWithParticipants ({ userId }) {
  if (!userId) throw new Error('Missing required userId')

  return this.find({ participants: userId })
    .select('subject startDate messages participants')
    .populate({
      path: 'participants',
      select: 'username name avatarUrl'
    })
    .exec()
}

conversationSchema.statics.findOneWithParticipants = function findOneWithParticipants ({ conversationId }) {
  if (!conversationId) throw new Error('Missing required conversationId')

  return this.find({ _id: conversationId })
    .limit(1)
    .select('subject startDate messages participants')
    .populate({
      path: 'participants',
      select: 'username name avatarUrl'
    })
    .exec()
}

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Conversation', conversationSchema)
