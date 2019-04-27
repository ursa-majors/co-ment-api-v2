'use strict'

const router = require('express').Router()

router.use('/auth', require('./auth'))
router.use('/profiles', require('./profiles'))
router.use('/posts', require('./posts'))
router.use('/contact', require('./contact'))
router.use('/connections', require('./connections'))
router.use('/conversations', require('./conversations'))

module.exports = router
