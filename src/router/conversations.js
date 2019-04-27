'use strict'

const router = require('express').Router()
const ctrlHandler = require('./controller-handler')
const {
  getConversations,
  getConversation,
  createConversation,
  createMessage
} = require('../controllers/conversation')

const { authMiddleware, checkValidated } = require('../middleware')

router.use([authMiddleware, checkValidated])

// Get a list of a user's conversations
router.get('/', ctrlHandler(getConversations, (req) => ({
  userId: req.token._id
})))

// Get a conversation with its messages
router.get('/:id', ctrlHandler(getConversation, (req) => ({
  conversationId: req.params.id
})))

// Create a new conversation
router.post('/', ctrlHandler(createConversation, (req) => ({
  userId: req.token._id,
  body: req.body
})))

// Create a new message
router.post('/messages', ctrlHandler(createMessage, (req) => ({
  userId: req.token._id,
  body: req.body,
  log: req.log
})))

/* ================================ EXPORT ================================= */

module.exports = router
