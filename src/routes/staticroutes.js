'use strict'

const router = require('express').Router()
const staticCtrl = require('../controllers/static')

// Catch client-side routes that don't exist on the back-end.
// Redirects to /#/redirect={route}/{optional_id}
router.get('/:client_route/:uid?', staticCtrl.redirectHash)

module.exports = router
