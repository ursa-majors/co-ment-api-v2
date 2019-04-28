'use strict'

const { STATUS_CODES } = require('http')

exports = module.exports = () => (req, res, next) => {
  req.log.info(`Received ${req.method.toUpperCase()} >> ${req.url}`)

  // on 'finish' events, log the response
  res.on('finish', () => {
    const { statusCode } = res
    let data = {}

    if (req.token && req.token._id) {
      data.userId = req.token._id
    }

    const level = statusCode < 400 ? 'info' : 'error'
    const msg = `Resolved ${req.method.toUpperCase()} >> ${statusCode} ${STATUS_CODES[statusCode]}`
    req.log[level]({ data }, msg)
  })
  next()
}
