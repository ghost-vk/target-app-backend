const express = require('express')
const router = express.Router()
const LidController = require('./../controllers/lid.controller')

/**
 * @name api/lid
 */
router.post('/', LidController.createLid.bind(LidController))

module.exports = router
