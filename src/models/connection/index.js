const mongoose = require('mongoose')

/* ================================ SCHEMA ================================= */

const connectionSchema = new mongoose.Schema({
  conversationId: { type: String },
  mentor: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  mentee: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  initiator: {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },
  dateAccepted: { type: Date },
  dateDeclined: { type: Date },
  dateStarted: { type: Date },
  dateEnded: { type: Date },
  originalPost: {
    id: { type: String, required: true },
    title: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'inactive'],
    default: 'pending'
  }
})

/* ================================ METHODS ================================ */

connectionSchema.statics.findOwnConnections = function findOwnConnections ({ target }) {
  if (!target) throw new Error('Missing required target param')

  const filter = { $or: [{ 'mentor.id': target }, { 'mentee.id': target }] }
  return this.find(filter).exec()
}

connectionSchema.statics.updateConnectionStatus = function updateConnectionStatus ({ target, type }) {
  if (!target) throw new Error('Missing required target')
  if (!type) throw new Error('Missing required type')

  const status = this.getStatusFromType(type)
  const options = { new: true } // return updated document
  return this.findOneAndUpdate(target, status, options).exec()
}

connectionSchema.statics.getStatusFromType = function getStatusFromType (type) {
  switch (type) {
    case 'ACCEPT': return { status: 'accepted', dateAccepted: Date.now() }
    case 'DECLINE': return { status: 'declined', dateDeclined: Date.now() }
    case 'DEACTIVATE': return { status: 'inactive', dateExpired: Date.now() }
    default: return {}
  }
}

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Connection', connectionSchema)
