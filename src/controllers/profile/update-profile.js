'use strict'

const User = require('../../models/user')
const { parseSkill, errorWithStatus } = require('../../utils')

/**
 * Update a user profile by ID
 * Secured - valid JWT required
 * optional request body properties:
 *   {String} name
 *   {String} email
 *   {String} avatarUrl
 *   {Array}  languages
 *   {String} location
 *   {String} gender
 *   {String} about
 *   {Array}  skills
 *   {String} time_zone
 *   {String} github
 *   {String} twitter
 *   {String} facebook
 *   {String} link
 *   {String} linkedin
 *   {String} codepen
 * @returns  {Object}  Updated user profile on success
 */
exports = module.exports = async function updateProfile ({ userId, token, body }) {
  if (userId == null) throw errorWithStatus(new Error('Missing required userId param'), 400)
  if (token == null) throw errorWithStatus(new Error('Missing required token param'), 400)
  if (body == null) throw errorWithStatus(new Error('Missing required body param'), 400)

  // ensure user is allowed to update target user profile
  if (userId !== token._id) {
    throw errorWithStatus(new Error('Update profile not permitted'), 403)
  }

  const target = { _id: userId, username: token.username }
  const updates = { ...body } // map only enumerable req.body properties
  const options = { new: true } // return updated document from mongodb

  // parse any skills
  if (updates.skills) {
    updates.skills = updates.skills.map(parseSkill)
  }

  const updatedProfile = await User.findOneAndUpdate(target, updates, options).exec()
  if (!updatedProfile) {
    throw errorWithStatus(new Error('Update error: user not found'), 404)
  }
  return { user: updatedProfile }
}
