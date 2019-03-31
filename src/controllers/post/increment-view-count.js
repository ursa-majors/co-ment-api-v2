'use strict'

const Post = require('../../models/post')

/**
 * Increment a post's views count
 * Secured - valid JWT required
 * @returns  {Object}  Success message only
 */
exports = module.exports = async function incrementViews ({ postId, userId }) {
  const target = {
    _id: postId,
    author: { $ne: userId } // match if post author !== requesting user
  }

  const result = await Post.incrementViews({ target })
  return { message: result ? 'Post updated' : 'Post not updated' }
}
