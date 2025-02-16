const express = require('express');
const guildInviteController = require('../../controllers/v1/guildInvite.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');
const { AuthorizeGuildMember } = require('../../middlewares/guild');

const router = express.Router({ mergeParams: true });

//router.get('/', CheckAuth, guildInviteController.GetChannelsByGuildId);
router.get('/:inviteCode', CheckAuth, AuthorizeGuildMember, guildInviteController.GetInviteByCode);
router.post('/:inviteCode', CheckAuth, guildInviteController.AddMemberByInviteCode);

module.exports = router;