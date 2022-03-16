const debug = require('debug')('middleware:auth-static')
const StaticKey = require('./../service/static-key')
const ApiError = require('../exceptions/api-error')

module.exports = function (req, res, next) {
  debug('Cookies: %O', req.cookies)

  if (!req.cookies.target_app_static_key) {
    debug('No cookie "target_app_static_key"')
    return next(ApiError.UnauthorizedError())
  }

  if (!StaticKey.isKeyValid(req.cookies.target_app_static_key)) {
    debug('Static key is not valid')
    return next(ApiError.UnauthorizedError())
  }

  return next()
}
