const debug = require('debug')('controller:user')
const to = require('await-to-js').default
const { validationResult } = require('express-validator')
const ApiError = require('./../exceptions/api-error')
const UserService = require('./../service/user.service')
const AvailableCoursesService = require('./../service/available-courses.service')
const isProduction = process.env.NODE_ENV === 'production'
const { userRegistrationWithLoginSchema } = require('./../utils/validation-schemes')

class UserController {
  async login(req, res, next) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Validation Error', errors.array()))
      }

      const { login, password } = req.body

      const [err, userData] = await to(UserService.login(login, password))

      if (!userData) return next(ApiError.BadRequest(err.message))

      res.cookie('target_app_refresh_token', userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
        secure: isProduction,
      })

      debug('Send userData to client when login: %O', userData)

      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async loginAdmin(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Validation Error', errors.array()))
      }
      const { email, password } = req.body
      const userData = await UserService.login(email, password)
      if (userData.user.role !== 'admin') {
        return next(ApiError.BadRequest('No Access', errors.array()))
      }
      res.cookie('target_app_refresh_token', userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
        secure: isProduction,
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const { target_app_refresh_token } = req.cookies
      const token = await UserService.logout(target_app_refresh_token)
      res.clearCookie('target_app_refresh_token')
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      const { target_app_refresh_token } = req.cookies

      const userData = await UserService.refresh(target_app_refresh_token)

      res.cookie('target_app_refresh_token', userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
        secure: isProduction,
      })

      debug('Send userData to client when refresh: %O', userData)

      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async createUserWithLogin(req, res, next) {
    try {
      let err

      const userData = req.body.data

      debug('Request to create user. UserData: , %O', userData)

      await userRegistrationWithLoginSchema.validateAt('login', userData)

      const user = await UserService.getUserByLogin(userData.login)

      if (user) {
        const error = new ApiError(409, `Login ${userData.login} is not available.`)
        next(error)
      }

      await userRegistrationWithLoginSchema.validateAt('password', userData)

      const newUser = await UserService.createWithLogin(userData.login, userData.password)

      let addRequest = null
      if (userData.attachedCourses) {
        [err, addRequest] = await to(UserService.addCoursesToUser(newUser.id, userData.attachedCourses))

        if (err) return next(err)

        if (addRequest.error) return next(new Error(addRequest.error))
      }

      const response = !addRequest
        ? { user: newUser }
        : { user: newUser, availableCourses: addRequest.courses }

      res.json(response)
    } catch (e) {
      debug('Error when create user:\n%O', e)
      next(e)
    }
  }

  async getAvailableCourses(req, res, next) {
    try {
      const courses = await AvailableCoursesService.getAvailableCoursesForUserById(req.body.userId)

      const status = courses ? 'ok' : 'error'

      res.json({ status, courses })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new UserController()
