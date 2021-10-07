const express = require('express')
const router = express.Router()
const multer = require('multer')
const MulterUtil = require('../utils/MulterUtil')
const upload = multer({
  storage: MulterUtil.uploadStorage(),
  fileFilter: MulterUtil.existFileFilter(),
})
const ReviewsController = require('./../controllers/reviews.controller')
const authMiddleware = require('./../middleware/auth.middleware')
const adminAuthMiddleware = require('./../middleware/admin-auth.middleware')

/**
 * Returns reviews
 * available query parameters: category, limit, ordered
 * category: one of 'target-setup', 'consultation', 'education'
 * limit: integer from 0
 * ordered: '1' - will return ordered by "review_order" column
 */
router.get('/', ReviewsController.getReviews)
router.post(
  '/',
  authMiddleware,
  adminAuthMiddleware,
  upload.single('image'),
  ReviewsController.addReview
)
router.put(
  '/:id',
  authMiddleware,
  adminAuthMiddleware,
  upload.single('image'),
  ReviewsController.updateReview.bind(ReviewsController)
)
router.delete(
  '/:id',
  authMiddleware,
  adminAuthMiddleware,
  ReviewsController.deleteReview
)

module.exports = router
