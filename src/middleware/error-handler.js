'use strict'

const { STATUS_CODES } = require('http')

exports = module.exports = () => (err, req, res, next) => {
  const status = err.status || 500
  let statusMessage = err.message || STATUS_CODES[status]

  if (req.log) {
    req.log.error({ req, res, err }, `${status} ${statusMessage}`)
  } else {
    console.error({ req, res, err }, `${status} ${statusMessage}`)
  }

  res.status(status).json({ message: err.message })
}
