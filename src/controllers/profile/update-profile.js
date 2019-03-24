'use strict'

const User = require('../../models/user')
const { parseSkill, errorWithStatus } = require('../../utils')

// UPDATE PROFILE
//   Example: PUT >> /api/profile/597dccac7017890bd8d13cc7
//   Secured: yes, valid JWT required.
//   Expects:
//     1) 'username' from JWT token
//     2) '_id' from request params
//     3) optional request body properties : {
//          name       : String
//          email      : String
//          avatarUrl  : String
//          languages  : Array
//          location   : String
//          gender     : String
//          about      : String
//          skills     : Array
//          time_zone  : String
//          github     : String
//          twitter    : String
//          facebook   : String
//          link       : String
//          linkedin   : String
//          codepen    : String
//        }
//   Returns: success message & updated profile object on success
exports = module.exports = async function updateProfile (req, res, next) {
  // ensure user is allowed to update target user profile
  if (req.params.id !== req.token._id) {
    return next(errorWithStatus(new Error('Update profile not permitted'), 403))
  }

  const target = { _id: req.params.id, username: req.token.username }
  const updates = { ...req.body } // map only enumerable req.body properties
  const options = { new: true } // return updated document from mongodb

  // parse any skills
  if (updates.skills) {
    updates.skills = updates.skills.map(parseSkill)
  }

  try {
    const updatedProfile = await User.updateUser({ target, updates, options })
    if (!updatedProfile) {
      return next(errorWithStatus(new Error('Update error: user not found'), 404))
    }
    return res.status(200).json({ message: 'User updated!', user: updatedProfile })
  } catch (err) {
    return next(err)
  }
}
