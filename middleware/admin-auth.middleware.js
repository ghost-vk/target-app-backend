const ApiError = require('./../exceptions/api-error')

module.exports = function (req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return next(ApiError.UnauthorizedAdminError())
    } else {
      next()
    }
  } catch (e) {
    return next(ApiError.UnauthorizedAdminError())
  }
}
