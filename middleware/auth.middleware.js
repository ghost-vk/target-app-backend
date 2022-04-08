const debug = require('debug')('middleware:auth')
const ApiError = require('./../exceptions/api-error')
const tokenService = require('./../service/token.service')

module.exports = function (req, res, next) {
  const authorizationHeader = req.headers.authorization

  if (!authorizationHeader) return next(ApiError.UnauthorizedError())

  const accessToken = authorizationHeader.split(' ')[1]

  if (!accessToken) return next(ApiError.UnauthorizedError())

  const userData = tokenService.validateAccessToken(accessToken)

  if (!userData) {
    debug('No user data when authorization with access token: %O', accessToken)
    return next(ApiError.UnauthorizedError())
  }

  req.user = userData

  next()
}
