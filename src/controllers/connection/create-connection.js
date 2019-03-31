'use strict'

const Connection = require('../../models/connection')
const { errorWithStatus } = require('../../utils')

/**
 * Create a connection
 * Secured - valid JWT required
 * request body properties : {
 *   {String}  mentor (id)
 *   {String}  mentee (id)
 *   {String}  mentorName
 *   {String}  menteeName
 *   {String}  initiator (id) @TODO should get from user's req.token._id
 *   {String}  status ('pending')
 *   {String}  conversationID
 * @returns  {Object}  Success message & connection _id
 */
exports = module.exports = async function createConnection ({ body } = {}) {
  if (!body) throw errorWithStatus(new Error('Missing required body'), 400)

  const conn = new Connection(body)
  conn.dateStarted = Date.now()

  const savedConn = await conn.save()
  return {
    message: 'Connection created',
    connectionId: savedConn._id
  }
}
