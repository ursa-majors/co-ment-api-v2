'use strict'

const User = require('../../models/user')
const sanitize = require('../../utils/sanitizer')
const mailer = require('../../utils/mailer')
const { contactTemplate } = require('../../utils/mailtemplates')
const { makeBoilerplate } = require('../../utils/mailutils')
const { errorWithStatus } = require('../../utils')

/**
 * Send email to another user
 * Secured - valid JWT required
 * Body properties:
 *   {String}  recipient (username)
 *   {String}  sender    (username)
 *   {Boolean} copySender
 *   {String}  subject
 *   {String}  body
 *   {String}  type
 *   {String}  connectionId
 * @returns  {Object}  success message
 */
exports = module.exports = async function sendEmail ({ username, userId, body }) {
  // prohibit users from contacting themselves :)
  if (username === body.recipient) {
    throw errorWithStatus(new Error('You cannot contact yourself!'), 400)
  }

  // find the sender & recipient
  const [sender, recipient] = Promise.all([
    await User.findById(userId).exec(),
    await User.findOne({ username: body.recipient }).exec()
  ])

  if (!recipient) throw errorWithStatus(new Error('Recipient user not found!'), 404)
  if (!sender) throw errorWithStatus(new Error('Sender user not found!'), 404)

  const recipientList = body.copySender
    ? [`${recipient.email};${sender.email}`]
    : recipient.email

  const greeting = body.copySender
    ? `${recipient.username} and ${sender.username}`
    : recipient.username

  const boilerplate = makeBoilerplate(body.type, sender, recipient)

  const emailBody = {
    type: 'html',
    text: contactTemplate(
      greeting,
      sender.username, // fromUser
      sender.email, // fromEmail
      sanitize(body.body), // bodyText
      body.connectionId, // connectionId
      boilerplate.boilerplate, // boilerplate
      boilerplate.recUserId // recUserId
    )
  }

  mailer(recipientList, body.subject, emailBody)
  return { message: 'Message sent successfully.' }
}
