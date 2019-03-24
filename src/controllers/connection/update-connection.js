'use strict'

const Connection = require('../../models/connection')

// Update a connection record's status & status date
//   Example: POST >> /api/updateconnection
//   Secured: yes, valid JWT required
//   Expects:
//     1) request body properties : {
//          type : String
//        }
//   Returns: updated connection record on success
exports = module.exports = async function updateConnection (req, res, next) {
  const target = { _id: req.params.id }
  const { type } = req.body

  try {
    const conn = await Connection.updateConnectionStatus({ target, type })
    return res.status(200).json({ conn })
  } catch (err) {
    return next(err)
  }
}
