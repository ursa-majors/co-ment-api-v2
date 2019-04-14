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

/**
 * By default, filter consists of:
 *   active:  true,
 *   deleted: false
 * It may also include:
 *   role         Find posts by ['mentor' | 'mentee']
 *   id           Find post by its object '_id'
 *   author       Return only posts by a specific author
 *   active=all   Return all posts, active and inactive
 * @returns  {Array}  Of post objects
 */
postSchema.statics.findPosts = function findPosts ({ filter }) {
  return this.find(filter)
    .populate('author', 'username name avatarUrl time_zone languages gender')
    .exec()
}

postSchema.statics.incrementViews = function incrementViews ({ postId, userId }) {
  const filter = {
    _id: postId,
    author: { $ne: userId } // match only if post author !== requesting user
  }
  const updates = { $inc: { 'meta.views': 1 } }
  const options = { new: true }
  return this.findOneAndUpdate(filter, updates, options).exec()
}

// Deletes a single post by updating it to inactive
postSchema.statics.deletePost = function deletePost ({ postId, userId }) {
  const target = { _id: postId, author: userId }
  const updates = { deleted: true, active: false, updatedAt: new Date().toISOString() }
  const options = { new: true }
  return this.findOneAndUpdate(target, updates, options).exec()
}

// Deletes all user's posts by updating them to inactive
postSchema.statics.deletePostsByAuthor = function deletePostsByAuthor (authorId) {
  const updates = { deleted: true, active: false, updatedAt: new Date().toISOString() }
  const options = { multi: true }

  return this.update({ author_id: authorId }, updates, options).exec()
    .then(({ nModified }) => nModified > 0)
}

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Post', postSchema)
