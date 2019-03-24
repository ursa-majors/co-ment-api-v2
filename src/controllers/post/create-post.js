'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

// CREATE NEW POST
//   Example: POST >> /api/posts
//   Secured: yes, valid JWT required
//   Expects:
//     1) author '_id' from JWT token
//     2) request body properties : {
//          role                : String
//          title               : String
//          body                : String
//          excerpt             : String
//          keywords            : Array
//          availability        : String
//        }
//   Returns: success message & new post object on success
exports = module.exports = async function createPost (req, res, next) {
  const { title, role } = req.body
  if (!title) return res.status(400).json({ message: 'Missing required title' })
  if (!role) return res.status(400).json({ message: 'Missing required role' })

  try {
    const target = { author: req.token._id, role, title, deleted: false }
    const existingPost = await Post.findOne(target).exec()

    // Error if non-deleted post w/ same author_id, role & title found
    if (existingPost) {
      throw errorWithStatus(new Error('same/similar post already exists'), 400)
    }

    const now = new Date().toISOString()

    // create new post
    const newPost = new Post({
      author: req.token._id,
      role: req.body.role,
      title: req.body.title,
      body: req.body.body,
      excerpt: req.body.excerpt,
      keywords: req.body.keywords,
      availability: req.body.availability,
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

    return res.status(200).json({ message: 'New post saved!', post })
  } catch (err) {
    return next(err)
  }
}
