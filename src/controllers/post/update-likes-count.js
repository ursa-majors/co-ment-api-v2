'use strict'

const Post = require('../../models/post')
const User = require('../../models/user')
const { errorWithStatus } = require('../../utils')

// INCREMENT / DECREMENT A POST'S LIKE COUNT
//   Example: PUT >> /api/posts/597dd8665229970e99c6ab55/likes?action=plusplus
//   Secured: yes, valid JWT required
//   Expects:
//     1) post 'id' from request params
//     2) user '_id' from JWT
//     3) action from request query param (either 'plusplus' or 'minusminus')
//   Returns: success status only
exports = module.exports = async function updatePostLikes ({ postId, userId, action }) {
  if (!postId) throw errorWithStatus(new Error('Missing required postId'), 400)
  if (!userId) throw errorWithStatus(new Error('Missing required userId'), 400)
  if (!action) throw errorWithStatus(new Error('Missing required action'), 400)

  const [user, post] = await Promise.all([
    User.findById(userId).exec(),
    Post.findById(postId).exec()
  ])

  // do nothing when trying to like an already liked post
  if (action === 'plusplus' && user.likedPosts.includes(postId)) {
    return { updated: false }
  }

  // do nothing when trying to unlike a post the user doesn't already like
  if (action === 'minusminus' && !user.likedPosts.includes(postId)) {
    return { updated: false }
  }

  // do nothing if author is trying to like their own post
  if (post.author === userId) {
    return { updated: false }
  }

  // update user's likedPosts array
  if (action === 'plusplus' && !user.likedPosts.includes(postId)) {
    user.likedPosts.push(postId)
  } else if (action === 'minusminus' && user.likedPosts.includes(postId)) {
    user.likedPosts = user.likedPosts.filter(p => p !== postId)
  }

  // update post's likes counter
  if (action === 'plusplus') {
    post.meta.likes += 1
  } else if (action === 'minusminus') {
    post.meta.likes -= 1
  }

  // save user and post
  await user.save()
  await post.save()

  return { updated: true }
}
