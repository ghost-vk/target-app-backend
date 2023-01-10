const Router = require('express').Router;
const BannersController = require('./../controllers/banners.controller');

const router = new Router();

router.get('/', BannersController.getBanners);

module.exports = router;
