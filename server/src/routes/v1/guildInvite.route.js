const express = require('express');
const guildInviteController = require('../../controllers/v1/guildInvite.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');

const router = express.Router({ mergeParams: true });

//router.get('/', CheckAuth, guildInviteController.GetChannelsByGuildId);
router.get('/:inviteCode', CheckAuth, guildInviteController.GetInviteByCode);
router.post('/:inviteCode', CheckAuth, guildInviteController.AddMemberByInviteCode);

module.exports = router;