const fs = require('fs')
const util = require('util')
const path = require('path')
const ApiError = require('./../exceptions/api-error')

const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)
const rm = util.promisify(fs.rm)

class MediaLibraryController {
  async addPhotos(req, res, next) {
    try {
      console.log(req.files['photos'])
      if (!req.files['photos'] || req.files['photos'].length === 0) {
        return next(new ApiError(400, 'Photos is empty'))
      }

      let uploadedFiles = []
      const dirname = path.resolve(__dirname, './../public/uploads/img')
      for (const f of req.files['photos']) {
        const { size } = await stat(`${dirname}/${f.filename}`)
        uploadedFiles.push({
          path: `/public/uploads/img/${f.filename}`,
          size,
        })
      }

      res.json({ ok: true, files: uploadedFiles })
    } catch (e) {
      return next(e)
    }
  }

  async getAllPhotos(req, res, next) {
    try {
      let photos = []
      let availableFiles = []
      const dirname = path.resolve(__dirname, './../public/uploads/img')
      let files = await readdir(dirname)

      files.forEach((f) => {
        let ext
        const split = f.split('.')
        if (split.length === 2) {
          ext = split[1]
        }
        if (['jpg', 'png', 'jpeg', 'webp'].includes(ext)) {
          availableFiles.push(f)
        }
      })

      for (const af of availableFiles) {
        const { size } = await stat(`${dirname}/${af}`)
        photos.push({ path: `/public/uploads/img/${af}`, size })
      }

      res.json({ ok: true, photos })
    } catch (e) {
      return next(e)
    }
  }

  async deleteFile(req, res, next) {
    try {
      console.log(req.body)
      const { file } = req.body
      if (!file) {
        next(ApiError.BadRequest('Not provided file to delete'))
      }
      await rm(path.resolve(__dirname, `./..${file}`))
      res.json({ ok: true, file })
    } catch (e) {
      next(new ApiError(500, 'Failed to delete file'))
    }
  }
}

module.exports = new MediaLibraryController()
