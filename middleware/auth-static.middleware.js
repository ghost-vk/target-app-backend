const debug = require('debug')('middleware:auth-static')
const ApiError = require('./../exceptions/api-error')
const IpStoreService = require('./../service/ip-store:service')

module.exports = function (req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress

  if (!ip) {
    debug('Not IP provided')
    return next(ApiError.UnauthorizedError())
  }

  if (!IpStoreService.isAllowedIp(ip)) {
    debug('Not allowed IP: %s', ip)
    return next(ApiError.UnauthorizedError())
  }

  return next()
}
