'use strict'

const Message = require('../../models/message')
const User = require('../../models/user')
const mailer = require('../../utils/mailer')
const { unreadsReminder } = require('../../utils/mailtemplates')
const { errorWithStatus } = require('../../utils')

/**
 * Create a new message in a conversation
 * Triggers check for & send 'unreads available' email to recipient
 * Secured - valid JWT required
 * request body properties:
 *   {String}  recipientId
 *   {String}  conversation
 *   {String}  messageBody
 * @returns  {Object}  new message object
 */
exports = module.exports = async function createMessage ({ userId, body, log }) {
  if (!userId) throw errorWithStatus(new Error('Missing required userId'), 400)
  if (!body) throw errorWithStatus(new Error('Missing required body'), 400)

  const message = new Message({
    conversation: body.conversation,
    body: body.messageBody,
    author: userId,
    recipient: body.recipientId,
    originatedFrom: 'conversation'
  })

  await message.save()
  // call utility to check for and send unreads waiting email
  const didEmail = duckDuckSpam(message.recipient)
  log.info(`${didEmail ? 'Did' : 'Did not'} email ${message.recipient}`)

  return { message: message }
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
