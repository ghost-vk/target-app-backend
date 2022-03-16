const Router = require('express').Router
const userController = require('../controllers/user.controller')
const router = new Router()
const { body } = require('express-validator')

router.post(
  '/login',
  body('login').isAlphanumeric('en-US'),
  body('password').isLength({ min: 3, max: 32 }),
  userController.login
)

router.post(
  '/admin',
  body('email').isEmail(),
  body('password').isLength({ min: 10, max: 40 }),
  userController.loginAdmin
)

router.post('/logout', userController.logout)

router.post('/refresh', userController.refresh)

module.exports = router
