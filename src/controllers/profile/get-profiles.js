'use strict'

const User = require('../../models/user')

// GET ALL PROFILES
//   Example: GET >> /api/profiles
//   Secured: yes, valid JWT required.
//   Returns: an array of user profile objects on success
exports = module.exports = async function getProfiles (req, res, next) {
  const projection = { signupKey: 0, passwordResetKey: 0, hash: 0, salt: 0 }
  try {
    const profiles = await User.findAllUsers({ projection })
    return res.status(200).json(profiles)
  } catch (err) {
    return next(err)
  }
}
