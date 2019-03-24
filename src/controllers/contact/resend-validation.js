'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')
const mailer = require('../../utils/mailer')
const emailTpl = require('../../utils/mailtemplates')
const { makeSignupKey, makeValidationUrl } = require('../../utils/mailutils')

// RESEND VALIDATION EMAIL
//   Example: GET >> /api/resendvalidation
//   Secured: yes, valid JWT required
//   Expects:
//     1) '_id' from JWT token
//   Returns: success message on success
exports = module.exports = async function resendValidation (req, res, next) {
  const target = { _id: req.token._id }
  const updates = { signupKey: makeSignupKey() }
  const options = { new: true }

  try {
    const user = await User.findOneAndUpdate(target, updates, options).exec()
    if (!user) throw errorWithStatus(new Error('User not found'), 404)

    const url = makeValidationUrl(user._id, user.signupKey.key)
    const subject = 'co/ment - Email verification required'
    const body = {
      type: 'html',
      text: emailTpl.validationTemplate(url, user._id)
    }

    mailer(user.email, subject, body)
    return res.status(200).json({ message: 'Email validation sent successfully.' })
  } catch (err) {
    return next(err)
  }
}
