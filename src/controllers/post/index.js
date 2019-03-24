'use strict'

exports = module.exports = Object.freeze({
  getPosts: require('./get-posts'),
  createPost: require('./create-post'),
  updatePost: require('./update-post'),
  deletePost: require('./delete-post'),
  incrementViews: require('./increment-view-count'),
  updateLikes: require('./update-likes-count')
})
