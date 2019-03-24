'use strict'

const Message = require('../../models/message')
const User = require('../../models/user')
const mailer = require('../../utils/mailer')
const { unreadsReminder } = require('../../utils/mailtemplates')

// CREATE NEW MESSAGE
//   Example: POST >> /api/messages
//   Secured: yes, valid JWT required
//   Expects:
//     1) user '_id' from JWT token
//     2) request body properties
//          recipientId  : String
//          conversation : String
//          messageBody  : String
//        }
//   Returns: new message object
//   Triggers check for & send 'unreads available' email to recipient
exports = module.exports = async function createMessage (req, res, next) {
  const message = new Message({
    conversation: req.body.conversation,
    body: req.body.messageBody,
    author: req.token._id,
    recipient: req.body.recipientId,
    originatedFrom: 'conversation'
  })

  try {
    await message.save()
    // call utility to check for and send unreads waiting email
    const didEmail = duckDuckSpam(message.recipient)
    req.log.info(`${didEmail ? 'Did' : 'Did not'} email ${message.recipient}`)

    return res.status(200).json({ message: message })
  } catch (err) {
    return next(err)
  }
}

// helpers

/**
 * Dispatch reminder email if user's alreadyContacted = false
 * @param    {String}   recipient  recipient's user _id
 * @returns  {Boolean}             True if recipient was emailed
 */
async function duckDuckSpam (recipient) {
  const projection = {
    username: 1,
    email: 1,
    'contactMeta.alreadyContacted': 1
  }

  try {
    const user = await User.findById(recipient, projection).exec()
    if (!user || user.contactMeta.alreadyContacted) return false

    sendReminderEmail({ to_name: user.username, to_email: user.email })

    // update user's `contactMeta.alreadyContacted` field
    user.contactMeta.alreadyContacted = true
    await user.save()
    return true
  } catch (err) {
    throw err
  }
}

function sendReminderEmail (params) {
  const url = 'https://co-ment-dev.glitch.me/inbox'
  const subject = 'co/ment - New unread messages'
  const body = {
    type: 'html',
    text: unreadsReminder(url, params.to_name)
  }

  // send mail using `mailer` util
  try {
    mailer(params.to_email, subject, body)
    console.log(`emailing: ${params.to_email} unread messages reminder.`)
  } catch (err) {
    throw err
  }
}
