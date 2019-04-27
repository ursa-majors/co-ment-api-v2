'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

/**
 * Create a new post
 * Secured - valid JWT required
 * @returns  {Object}  Success message & new post object
 */
exports = module.exports = async function createPost ({ userId, body }) {
  const { title, role } = body
  if (!title) throw errorWithStatus(new Error('Missing required title'), 400)
  if (!role) throw errorWithStatus(new Error('Missing required role'), 400)

  const target = { author: userId, role, title, deleted: false }
  const existingPost = await Post.findOne(target).exec()

  // Error if non-deleted post w/ same author_id, role & title found
  if (existingPost) {
    throw errorWithStatus(new Error('same/similar post already exists'), 400)
  }

  const now = new Date().toISOString()

  // create new post
  const newPost = new Post({
    author: userId,
    role: body.role,
    title: body.title,
    body: body.body,
    excerpt: body.excerpt,
    keywords: body.keywords,
    availability: body.availability,
    createdAt: now,
    updatedAt: now
  })

  // save new post to database
  await newPost.save()

  // hydrate author info
  const post = await newPost.populate({
    path: 'author',
    select: 'username name avatarUrl time_zone languages gender'
  })

  return { message: 'New post saved!', post }
}
