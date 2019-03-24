'use strict'

const Post = require('../../models/post')

// INCREMENT A POST'S VIEW COUNT
//   Example: PUT >> /api/posts/597dd8665229970e99c6ab55/viewsplusplus
//   Secured: yes, valid JWT required
//   Expects:
//     1) post 'id' from request params
//     2) user '_id' from JWT
//   Returns: success status only
exports = module.exports = async function incrementViews (req, res, next) {
  // match only if post author NOT EQUAL to requesting user
  const target = {
    _id: req.params.id,
    author: { $ne: req.token._id }
  }

  try {
    await Post.incrementViews({ target })
    return res.status(200).end()
  } catch (err) {
    return next(err)
  }
}
