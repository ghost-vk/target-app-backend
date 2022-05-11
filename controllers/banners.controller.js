const BannerModelCollection = require('./../models/banner-collection.model')

class BannersController {
  async getBanners(req, res, next) {
    try {
      const bannerActivityOption = req.query.options ? req.query.options : 'all'
      const bannerCollection = new BannerModelCollection(bannerActivityOption)
      const banners = await bannerCollection.fetchBanners()
      res.json(banners)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new BannersController()
