'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

/**
 * Refresh user token
 * Secured - valid JWT required
 * @returns  {Object}  User profile and new JWT
 */
exports = module.exports = async function refreshToken ({ userId }) {
  const user = await User.findById(userId).exec()
  if (!user) {
    throw errorWithStatus(new Error('User not found'), 404)
  }
  const token = user.generateJWT()
  return { profile: user, token }
}
