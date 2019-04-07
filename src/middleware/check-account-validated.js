'use strict'

const { errorWithStatus } = require('../utils')

// Checks wheather user has validated their account.
// If `validated: false`, bail out early.
exports = module.exports = (req, res, next) => {
  if (!req.token.validated) {
    const validatedErrMsg = `
      You need to validate your account before you can access this resource.
      Please visit your Profile and generate a new validation email.
    `
    const err = errorWithStatus(new Error(validatedErrMsg), 403)
    return next(err)
  }
  return next()
}
