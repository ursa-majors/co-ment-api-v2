'use strict'

const User = require('../../models/user')

/**
 * Get all profiles
 * Secured - valid JWT required.
 * @returns  {Array}  Of user profile objects on success
 */
exports = module.exports = async function getProfiles () {
  const projection = { signupKey: 0, passwordResetKey: 0, hash: 0, salt: 0 }
  const profiles = await User.find({}, projection).exec()
  return profiles
}
