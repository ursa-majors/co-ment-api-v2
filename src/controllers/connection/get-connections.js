'use strict'

const Connection = require('../../models/connection')
const { errorWithStatus } = require('../../utils')

/**
 * Get all user's connections
 * Secured - valid JWT required
 * @returns  {Array}  Of user connection objects
 */
exports = module.exports = async function getConnections ({ userId }) {
  if (!userId) throw errorWithStatus(new Error('Missing required userId'), 400)
  const connections = await Connection.findOwnConnections({ target: userId })
  return connections
}
