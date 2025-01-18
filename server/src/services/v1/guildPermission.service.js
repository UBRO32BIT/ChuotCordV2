const GuildPermissionModel = require('../../models/guild/guildPermission.model');

class GuildPermissionService {
    async GetAll() {
        try {
            const guildPermissions = await GuildPermissionModel.find();
            return guildPermissions;
        }
        catch (error) {
            throw error;
        }
    }
}

module.exports = new GuildPermissionService;