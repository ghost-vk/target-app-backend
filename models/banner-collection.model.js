const BannerModel = require('./banner.model');
const ApiError = require('./../exceptions/api-error');
const db = require('./../db');
const { dbSchema } = require('./../db');

class BannerModelCollection {
  _banners;
  _options;

  /**
   * @param options 'all' | 'active' | 'inactive'
   */
  constructor(options = 'all') {
    this._options = options;
  }

  get banners() {
    return this._banners;
  }

  set banners(models) {
    this._banners = models;
  }

  async fetchBanners() {
    try {
      let options = '';
      switch (this._options) {
        case 'all': {
          break;
        }
        case 'active': {
          options = 'WHERE is_active = TRUE';
          break;
        }
        case 'inactive': {
          options = 'WHERE is_active = FALSE';
          break;
        }
        default: {
          throw new ApiError(500, 'Error when fetch banners.', ['No options provided to fetch.']);
        }
      }

      const response = await db.query(`SELECT * FROM ${dbSchema}.banners ${options} ORDER BY priority DESC`);

      if (response.rows.length === 0) {
        return [];
      }

      // prettier-ignore
      return response.rows
        .map((r) => ({ ...r, isActive: r.is_active }))
        .map(data => new BannerModel(data))
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = BannerModelCollection;
