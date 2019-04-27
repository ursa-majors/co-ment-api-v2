'use strict'

const router = require('express').Router()
const ctrlHandler = require('./controller-handler')
const { authMiddleware, checkValidated } = require('../middleware')
const {
  getPosts,
  incrementViews,
  createPost,
  updatePost,
  updateLikes,
  deletePost
} = require('../controllers/post')

router.use(authMiddleware)

// Get all posts
router.get('/', ctrlHandler(getPosts, (req) => ({ query: req.query })))

// Increment post's view count
router.put('/:id/viewsplusplus', ctrlHandler(incrementViews, (req) => ({
  postId: req.params.id,
  userId: req.token._id
})))

// middleware for below routes only
router.use(checkValidated)

// Create a post
router.post('/', ctrlHandler(createPost, (req) => ({
  userId: req.token._id,
  body: req.body
})))

// Update a post
router.put('/:id', ctrlHandler(updatePost, (req) => ({
  postId: req.params.id,
  userId: req.token._id,
  body: req.body
})))

// Increment or decrement a post's likes count
router.put('/:id/likes', ctrlHandler(updateLikes, (req) => ({
  postId: req.params.id,
  userId: req.token._id,
  action: req.query.action
})))

// Delete a post
router.delete('/:id', ctrlHandler(deletePost, (req) => ({
  postId: req.params.id,
  userId: req.token._id
})))

exports = module.exports = router
