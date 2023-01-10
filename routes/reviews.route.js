const express = require('express');
const router = express.Router();
const ReviewsController = require('./../controllers/reviews.controller');

/**
 * Returns reviews
 * available query parameters: category, limit, ordered
 * category: one of 'target-setup', 'consultation', 'education'
 * limit: integer from 0
 * ordered: '1' - will return ordered by "review_order" column
 */
router.get('/', ReviewsController.getReviews);

module.exports = router;
