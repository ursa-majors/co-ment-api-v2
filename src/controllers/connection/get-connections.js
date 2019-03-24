'use strict'

const Connection = require('../../models/connection')

// GET CONNECTIONS
//   Example: GET >> /api/connections
//   Secured: yes, valid JWT required
//   Expects:
//     1) the user's _id from the JWT token
//   Returns: array of user's connections
exports = module.exports = async function getConnections (req, res, next) {
  const target = req.token._id

  try {
    const connections = await Connection.findOwnConnections({ target })
    return res.status(200).json({ connections })
  } catch (err) {
    return next(err)
  }
}
