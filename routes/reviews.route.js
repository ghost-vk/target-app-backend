const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const { access, constants } = require('fs')

const storage = multer.diskStorage({
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
const fileFilter = (req, file, cb) => {
  access(
    `${path.resolve(__dirname, './../public/uploads/img/')}/${
      file.originalname
    }`,
    constants.F_OK,
    (err) => {
      const isNotExist = err
        ? path.resolve(__dirname, './../public/uploads/img/')
        : false
      req.linkToExistsReviewImage = `/public/uploads/img/${file.originalname}`
      cb(null, isNotExist)
    }
  )
}
const upload = multer({ storage, fileFilter })
const ReviewsController = require('./../controllers/reviews.controller')

/**
 * Returns reviews
 * available query parameters: category, limit, ordered
 * category: one of 'target-setup', 'consultation', 'education'
 * limit: integer from 0
 * ordered: '1' - will return ordered by "review_order" column
 */
router.get('/', ReviewsController.getReviews)
router.post('/', upload.single('image'), ReviewsController.addReview)
router.put(
  '/:id',
  upload.single('image'),
  ReviewsController.updateReview.bind(ReviewsController)
)
router.delete('/:id', ReviewsController.deleteReview)

module.exports = router
