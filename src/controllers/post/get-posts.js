'use strict'

const Post = require('../../models/post')

// GET POSTS
//   Example: GET >> /api/posts?role=mentor&id=12345689
//   Secured: yes, valid JWT required
//   Query params for filtering requests:
//     role         Return only 'mentor' or 'mentee' wanted posts
//     id           Return single specific post object '_id'
//     author       Return only posts by a specific author
//     active=all   Return all posts, active and inactive
//   Returns: JSON array of 'post' objects on success.
exports = module.exports = async function getPosts (req, res, next) {
  // request only active, non-deleted posts
  const query = {
    active: true,
    deleted: false
  }

  // iterate over req params, conditionally adding params to the query
  for (let key in req.query) {
    if (key === 'id') {
      query._id = req.query.id
    } else if (key === 'active' && req.query.active === 'all') {
      delete query.active
    } else {
      query[key] = req.query[key]
    }
  }

  try {
    const posts = await Post.findPosts({ query })
    return res.status(200).json(posts)
  } catch (err) {
    return next(err)
  }
}
