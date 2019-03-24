'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')
const mailer = require('../../utils/mailer')
const emailTpl = require('../../utils/mailtemplates')
const mailUtils = require('../../utils/mailutils')

// SEND PW RESET EMAIL
// Dispatches password reset email
//   Example: POST >> /api/sendresetemail
//   Secured: no
//   Expects:
//     1) request body params : {
//          username : String
//        }
//   Returns: success status & message on success
exports = module.exports = async function sendPwReset (req, res, next) {
  // generate reset key
  const { username } = req.body
  if (!username) return next(errorWithStatus(new Error('Missing required username')), 400)
  const resetKey = mailUtils.makeSignupKey()

  try {
    const user = await User.findOne({ username }).exec()
    if (!user) throw errorWithStatus(new Error('No user with that username'), 404)
    // store password reset key on user
    user.passwordResetKey = resetKey
    await user.save()

    const emailParams = {
      key: user.passwordResetKey.key,
      toEmail: user.email,
      recUserId: user._id
    }

    // send password reset email
    sendPWResetEmail(emailParams)

    return res.status(200).json({ message: 'Password Reset email sent' })
  } catch (err) {
    return next(err)
  }
}

// helpers

/**
 * Dispatch new password reset email
 * @param   {string}   key         randomly generated key
 * @param   {string}   toEmail    user/recipient email address
 * @param   {string}   recUserId  user/recipient _id
 */
function sendPWResetEmail ({ key, toEmail, recUserId }) {
  console.log('pwreset', { key, toEmail, recUserId })
  const url = `https://co-ment.glitch.me/resetpassword/${key}`
  const subject = 'co/ment - Password Reset Request'
  const body = {
    type: 'html',
    text: emailTpl.pwResetTemplate(url, recUserId)
  }

  try {
    mailer(toEmail, subject, body)
    console.log('Email validation sent successfully.')
  } catch (err) {
    throw err
  }
}
