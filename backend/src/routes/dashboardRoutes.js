const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { tharunAuthGuard, tharunManagerOnly } = require('../middleware/tharunAuthGuard');

router.use(tharunAuthGuard);

router.get('/employee', dashboardController.tharunEmployeeDashboard);
router.get('/manager', tharunManagerOnly, dashboardController.tharunManagerDashboard);

module.exports = router;
