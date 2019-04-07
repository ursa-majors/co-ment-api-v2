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
  // get all messages for a conversation, updating their 'unread' status = false
  const messages = await Message.findByConversationAndRead({ conversationId: this._id })

  return {
    _id: this._id,
    subject: this.subject,
    participants: this.participants,
    startDate: this.startDate,
    messages
  }
}

conversationSchema.statics.updateUnreadStatus = function findAllWithParticipants ({ userId }) {
  if (!userId) throw new Error('Missing required userId')

  const filter = { participants: userId }

  return this.find(filter)
    .select('subject startDate messages participants')
    .populate({
      path: 'participants',
      select: 'username name avatarUrl'
    })
    .exec()
}

conversationSchema.statics.findAllWithParticipants = function findOneWithParticipants ({ conversationId }) {
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

conversationSchema.statics.findOneWithParticipants = function updateUnreadStatus ({ target, status }) {
  const updates = { '$set': { 'unread': status } }
  const options = { new: true }

  return this.findOneAndUpdate(target, updates, options).exec()
}

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Conversation', conversationSchema)
