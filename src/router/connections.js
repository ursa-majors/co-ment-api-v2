'use strict'

const router = require('express').Router()
const ctrlHandler = require('./controller-handler')
const {
  getConnections,
  createConnection,
  updateConnection
} = require('../controllers/connection')

const { authMiddleware, checkValidated } = require('../middleware')

router.use([authMiddleware, checkValidated])

// Get all connections where the user is either a mentor or mentee
router.get('/', ctrlHandler(getConnections, (req) => ({
  userId: req.token._id
})))

// Create a new connection record
router.post('/', ctrlHandler(createConnection, (req) => ({
  body: req.body
})))

// Update a connection record's status & status date
router.put('/:id', ctrlHandler(updateConnection, (req) => ({
  connId: req.params.id,
  type: req.body.type
})))

exports = module.exports = router
