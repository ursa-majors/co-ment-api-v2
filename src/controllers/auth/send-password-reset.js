'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')
const mailer = require('../../utils/mailer')
const emailTpl = require('../../utils/mailtemplates')
const mailUtils = require('../../utils/mailutils')

/**
 * Send password reset email
 * Secured: no
 * @returns  {Object}  Success message
 */
exports = module.exports = async function sendPwReset ({ username, log }) {
  if (!username) throw errorWithStatus(new Error('Missing required username'), 400)

  const user = await User.findOne({ username }).exec()
  if (!user) throw errorWithStatus(new Error('No user with that username'), 404)

  // generate & store new password reset key on user
  user.passwordResetKey = mailUtils.makeSignupKey()
  await user.save()

  const emailParams = {
    key: user.passwordResetKey.key,
    toEmail: user.email,
    recUserId: user._id
  }

  sendPWResetEmail(log, emailParams)

  return { message: 'Password Reset email sent' }
}

// helpers

/**
 * Dispatch new password reset email
 * @param  {String}  key         randomly generated key
 * @param  {String}  toEmail    user/recipient email address
 * @param  {String}  recUserId  user/recipient _id
 */
function sendPWResetEmail (logger, { key, toEmail, recUserId }) {
  logger.info({ key, toEmail, recUserId }, 'Sending PW reset email')
  const url = `https://co-ment.glitch.me/resetpassword/${key}`
  const subject = 'co/ment - Password Reset Request'
  const body = {
    type: 'html',
    text: emailTpl.pwResetTemplate(url, recUserId)
  }

  try {
    mailer(toEmail, subject, body)
    logger.info('Email validation sent successfully.')
  } catch (err) {
    throw err
  }
}
