const express = require('express');
const {uploadUserProfile} = require('../../config/multer.config');
const userController = require('../../controllers/v1/user.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');

const router = express.Router();

router.get('/', CheckAuth, userController.GetUsers);
router.post('/change-password', CheckAuth, userController.ChangePassword);
router.post('/send-verify-email', CheckAuth, userController.SendVerifyEmail);
router.get('/guilds', CheckAuth, userController.GetGroupsByUserId);
router.get('/:id', userController.GetUserById); 
router.patch('/update', CheckAuth, uploadUserProfile.single("profilePicture"), userController.UpdateUser);
router.patch('/ban/:id', CheckAuth, userController.BanUser);

module.exports = router;