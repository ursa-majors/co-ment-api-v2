'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

// UPDATE A POST
//   Example: PUT >> /api/posts/597dd8665229970e99c6ab55
//   Secured: yes, valid JWT required
//   Expects:
//     1) author '_id' from JWT token
//     2) request body properties : {
//          action              : Boolean
//          author              : String
//          role                : String
//          title               : String
//          body                : String
//          excerpt             : String
//          keywords            : Array
//          availability        : String
//        }
//   Returns: success message & updated post on success
exports = module.exports = async function updatePost (req, res, next) {
  const target = { _id: req.params.id, author: req.token._id }
  const updates = { ...req.body, updatedAt: new Date().toISOString() }
  const options = { new: true }

  try {
    const updatedPost = await Post.updatePost({ target, updates, options })
    if (!updatedPost) throw errorWithStatus(new Error('Post not found!'), 404)

    // hydrate post with author info
    const post = await updatedPost.populate({
      path: 'author',
      select: 'username name avatarUrl time_zone languages gender'
    })

    return res.status(200).json({ message: 'Post updated', post })
  } catch (err) {
    return next(err)
  }
}
