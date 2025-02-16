const express = require('express');
const messageRoute = require('./message.route');
const channelController = require('../../controllers/v1/guildChannel.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');
const { AuthorizeGuildMember, AuthorizeGuild } = require('../../middlewares/guild');

const router = express.Router({ mergeParams: true });

router.get('/', CheckAuth, AuthorizeGuildMember, channelController.GetChannelsByGuildId);
router.get('/:channelId', CheckAuth, AuthorizeGuildMember, channelController.GetChannelById);
router.post('/', CheckAuth, AuthorizeGuild, channelController.CreateChannel);
router.patch('/:channelId', CheckAuth, AuthorizeGuild, channelController.UpdateChannel);
router.delete('/:channelId', CheckAuth, AuthorizeGuild, channelController.DeleteChannel);

router.use("/:channelId/messages", messageRoute);

module.exports = router;