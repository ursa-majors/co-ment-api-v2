'use strict'

const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  active: { type: Boolean, default: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  availability: { type: String, trim: true },
  body: { type: String, required: true, trim: true },
  excerpt: { type: String, trim: true },
  keywords: { type: [String], required: true },
  role: {
    type: String,
    lowercase: true,
    enum: ['mentor', 'mentee'],
    default: 'mentee',
    trim: true
  },
  title: { type: String, required: true, trim: true },
  deleted: { type: Boolean, default: false },
  meta: {
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 }
  },
  updatedAt: { type: Date },
  createdAt: { type: Date }
})

/* ================================ METHODS ================================ */

postSchema.statics.findPosts = function findPosts ({ filter }) {
  return this.find(filter)
    .populate('author', 'username name avatarUrl time_zone languages gender')
    .exec()
}

postSchema.statics.updatePost = function updatePost ({ target, updates, options = {} }) {
  if (target == null) throw new Error('Missing required target param')
  if (updates == null) throw new Error('Missing required updates param')
  return this.findOneAndUpdate(target, updates, options).exec()
}

postSchema.statics.incrementViews = function incrementViews ({ target }) {
  if (target == null) throw new Error('Missing required target param')

  const updates = { $inc: { 'meta.views': 1 } }
  return this.findOneAndUpdate(target, updates).exec()
}

/**
 * Deletes a post by updating it to inactive
 * @param  {Object}  target  Consisting of post _id & author
 */
postSchema.statics.deletePost = function deletePost ({ target }) {
  if (target == null) throw new Error('Missing required target param')
  const updates = {
    deleted: true,
    active: false,
    updatedAt: new Date().toISOString()
  }
  const options = { new: true }
  return this.findOneAndUpdate(target, updates, options).exec()
}

postSchema.statics.deletePostsByAuthor = function deletePostsByAuthor (authorId) {
  const updates = { deleted: true, active: false }
  const options = { multi: true }

  return this.update({ author_id: authorId }, updates, options).exec()
    .then(({ nModified }) => nModified > 0)
}

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Post', postSchema)
