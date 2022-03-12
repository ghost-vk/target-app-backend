const debug = require('debug')('middleware:auth')
const ApiError = require('./../exceptions/api-error')
const tokenService = require('./../service/token.service')

module.exports = async function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization
    const refreshToken = req.cookies.target_app_refresh_token

    if (refreshToken) {
      debug('Request without authorization header but with refresh token: %s', refreshToken)
      const userData = tokenService.validateRefreshToken(refreshToken)
      const tokenFromDb = await tokenService.findToken(refreshToken)

      if (!userData || !tokenFromDb) return next(ApiError.UnauthorizedError())

      if (!userData) return next(ApiError.UnauthorizedError())

      req.user = userData

      return next()
    }

    if (!authorizationHeader) {
      debug('No authorization header in request')
      return next(ApiError.UnauthorizedError())
    }

    const accessToken = authorizationHeader.split(' ')[1]

    if (!accessToken) {
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
