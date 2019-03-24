'use strict'

const User = require('../../models/user')
const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

// DELETE A PROFILE
//   Example: DELETE >> /api/profile/597e3dca8167330add4be737
//   Secured: yes, valid JWT required
//   Expects:
//     1) '_id' from request params
//     2) '_id' from JWT
//     3) 'username' from JWT
//   Returns: success message & deleted user profile on success
exports = module.exports = async function deleteProfile (req, res, next) {
  // ensure user is allowed to update target user profile
  if (req.params.id !== req.token._id) {
    return next(errorWithStatus(new Error('Delete profile not permitted'), 403))
  }

  const targetUser = { _id: req.params.id, username: req.token.username }

  try {
    // first delete user's profile ...
    const deletedProfile = await User.deleteUser(targetUser)
    if (!deletedProfile) {
      return next(errorWithStatus(new Error('Delete error: user not found'), 404))
    }
    // ... then set user's posts to 'deleted ...
    const didDeletePosts = await Post.deletePostsByAuthor({ authorId: targetUser._id })
    if (!didDeletePosts) {
      return next(errorWithStatus(new Error('Failed to delete posts'), 500))
    }
    // ... finally, handle delete success
    return res.status(200).json({ user: deletedProfile })
  } catch (err) {
    return next(err)
  }
}
