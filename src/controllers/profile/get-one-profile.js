'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

/**
 * Get a single profile by ID
 * Example: GET >> /api/v2/profiles/597dccac7017890bd8d13cc7
 * Secured - valid JWT required.
 * @returns  {Object}  User profile object
 */
exports = module.exports = async function getOneProfile ({ userId }) {
  const projection = { signupKey: 0, passwordResetKey: 0, hash: 0, salt: 0 }
  const profile = await User.findById(userId, projection).exec()
  if (!profile) throw errorWithStatus(new Error(`User profile not found`), 404)

  return profile
}
