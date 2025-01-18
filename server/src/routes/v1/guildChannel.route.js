const express = require('express');
const messageRoute = require('./message.route');
const channelController = require('../../controllers/v1/guildChannel.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth')

const router = express.Router({ mergeParams: true });

router.get('/', CheckAuth, channelController.GetChannelsByGuildId);
router.get('/:channelId', CheckAuth, channelController.GetChannelById);
router.post('/', CheckAuth, channelController.CreateChannel);
router.patch('/:channelId', CheckAuth, channelController.UpdateChannel);
router.delete('/:channelId', CheckAuth, channelController.DeleteChannel);

router.use("/:channelId/messages", messageRoute);

module.exports = router;