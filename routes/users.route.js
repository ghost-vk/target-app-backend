const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const { asyncMiddleware } = require('middleware-async')
const authMiddleware = require('./../middleware/auth.middleware')
const adminAuthMiddleware = require('./../middleware/admin-auth.middleware')
const UserController = require('./../controllers/user.controller')

router.post(
  '/createWithLogin',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  body('data.attachedCourses').isArray(),
  UserController.createUserWithLogin
)

router.post(
  '/getAvailableCourse',
  asyncMiddleware(authMiddleware),
  body('userId').notEmpty().isInt({ min: 1 }),
  UserController.getAvailableCourses
)

router.post(
  '/createStaticKey',
  asyncMiddleware(authMiddleware),
  UserController.createNewStaticKey
)

module.exports = router
