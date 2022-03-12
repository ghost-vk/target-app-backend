const ApiError = require('./../exceptions/api-error')
const debug = require('debug')('middleware:admin-auth')

module.exports = function (req, res, next) {
  try {
    debug('Admin authorization. User: %O', req.user)

    if (req.user.role !== 'admin') {
      return next(ApiError.UnauthorizedAdminError())
    } else {
      next()
    }
  } catch (e) {
    return next(ApiError.UnauthorizedAdminError())
  }
}
