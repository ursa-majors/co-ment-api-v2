'use strict'

/**
 * Derive updated status from action type
 * @param    {String}  type
 * @returns  {Object}
 * @private
 */
exports = module.exports = function getStatusFromType (type) {
  switch (type) {
    case 'ACCEPT':
      return {
        status: 'accepted',
        dateAccepted: Date.now()
      }
    case 'DECLINE':
      return {
        status: 'declined',
        dateDeclined: Date.now()
      }
    case 'DEACTIVATE':
      return {
        status: 'inactive',
        dateExpired: Date.now()
      }
    default:
      return {}
  }
}
