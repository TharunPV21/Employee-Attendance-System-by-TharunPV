const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { tharunAuthGuard, tharunManagerOnly } = require('../middleware/tharunAuthGuard');

router.use(tharunAuthGuard);

router.post('/checkin', attendanceController.tharunCheckIn);
router.post('/checkout', attendanceController.tharunCheckOut);
router.get('/my-history', attendanceController.tharunMyHistory);
router.get('/my-summary', attendanceController.tharunMySummary);
router.get('/today', attendanceController.tharunTodayStatus);

router.get('/all', tharunManagerOnly, attendanceController.tharunAllAttendance);
router.get('/employee/:id', tharunManagerOnly, attendanceController.tharunEmployeeAttendance);
router.get('/summary', tharunManagerOnly, attendanceController.tharunTeamSummary);
router.get('/export', tharunManagerOnly, attendanceController.tharunExportCsv);
router.get('/today-status', tharunManagerOnly, attendanceController.tharunTodayStatusAll);

module.exports = router;
