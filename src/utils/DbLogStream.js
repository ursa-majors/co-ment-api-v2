'use strict'

const { Writable } = require('stream')

/**
 * DbLogStream class
 * @param  {Object}  options  Should ALWAYS include a Mongoose model
 */
class DbLogStream extends Writable {
  constructor (options = {}) {
    super()
    if (options.model == null) throw new Error('Missing required model param')
    this.Model = options.model
  }

  /**
   * Override inherited Writable _write method
   * @param {*}         chunk  Data to write. String | Buffer | Uint8Array
   * @param {String}    enc    Optional encoding
   * @param {Function}  cb     Called when chunk of data is flushed
   */
  async _write (chunk, enc, cb) {
    try {
      const newLog = new this.Model(JSON.parse(chunk.toString()))
      await newLog.save()
      return cb()
    } catch (err) {
      return cb(err)
    }
  }
}

exports = module.exports = DbLogStream
