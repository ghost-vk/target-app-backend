const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/lead.controller');

router.post('/', LeadController.createLead.bind(LeadController));

module.exports = router;
