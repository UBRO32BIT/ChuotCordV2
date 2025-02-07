const express = require('express');
const {uploadAttachment} = require('../../config/multer.config');
const messageController = require('../../controllers/v1/message.controller');
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth')

const router = express.Router({ mergeParams: true });

router.get('/', CheckAuth, messageController.GetMessagesByChannelId);
router.post("/", CheckAuth, uploadAttachment.array("files"), messageController.AddMessage);
router.get('/search', CheckAuth, messageController.SearchMessages);

module.exports = router;