const express = require('express');
const guildController = require('../../controllers/v1/guild.controller')
const guildInviteController = require('../../controllers/v1/guildInvite.controller')
const guildPermissionController = require('../../controllers/v1/guildPermission.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');
const channelRoute = require('./guildChannel.route');
const roleRoute = require('./guildRole.route');
const {AuthorizeGuild, ValidateRemoveMember} = require('../../middlewares/guild');
const { uploadGuildImage } = require('../../config/multer.config');

const router = express.Router();

//Routes for guild permissions
router.get('/permissions', CheckAuth, guildPermissionController.GetAll);

//Routes for guilds
router.get('/', CheckAuth, guildController.GetGuilds);
router.get('/:id', CheckAuth, guildController.GetGuildById);
router.post('/', CheckAuth, guildController.CreateGuild);
router.post('/:id/ban-member', CheckAuth, AuthorizeGuild, guildController.BanMemberFromGuild);
router.patch('/:id', CheckAuth, AuthorizeGuild, uploadGuildImage.single("image"), guildController.UpdateGuild);
router.patch('/:id/remove-member/:memberId', CheckAuth, AuthorizeGuild, ValidateRemoveMember, guildController.RemoveMemberFromGuild);
router.delete('/:id', CheckAuth, AuthorizeGuild, guildController.DeleteGuild);
router.patch('/:id/transfer-ownership', CheckAuth, AuthorizeGuild, guildController.TransferOwnership);

//Routes for guild channels
router.use('/:id/channels', channelRoute);
//Routes for guild roles
router.use('/:id/roles', roleRoute);
//Routes for guild invites
router.post('/:id/invites', CheckAuth, guildInviteController.CreateInvite);
router.get('/:id/invites', CheckAuth, guildInviteController.GetInvitesByGuildId);

module.exports = router;