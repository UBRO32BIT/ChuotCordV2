const redisCommandService = require("./redisCommand.service");
const userService = require("./user.service");

class OnlineStatusService {
    async processUserOnline(userId) {
        const user = await userService.GetUserById(userId);
        await redisCommandService.addOnlineUser(userId);
    
        const guildIds = user.guilds.map(guild => {
            redisCommandService.addOnlineUserToGuild(userId, guild);
            return guild._id.toString();
        });
    
        return guildIds;
    }
    async processUserOffline(userId) {
        const user = await userService.GetUserById(userId);
        await redisCommandService.removeOnlineUser(userId);
        user.guilds.forEach(guild => {
            redisCommandService.removeOnlineUserFromGuild(userId, guild);
        });
    }

    async getListMemberOnline(guildId) {
        return await redisCommandService.getListMemberOnline(guildId);
    }
}

module.exports = new OnlineStatusService;