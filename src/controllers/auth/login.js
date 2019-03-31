'use strict'

const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

exports = module.exports = async ({ username, password }) => {
  // ensure required inputs exist
  if (!username) throw errorWithStatus(new Error('Missing required username'), 400)
  if (!password) throw errorWithStatus(new Error('Missing required password'), 400)

  // force inclusion of salt & hash; normally not selectable
  const projection = '+salt +hash'
  const user = await User.findOne({ username }, projection).exec()

  if (!user) {
    throw errorWithStatus(new Error('User not found'), 404)
  }

  if (!user.validatePassword(password)) {
    throw errorWithStatus(new Error('Invalid password'), 401)
  }

  // generate JWT
  const token = user.generateJWT()

  // don't include salt & hash in returned user profile
  const profile = user.toObject()
  delete profile.salt
  delete profile.hash

  return { profile, token }
}
