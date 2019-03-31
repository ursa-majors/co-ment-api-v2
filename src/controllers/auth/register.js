'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')
const mailer = require('../../utils/mailer')
const emailTpl = require('../../utils/mailtemplates')
const mailUtils = require('../../utils/mailutils')

// NEW_USER REGISTRATION
// Dispatches new user validation email
//   Example: POST >> /api/register
//   Secured: no
//   Expects:
//     1) request body properties : {
//          username : String
//          password : String
//          email    : String
//        }
//   Returns: user profile object & JWT on success
exports = module.exports = async function register ({ body, log }) {
  // ensure required inputs exist
  if (!body.username || !body.password || !body.email) {
    throw errorWithStatus(new Error('Please complete all required fields'), 400)
  }

  const target = {
    $or: [{ username: body.username }, { email: body.email }]
  }

  const user = await User.findOne(target).exec()
  // finding a user means user already exists
  if (user && user.username === body.username) {
    throw errorWithStatus(new Error('Username already taken'), 400)
  }
  if (user && user.email === body.email) {
    throw errorWithStatus(new Error('Email already registered'), 400)
  }
  // no user found; make a new one
  const newUser = new User({
    username: body.username,
    email: body.email,
    validated: false,
    signupKey: mailUtils.makeSignupKey()
  })

  newUser.hashPassword(body.password)

  // save new user to database
  const savedUser = await newUser.save()

  // build filtered user profile for later response
  const profile = {
    username: savedUser.username,
    email: savedUser.email,
    validated: savedUser.validated,
    _id: savedUser._id
  }

  // build email parameter map
  const emailParams = {
    key: savedUser.signupKey.key,
    toEmail: savedUser.email,
    toUserId: savedUser._id
  }

  // send validation email, passing email param map
  sendValidationEmail(log, emailParams)

  // generate auth token
  const token = savedUser.generateJWT()

  // respond with profile & JWT
  return { profile, token }
}

// helpers

/**
 * Dispatch new user validation email
 * @param  {String}  key       randomly generated key
 * @param  {String}  toEmail   user/recipient email address
 * @param  {String}  toUserId  new user's _id
 */
function sendValidationEmail (logger, { key, toEmail, toUserId }) {
  const url = mailUtils.makeValidationUrl(toUserId, key)
  const subject = 'co/ment - Email verification required'
  const body = {
    type: 'html',
    text: emailTpl.validationTemplate(url, toUserId)
  }

  try {
    mailer(toEmail, subject, body)
    logger.info('Email validation sent successfully.')
  } catch (err) {
    throw err
  }
}
