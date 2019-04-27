'use strict'

exports = module.exports = Object.freeze({
  refreshToken: require('./refresh-token'),
  login: require('./login'),
  register: require('./register'),
  validate: require('./validate'),
  sendPwReset: require('./send-password-reset'),
  resetPassword: require('./reset-password')
})
