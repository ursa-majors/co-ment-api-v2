'use strict'

const router = require('express').Router()
const ctrlHandler = require('./controller-handler')
const { authMiddleware } = require('../middleware')
const {
  refreshToken,
  register,
  validate,
  login,
  sendPwReset,
  resetPassword
} = require('../controllers/auth')

// Refresh a user's JWT token
// Used after a user validates their account
router.get('/refreshtoken', [authMiddleware], ctrlHandler(refreshToken, (req) => ({
  userId: req.token._id
})))

// Register new users
router.post('/register', ctrlHandler(register, (req) => ({
  body: req.body,
  log: req.log
})))

// Toggle user's `validated` property to `true`.
// Cannot use ctrlHandler - needs to call res.redirect internally
router.get('/validate', validate)

// Handle user login
router.post('/login', ctrlHandler(login, (req) => ({
  username: req.body.username,
  password: req.body.password
})))

// Handle requests for password reset
router.post('/sendresetemail', ctrlHandler(sendPwReset, (req) => ({
  username: req.body.username,
  log: req.log
})))

// Handle password resets
router.post('/resetpassword', ctrlHandler(resetPassword, (req) => ({
  username: req.body.username,
  password: req.body.password,
  key: req.body.key
})))

exports = module.exports = router
