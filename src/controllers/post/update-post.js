'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

/**
 * Update a post by ID
 * Secured - valid JWT required
 * Optional request body properties:
 *   {Boolean} action
 *   {String}  author
 *   {String}  role
 *   {String}  title
 *   {String}  body
 *   {String}  excerpt
 *   {Array}   keywords
 *   {String}  availability
 * @returns  {Object}  success message & updated post
 */
exports = module.exports = async function updatePost ({ postId, userId, body }) {
  if (!postId) throw errorWithStatus(new Error('Missing required postId'), 400)
  if (!userId) throw errorWithStatus(new Error('Missing required userId'), 400)
  if (!body) throw errorWithStatus(new Error('Missing required body'), 400)

  const target = { _id: postId, author: userId }
  const updates = { ...body, updatedAt: new Date().toISOString() }
  const options = { new: true }

  const updatedPost = await Post.findOneAndUpdate(target, updates, options).exec()
  if (!updatedPost) throw errorWithStatus(new Error('Post not found!'), 404)

  // hydrate post with author info
  const post = await updatedPost.populate({
    path: 'author',
    select: 'username name avatarUrl time_zone languages gender'
  })

  return { message: 'Post updated', post }
}
