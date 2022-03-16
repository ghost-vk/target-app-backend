const debug = require('debug')('middleware:auth')
const ApiError = require('./../exceptions/api-error')
const tokenService = require('./../service/token.service')

module.exports = async function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization

    if (!authorizationHeader) {
      debug('No Authorization header in request.')
      return next(ApiError.UnauthorizedError())
    }

    const accessToken = authorizationHeader.split(' ')[1]

    if (!accessToken) {
      debug('No access token in request headers.')
      return next(ApiError.UnauthorizedError())
    }

    const userData = tokenService.validateAccessToken(accessToken)

    if (!userData) {
      debug('No user data when authorization with access token: %O', accessToken)
      return next(ApiError.UnauthorizedError())
    }

    req.user = userData

    next()
  } catch (e) {
    return next(ApiError.UnauthorizedError())
  }
}
