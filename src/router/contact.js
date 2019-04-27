'use strict'

const router = require('express').Router()
const ctrlHandler = require('./controller-handler')
const { authMiddleware, checkValidated } = require('../middleware')
const {
  resendValidation,
  sendEmail
} = require('../controllers/contact')

// Check and validate JWT token -- applies to all API routes
router.use(authMiddleware)

// Resend user validation email
router.get('/resendvalidation', ctrlHandler(resendValidation, (req) => ({
  userId: req.token._id
})))

// Send contact email to another user
// User must be validated
router.post('/sendemail', [checkValidated], ctrlHandler(sendEmail, (req) => ({
  username: req.token.username,
  userId: req.token._id,
  body: req.body
})))

exports = module.exports = router
