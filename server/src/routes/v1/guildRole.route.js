const express = require('express');
const guildRoleController = require('../../controllers/v1/guildRole.controller')
const {checkAccessToken: CheckAuth} = require('../../middlewares/auth');
const {AuthorizeGuild} = require('../../middlewares/guild');

const router = express.Router({ mergeParams: true });

router.get('/', CheckAuth, guildRoleController.GetRolesByGuildId);
// router.get('/:id', CheckAuth, guildRoleController.GetRoleById);
router.post('/', CheckAuth, AuthorizeGuild, guildRoleController.CreateRole);
router.post('/assign', CheckAuth, AuthorizeGuild, guildRoleController.AssignRole);
// router.patch('/:id', CheckAuth, guildRoleController.UpdateRole);
// router.delete('/:id', CheckAuth, AuthorizeGuild, guildRoleController.DeleteRole);

module.exports = router;