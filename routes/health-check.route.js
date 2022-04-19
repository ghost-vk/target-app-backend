const Router = require('express').Router
const HealthCheckController = require('../controllers/health-check.controller')

const router = new Router()

router.get('/', HealthCheckController.isApiHealthy)

module.exports = router
