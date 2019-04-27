'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

/**
 * Reset user password
 * @returns  {Object}  success message
 */
exports = module.exports = async function resetPassword ({ username, password, key }) {
  if (!username) throw errorWithStatus(new Error('Missing required username'), 400)
  if (!password) throw errorWithStatus(new Error('Missing required password'), 400)
  if (!key) throw errorWithStatus(new Error('Missing required key'), 400)

  const user = await User.findOne({ username }).exec()
  if (!user) {
    throw errorWithStatus(new Error('No user with that username'), 404)
  }
  if (user.passwordResetKey.key !== key) {
    throw errorWithStatus(new Error('Invalid password reset key'), 400)
  }

  // reset password, clear the key, save the user
  user.hashPassword(password)
  user.passwordResetKey = {}
  await user.save()

  return { message: 'Password reset successful' }
}
