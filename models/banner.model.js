class BannerModel {
  isActive;
  src;
  priority;
  url;
  srcset;

  constructor(data) {
    this.isActive = data.isActive;
    this.src = data.src;
    this.priority = data.priority ? data.priority : 0;
    this.url = data.url;
    this.srcset = data.srcset ? JSON.parse(data.srcset) : null;
  }
}

module.exports = BannerModel;
