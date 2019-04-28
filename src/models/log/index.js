'use strict'

const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
  msg: {
    type: String,
    required: true
  },
  requestId: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  res: {
    type: Object
  },
  req: {
    type: Object
  },
  err: {
    type: Object
  },
  data: {
    type: Object
  }
}, {
  capped: {
    size: 256 * 4000, // 1 MB
    max: 1000
  }
})

/* ================================ EXPORT ================================= */

module.exports = mongoose.model('Log', logSchema)
