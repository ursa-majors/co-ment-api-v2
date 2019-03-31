'use strict'

const Connection = require('../../models/connection')

/**
 * Update a connection record's status & status date
 * Secured - valid JWT required
 * @returns  {Object}  Updated connection record
 */
exports = module.exports = async function updateConnection ({ connId, type }) {
  const target = { _id: connId }

  const conn = await Connection.updateConnectionStatus({ target, type })
  return { conn }
}
