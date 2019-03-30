'use strict'

const passport = require('passport')
const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

// LOGIN
//   Example: POST >> /api/login
//   Secured: no
//   Expects:
//     1) request body params : {
//          username : String
//          password : String
//        }
//   Returns: success status, user profile & JWT on success
//
exports = module.exports = async function login (req, res, next) {
  // ensure required inputs exist
  const { username, password } = req.body
  if (!username) return next(errorWithStatus(new Error('Missing required username'), 400))
  if (!password) return next(errorWithStatus(new Error('Missing required password'), 400))

  passport.authenticate('local', async (err, user, info) => {
    if (err) { return next(err) }

    // if auth failed, there will be no user - fail
    if (!user) {
      return res.status(401).json(info)
    }

    try {
      const projection = { hash: 0, salt: 0, signupKey: 0 }
      const profile = await User.findById(user._id, projection).exec()
      if (!profile) throw errorWithStatus(new Error('User not found'), 404)
      // generate JWT and respond
      const token = profile.generateJWT()
      return res.status(200).json({ profile, token })
    } catch (err) {
      return next(err)
    }
  })(req, res, next)
}
