'use strict'

const Connection = require('../../models/connection')

// CREATE CONNECTION
//   Example: POST >> /api/connect
//   Secured: yes, valid JWT required
//   Expects:
//     1) request body properties : {
//          mentor          : id
//          mentee          : id
//          mentorName      : string
//          menteeName      : string
//          initiator       : id
//          status          : 'pending'
//          conversationID  : string
//        }
//   Returns: success message & connection _id on success
exports = module.exports = async function createConnection (req, res, next) {
  const conn = new Connection(req.body)
  conn.dateStarted = Date.now()

  try {
    const savedConn = await conn.save()
    return res.status(200).json({
      message: 'Connection created',
      connectionId: savedConn._id
    })
  } catch (err) {
    return next(err)
  }
}
