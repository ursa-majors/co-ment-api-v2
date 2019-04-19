'use strict'

const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

// @TODO -- LOTS OF VALIDATIONS!!!

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    minlength: 2,
    maxlength: 32,
    match: [
      /^[a-zA-Z]+([.-]?\w+)*$/,
      'Valid formats: user-name, user_name, Username, userName123'
    ]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    maxlength: 64,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/
  },
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 64,
    match: /[^{}[\]\r\n()<>?$]+$/
  },
  ghUserName: {
    type: String,
    trim: true
  },
  ghProfile: Object, // do we use this ?????
  avatarUrl: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  about: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  codepen: {
    type: String,
    trim: true
  },
  signupKey: {
    key: String,
    ts: String,
    exp: String
  },
  passwordResetKey: {
    key: String,
    ts: String,
    exp: String
  },
  validated: {
    type: Boolean,
    default: false
  },
  languages: [String],
  certs: [String],
  skills: [String],
  time_zone: {
    type: String,
    trim: true
  },
  likedPosts: [String],
  contactMeta: {
    unSubbed: {
      type: Boolean,
      default: false
    },
    alreadyContacted: {
      type: Boolean,
      default: false
    }
  },
  engagementMeta: {
    addPostReminder: {
      type: Date
    },
    addProfileReminder: {
      type: Date
    }
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
userSchema.methods.generateJWT = function generateJWT () {
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

/* ================================ EXPORT ================================= */

exports = module.exports = mongoose.model('User', userSchema)
