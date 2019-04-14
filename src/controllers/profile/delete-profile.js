'use strict'

const User = require('../../models/user')
const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

/**
 * Delete a user profile by ID
 * Secured - valid JWT required
 * @returns  {Object}  Deleted user profile on success
 */
exports = module.exports = async function deleteProfile ({ userId, token }) {
  if (userId == null) throw errorWithStatus(new Error('Missing required userId param'), 400)
  if (token == null) throw errorWithStatus(new Error('Missing required token param'), 400)

  // ensure user is allowed to update target user profile
  if (userId !== token._id) {
    throw errorWithStatus(new Error('Delete profile not permitted'), 403)
  }

  const targetUser = { _id: userId, username: token.username }

  // first delete user's profile ...
  const deletedProfile = await User.findOneAndRemove(targetUser).exec()
  if (!deletedProfile) {
    throw errorWithStatus(new Error('Delete error: user not found'), 404)
  }

  // ... then set user's posts to 'deleted ...
  const didDeletePosts = await Post.deletePostsByAuthor({ authorId: targetUser._id })
  if (!didDeletePosts) {
    throw errorWithStatus(new Error('Failed to delete posts'), 500)
  }

  // ... finally, return deleted profile
  return { user: deletedProfile }
}
