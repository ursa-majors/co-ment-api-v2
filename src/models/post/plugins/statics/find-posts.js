'use strict'

function findPosts ({ filter }) {
  return this.find(filter)
    .populate('author', 'username name avatarUrl time_zone languages gender')
    .exec()
}

exports = module.exports = function (schema, options) {
  schema.statics.findPosts = findPosts
}
