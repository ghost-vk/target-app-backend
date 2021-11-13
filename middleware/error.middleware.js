const ApiError = require('./../exceptions/api-error')
const { MulterError } = require('multer')

module.exports = function (err, req, res, next) {
  console.log(err)
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors })
  } else if (err instanceof MulterError) {
    return res.status(500).json({ message: `Multer Error: ${err?.code}`})
  }
  return res.status(500).json({ message: 'Непредвиденная ошибка'} )
}
