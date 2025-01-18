const express = require('express');
const authController = require('../../controllers/v1/auth.controller')
const {checkRefreshToken} = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', authController.Register);
router.post('/login', authController.Login);
router.post('/send-recovery-email', authController.SendRecoveryEmail);
router.post('/reset-password', authController.ResetPassword);
router.post('/refresh-token', checkRefreshToken, authController.RefreshToken);

module.exports = router;