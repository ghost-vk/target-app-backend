const express = require('express')
const router = express.Router()
const { asyncMiddleware } = require('middleware-async')

const MediaLibraryController = require('./../controllers/media-library.controller')

const multer = require('multer')
const MulterUtil = require('../utils/MulterUtil')

const authMiddleware = require('./../middleware/auth.middleware')
const adminAuthMiddleware = require('./../middleware/admin-auth.middleware')

const upload = multer({
  storage: MulterUtil.uploadStorage(),
})

router.post(
  '/',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  upload.fields([{ name: 'photos', maxCount: 10 }]),
  MediaLibraryController.addPhotos
)

router.get(
  '/',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  MediaLibraryController.getAllPhotos
)

router.delete(
  '/',
  asyncMiddleware(authMiddleware),
  adminAuthMiddleware,
  MediaLibraryController.deleteFile
)

module.exports = router
