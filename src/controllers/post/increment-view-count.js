'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

/**
 * Increment a post's views count
 * Secured - valid JWT required
 * @returns  {Object}  Success message only
 */
exports = module.exports = async function incrementViews ({ postId, userId }) {
  if (postId == null) throw errorWithStatus(new Error('Missing required postId param'), 400)
  if (userId == null) throw errorWithStatus(new Error('Missing required userId param'), 400)

  const result = await Post.incrementViews({ postId, userId })
  return { message: result ? 'Post updated' : 'Post not updated' }
}
