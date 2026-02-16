const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { tharunAuthGuard } = require('../middleware/tharunAuthGuard');

router.post('/register', authController.tharunRegister);
router.post('/login', authController.tharunLogin);
router.get('/me', tharunAuthGuard, authController.tharunGetMe);

module.exports = router;
