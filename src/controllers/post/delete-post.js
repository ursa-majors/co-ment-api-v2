'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

/**
 * Delete a post by ID
 * Secured - valid JWT required
 * @returns  {Object}  success message & deleted post
 */
exports = module.exports = async function deletePost ({ postId, userId }) {
  if (!postId) throw errorWithStatus(new Error('Missing required postId'), 400)
  if (!userId) throw errorWithStatus(new Error('Missing required userId'), 400)

  const target = { _id: postId, author: userId }

  const deletedPost = await Post.deletePost({ target })
  if (!deletedPost) {
    throw errorWithStatus(new Error('Post not found'), 404)
  }

  // hydrate post with author info
  const post = await deletedPost.populate({
    path: 'author',
    select: 'username name avatarUrl time_zone languages gender'
  })

  return { message: 'Post deleted!', post }
}
