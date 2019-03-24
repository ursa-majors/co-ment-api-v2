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
exports = module.exports = async function register (req, res, next) {
  // ensure required inputs exist
  if (!req.body.username || !req.body.password || !req.body.email) {
    return res.status(400).json({ 'message': 'Please complete all required fields.' })
  }

  const target = {
    $or: [{ username: req.body.username }, { email: req.body.email }]
  }

  try {
    const user = await User.findOne(target).exec()
    // finding a user means user already exists
    if (user && user.username === req.body.username) {
      throw errorWithStatus(new Error('Username already taken'), 400)
    }
    if (user && user.email === req.body.email) {
      throw errorWithStatus(new Error('Email already registered'), 400)
    }
    // no user found; make a new one
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      validated: false,
      signupKey: mailUtils.makeSignupKey()
    })

    newUser.hashPassword(req.body.password)

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
    sendValidationEmail(emailParams)

    // generate auth token
    const token = savedUser.generateJWT()

    // respond with profile & JWT
    return res.status(200).json({ profile, token })
  } catch (err) {
    return next(err)
  }
}

// helpers

/**
 * Dispatch new user validation email
 * @param   {string}  key       randomly generated key
 * @param   {string}  toEmail   user/recipient email address
 * @param   {string}  toUserId  new user's _id
 */
function sendValidationEmail ({ key, toEmail, toUserId }) {
  const url = mailUtils.makeValidationUrl(toUserId, key)
  const subject = 'co/ment - Email verification required'
  const body = {
    type: 'html',
    text: emailTpl.validationTemplate(url, toUserId)
  }

  try {
    mailer(toEmail, subject, body)
    console.log('Email validation sent successfully.')
  } catch (err) {
    throw err
  }
}
