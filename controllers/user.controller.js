const { validationResult } = require('express-validator')
const ApiError = require('./../exceptions/api-error')
const UserService = require('./../service/user.service')
const isProduction = process.env.NODE_ENV === 'production'

class UserController {
  async login(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }
      const { email, password } = req.body
      const userData = await UserService.login(email, password)
      res.cookie('target_app_refresh_token', userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
        secure: isProduction
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async loginAdmin(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }
      const { email, password } = req.body
      const userData = await UserService.login(email, password)
      if (userData.user.role !== 'admin') {
        return next(ApiError.BadRequest('Вам сюда нельзя', errors.array()))
      }
      res.cookie('target_app_refresh_token', userData.refreshToken, {
        maxAge: 30 * 24 * 3600000,
        httpOnly: true,
        secure: isProduction
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
        secure: isProduction
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new UserController()
