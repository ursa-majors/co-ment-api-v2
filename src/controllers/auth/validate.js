'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

// HANDLE EMAIL VALIDATION LINKS
// Toggles user's `validated` property to `true`
//   Example: GET >> /api/validate
//   Secured: no
//   Expects:
//     1) request query params
//        * uid : String
//        * key : String
//   Returns: redirect to client-side validation landing page
exports = module.exports = async function validate (req, res, next) {
  const { uid, key } = req.query
  const target = { _id: uid }
  const updates = { validated: true }

  try {
    const updatedUser = await User.updateUser({ target, updates })
    if (!updatedUser) {
      throw errorWithStatus(new Error('No user with that ID found'), 404)
    }

    if (updatedUser.signupKey.key !== key) {
      throw errorWithStatus(new Error('Registration key mismatch'), 400)
    }

    // redirect to client-side validation landing page
    return res.redirect(302, '/#/redirect=validate')
  } catch (err) {
    return next(err)
  }
}
