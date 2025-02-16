const express = require('express');
const {uploadAttachment} = require('../../config/multer.config');
const messageController = require('../../controllers/v1/message.controller');
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');
const { AuthorizeGuildMember } = require('../../middlewares/guild');

const router = express.Router({ mergeParams: true });

router.get('/', CheckAuth, AuthorizeGuildMember, messageController.GetMessagesByChannelId);
router.post("/", CheckAuth, AuthorizeGuildMember, uploadAttachment.array("files"), messageController.AddMessage);
router.get('/search', CheckAuth, AuthorizeGuildMember, messageController.SearchMessages);

module.exports = router;