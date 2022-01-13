const BannerModelCollection = require('./../models/banner-collection.model')

class BannersController {
  async getBanners(req, res, next) {
    try {
      const option = req.query.options ? req.query.options : 'all'
      const collection = new BannerModelCollection(option)
      const banners = await collection.fetchBanners()
      res.json(banners)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new BannersController()