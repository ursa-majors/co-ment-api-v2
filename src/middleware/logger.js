'use strict'

const bunyan = require('bunyan')
const uuidV4 = require('uuid/v4')
const Log = require('../models/log')
const { DbLogStream, maskAuthHeader } = require('../utils')

const dbLogStream = new DbLogStream({ model: Log })

const makeLoggerMiddleware = () => {
  // create and configure logger instance
  const logger = bunyan.createLogger({
    name: 'co/ment API',
    streams: [
      {
        level: 'debug',
        stream: process.stdout
      },
      {
        level: 'info',
        stream: dbLogStream
      }
    ],
    serializers: {
      req: _reqSerializer,
      res: _resSerializer,
      err: bunyan.stdSerializers.err
    }
  })

  // return Express middleware to attache logger to req object
  return (req, res, next) => {
    req.log = logger.child({ requestId: uuidV4() })
    next()
  }
}

// custom serializers

function _reqSerializer (req) {
  return {
    method: req.method,
    url: req.url,
    headers: maskAuthHeader(req.headers)
  }
}

function _resSerializer (res) {
  if (!res || !res.statusCode) return res
  return {
    statusCode: res.statusCode,
    headers: maskAuthHeader(res.getHeaders())
  }
}

exports = module.exports = {
  makeLoggerMiddleware,
  _reqSerializer,
  _resSerializer
}
