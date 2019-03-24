'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')
const sanitize = require('../../utils/sanitizer')
const mailer = require('../../utils/mailer')
const emailTpl = require('../../utils/mailtemplates')
const { makeBoilerplate } = require('../../utils/mailutils')

// SEND EMAIL
//   Example: POST >> /api/sendemail
//   Secured: yes, valid JWT required
//   Expects:
//     1) sender's username' from JWT token
//     2) request body properties : {
//          recipient    : String (username)
//          sender       : String (username)
//          copySender   : Boolean
//          subject      : String
//          body         : String
//          type         : String
//          connectionId : String
//        }
//   Returns: success message on success
exports = module.exports = async function sendEmail (req, res, next) {
  // prohibit users from contacing themselves
  if (req.token.username === req.body.recipient) {
    return res.status(400).json({ message: 'You cannot contact yourself!' })
  }

  try {
    // find the sender & recipient
    const [sender, recipient] = Promise.all([
      await User.findById(req.token._id).exec(),
      await User.findOne({ username: req.body.recipient }).exec()
    ])

    if (!recipient) throw errorWithStatus(new Error('Recipient user not found!'), 404)
    if (!sender) throw errorWithStatus(new Error('Sender user not found!'), 404)

    const recipientList = req.body.copySender
      ? [`${recipient.email};${sender.email}`]
      : recipient.email

    const greeting = req.body.copySender
      ? `${recipient.username} and ${sender.username}`
      : recipient.username

    const boilerplate = makeBoilerplate(req.body.type, sender, recipient)

    const body = {
      type: 'html',
      text: emailTpl.contactTemplate(
        greeting,
        sender.username, // fromUser
        sender.email, // fromEmail
        sanitize(req.body.body), // bodyText
        req.body.connectionId, // connectionId
        boilerplate.boilerplate, // boilerplate
        boilerplate.recUserId // recUserId
      )
    }

    mailer(recipientList, req.body.subject, body)
    return res.status(200).json({ message: 'Message sent successfully.' })
  } catch (err) {
    return next(err)
  }
}
