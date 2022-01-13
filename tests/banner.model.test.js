const BannerModelCollection = require('./../models/banner-collection.model')

const getModels = async () => {
  try {
    const collection = new BannerModelCollection('all')
    const banners = await collection.fetchBanners()
    collection.banners = banners
    collection.banners.forEach(b => {
      console.log(b)
      console.log(b.srcset)
    })
  } catch (e) {
    throw new Error(e)
  }
}

getModels()
