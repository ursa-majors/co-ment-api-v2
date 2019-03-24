'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

// REFRESH USER TOKEN
//   Example: GET >> /auth/refresh_token
//   Secured: yes, valid JWT required
//   Expects:
//     1) '_id' from JWT
//   Returns: user profile and new JWT on success
exports = module.exports = async function refreshToken (req, res, next) {
  try {
    const user = await User.findById(req.token._id).exec()
    if (!user) {
      return next(errorWithStatus(new Error('User not found'), 404))
    }
    const token = user.generateJWT()
    return res.status(200).json({ profile: user, token })
  } catch (err) {
    return next(err)
  }
}
