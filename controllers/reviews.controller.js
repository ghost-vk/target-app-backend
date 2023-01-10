const db = require('./../db');

class ReviewsController {
  async getReviews(req, res) {
    const category = req.query.category;
    const limit = Number(req.query.limit) || 10;
    const orderBy = req.query.ordered === '1' ? 'review_order' : 'id DESC';
    const catFilter = ['target-setup', 'consultation', 'education'].includes(category)
      ? 'WHERE category=$2'
      : '';
    const query = `SELECT * FROM reviews ${catFilter} ORDER BY ${orderBy} LIMIT $1`;
    const params = catFilter ? [limit, category] : [limit];
    try {
      const reviews = await db.query(query, params);
      res.status(200).json(reviews.rows);
    } catch (err) {
      res.status(500).json({ status: 'error' });
    }
  }
}

module.exports = new ReviewsController();
