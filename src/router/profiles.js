'use strict'

const router = require('express').Router()
const ctrlHandler = require('./controller-handler')
const { authMiddleware, checkValidated } = require('../middleware')
const {
  getOneProfile,
  updateProfile,
  deleteProfile,
  getProfiles
} = require('../controllers/profile')

router.use(authMiddleware)

// single profile routes
router.route('/:id')
  .get(ctrlHandler(getOneProfile, (req) => ({ userId: req.params.id })))
  .put(ctrlHandler(updateProfile, (req) => ({ userId: req.params.id, token: req.token, body: req.body })))
  .delete(ctrlHandler(deleteProfile, (req) => ({ userId: req.params.id, token: req.token })))

// get all profiles. User must have validated account
router.get('/', [checkValidated], ctrlHandler(getProfiles))

exports = module.exports = router
