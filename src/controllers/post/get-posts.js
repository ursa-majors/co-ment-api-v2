'use strict'

const Post = require('../../models/post')

/**
 * Get all posts
 * Secured - valid JWT required
 * Optional query string params for filtering requests:
 *   role         Return only 'mentor' or 'mentee' wanted posts
 *   id           Return single specific post object '_id'
 *   author       Return only posts by a specific author
 *   active=all   Return all posts, active and inactive
 * @returns  {Array}  Of post objects
 */
exports = module.exports = async function getPosts ({ query } = {}) {
  // request only active, non-deleted posts
  const filter = {
    active: true,
    deleted: false
  }

  // iterate over query params, conditionally adding them to the filter
  for (let key in query) {
    if (key === 'id') {
      filter._id = query.id
    } else if (key === 'active' && query.active === 'all') {
      delete filter.active
    } else {
      filter[key] = query[key]
    }
  }

  const posts = await Post.findPosts({ filter })
  return posts
}
