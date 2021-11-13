const multer = require('multer')
const path = require('path')
const { access, constants } = require('fs')

class MulterUtil {
  uploadStorage() {
    return multer.diskStorage({
      destination(req, file, cb) {
        cb(null, path.resolve(__dirname, './../public/uploads/img/'))
      },
      filename(req, file, cb) {
        cb(
          null,
          path.parse(file.originalname).name +
            '-' +
            Date.now() +
            path.extname(file.originalname)
        )
      },
    })
  }
  existFileFilter() {
    return (req, file, cb) => {
      access(
        `${path.resolve(__dirname, './../public/uploads/img/')}/${
          file.originalname
        }`,
        constants.F_OK,
        (err) => {
          const isNotExist = err
            ? path.resolve(__dirname, './../public/uploads/img/')
            : false
          req.linkToExistsFile = `/public/uploads/img/${file.originalname}`
          cb(null, isNotExist)
        }
      )
    }
  }
}

module.exports = new MulterUtil()
