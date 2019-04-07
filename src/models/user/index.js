'use strict'

const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  name: { type: String, trim: true },
  ghUserName: { type: String, trim: true },
  ghProfile: Object,
  avatarUrl: { type: String, trim: true },
  location: { type: String, trim: true },
  about: { type: String, trim: true },
  gender: { type: String, trim: true },
  github: { type: String, trim: true },
  twitter: { type: String, trim: true },
  facebook: { type: String, trim: true },
  link: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  codepen: { type: String, trim: true },
  signupKey: { key: String, ts: String, exp: String },
  passwordResetKey: { key: String, ts: String, exp: String },
  validated: { type: Boolean, default: false },
  languages: [String],
  certs: [String],
  skills: [String],
  time_zone: { type: String, trim: true },
  likedPosts: [String],
  contactMeta: {
    unSubbed: { type: Boolean, default: false },
    alreadyContacted: { type: Boolean, default: false }
  },
  engagementMeta: {
    addPostReminder: { type: Date },
    addProfileReminder: { type: Date }
  },
  hash: { type: String, select: false },
  salt: { type: String, select: false }
},
{
  timestamps: true
})

/* ================================ METHODS ================================ */

userSchema.methods.hashPassword = function hashPassword (pwd) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(pwd, this.salt, 10000, 512, 'sha512').toString('hex')
}

// hash and compare submitted passwords to stored hashes in db.
// return 'true' if match
userSchema.methods.validatePassword = function validatePassword (pwd) {
  const hash = crypto.pbkdf2Sync(pwd, this.salt, 10000, 512, 'sha512').toString('hex')
  return this.hash === hash
}

// Generate and return signed JWT based on 'this' user object
userSchema.methods.generateJwt = function generateJWT () {
  const payload = {
    _id: this._id,
    username: this.username,
    validated: this.validated
  }
  const options = {
    expiresIn: '7d'
  }

  return jwt.sign(payload, jwtSecret, options)
}

userSchema.statics.updateUser = function updateUser ({ target, updates, options = {} }) {
  if (target == null) throw new Error('Missing required target param')
  if (updates == null) throw new Error('Missing required updates param')
  return this.findOneAndUpdate(target, updates, options).exec()
}

userSchema.statics.deleteUser = function deleteUser (target) {
  if (target == null) throw new Error('Missing required target param')
  return this.findOneAndRemove(target).exec()
}

/* ================================ EXPORT ================================= */

exports = module.exports = mongoose.model('User', userSchema)
