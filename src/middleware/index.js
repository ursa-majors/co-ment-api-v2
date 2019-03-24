'use strict'

exports = module.exports = Object.freeze({
  requestMiddleware: require('./request'),
  loggerMiddleware: require('./logger'),
  errorMiddleware: require('./error-handler'),
  checkValidated: require('./check-account-validated'),
  passportLocalStrategy: require('./passport-local-strategy'),
  corsMiddleware: require('./cors'),
  forceHttpsMiddleware: require('./force-https'),
  authMiddleware: require('./verify-auth')
})
