'use strict'

const { STATUS_CODES } = require('http')

exports = module.exports = () => (err, req, res, next) => {
  const status = err.status || 500
  let statusMessage = err.message || STATUS_CODES[status]

  // set response status before logging - Express defaults status = 200!
  res.status(status)

  if (req.log) {
    req.log.error({ req, res, err }, `${status} ${statusMessage}`)
  } else {
    console.error({ req, res, err }, `${status} ${statusMessage}`)
  }

  res.json({ message: err.message })
}
