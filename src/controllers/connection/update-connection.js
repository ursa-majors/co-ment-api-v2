'use strict'

const Connection = require('../../models/connection')
const { errorWithStatus } = require('../../utils')

/**
 * Update a connection record's status & status date
 * Secured - valid JWT required
 * @returns  {Object}  Updated connection record
 */
exports = module.exports = async function updateConnection ({ connId, type } = {}) {
  if (!connId) throw errorWithStatus(new Error('Missing required connId'), 400)
  if (!type) throw errorWithStatus(new Error('Missing required type'), 400)

  const target = { _id: connId }

  const conn = await Connection.updateConnectionStatus({ target, type })
  return conn
}
