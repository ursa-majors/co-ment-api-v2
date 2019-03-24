'use strict'

const Post = require('../../models/post')
const { errorWithStatus } = require('../../utils')

// DELETE A POST
//   Example: DELETE >> /api/posts/597dd8665229970e99c6ab55
//   Secured: yes, valid JWT required
//   Expects:
//     1) user '_id' from JWT token
//     2) post 'id' from request params
//   Returns: success message & deleted post on success
exports = module.exports = async function deletePost (req, res, next) {
  const target = { _id: req.params.id, author: req.token._id }

  try {
    const deletedPost = await Post.deletePost({ target })
    if (!deletedPost) {
      throw errorWithStatus(new Error('Post not found'), 404)
    }

    // hydrate post with author info
    const post = await deletedPost.populate({
      path: 'author',
      select: 'username name avatarUrl time_zone languages gender'
    })

    return res.status(200).json({ message: 'Post deleted!', post })
  } catch (err) {
    return next(err)
  }
}
