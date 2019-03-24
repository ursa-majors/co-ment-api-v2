'use strict'

const User = require('../../models/user')

// GET ONE PROFILE
//   Example: GET >> /api/profile/597dccac7017890bd8d13cc7
//   Secured: yes, valid JWT required.
//   Expects:
//     1) '_id' from request params
//   Returns: user profile object on success
exports = module.exports = async function getOneProfile (req, res, next) {
  const projection = { signupKey: 0, passwordResetKey: 0, hash: 0, salt: 0 }
  const userId = req.params.id

  try {
    const profile = await User.findUserById({ userId, projection })
    if (!profile) {
      return res.status(404).json({ userId, message: `User profile not found` })
    }
    return res.status(200).json(profile)
  } catch (err) {
    return next(err)
  }
}
