'use strict'

const User = require('../../models/user')
const mailer = require('../../utils/mailer')
const { errorWithStatus } = require('../../utils')
const { validationTemplate } = require('../../utils/mailtemplates')
const { makeSignupKey, makeValidationUrl } = require('../../utils/mailutils')

/**
 * Resend user profile validation email
 * Secured - valid JWT required
 * @returns  {Object}  Success message
 */
exports = module.exports = async function resendValidation ({ userId }) {
  const target = { _id: userId }
  const updates = { signupKey: makeSignupKey() }
  const options = { new: true }

  const user = await User.findOneAndUpdate(target, updates, options).exec()
  if (!user) throw errorWithStatus(new Error('User not found'), 404)

  const url = makeValidationUrl(user._id, user.signupKey.key)
  const subject = 'co/ment - Email verification required'
  const body = {
    type: 'html',
    text: validationTemplate(url, user._id)
  }

  mailer(user.email, subject, body)
  return { message: 'Email validation sent successfully.' }
}
