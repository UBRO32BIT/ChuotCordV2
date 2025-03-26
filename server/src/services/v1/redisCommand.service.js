const redisClient = require("../../database/redis.database");

class RedisCommandService {
    constructor() {
        this.init();
    }

    async init() {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    }

    async addOnlineUser(userId) {
        await redisClient.sAdd("onlineUsers", userId);
    }
    async removeOnlineUser(userId) {
        await redisClient.sRem(`onlineUsers`, userId);
    }

    async removeOnlineUserFromGuild(userId, guildId) {
        const key = `online:guild:${guildId}`;
        await redisClient.sRem(key, userId);
    }

    async addOnlineUserToGuild(userId, guildId) {
        const key = `online:guild:${guildId}`;
        await redisClient.sAdd(key, userId);
    }

    async getListMemberOnline(guildId) {
        try {
            const result = await redisClient.sMembers(`online:guild:${guildId}`);
            return result;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}

module.exports = new RedisCommandService;