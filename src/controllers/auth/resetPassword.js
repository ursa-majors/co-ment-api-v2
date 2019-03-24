'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

// RESET PASSWORD
//   Example: POST >> /api/resetpassword
//   Secured: no
//   Expects:
//     1) request body params : {
//          username : String
//          password : String
//          key      : String
//        }
//   Returns: success status & message on success
exports = module.exports = async function resetPassword (req, res, next) {
  const { username, password, key } = req.body
  if (!username) return next(errorWithStatus(new Error('Missing required username')), 400)
  if (!password) return next(errorWithStatus(new Error('Missing required password')), 400)
  if (!key) return next(errorWithStatus(new Error('Missing required key')), 400)

  try {
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

    return res.status(200).json({ message: 'Password reset successful' })
  } catch (err) {
    return next(err)
  }
}
