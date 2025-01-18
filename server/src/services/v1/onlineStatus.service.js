const redisClient = require("../../database/redis.database");
const userService = require("./user.service");

class OnlineStatusService {
    constructor() {
        this.init();
    }

    async init() {
        if (!redisClient.isOpen) {
            await redisClient.connect();  // Connect once when the service is initialized
        }
    }

    async processUserOnline(userId) {
        const user = await userService.GetUserById(userId);
        await this.addUser(userId);
        user.guilds.forEach(guild => {
            this.addUserToGuild(userId, guild);
        });
    }
    async processUserOffline(userId) {
        const user = await userService.GetUserById(userId);
        await this.removeUser(userId);
        user.guilds.forEach(guild => {
            this.removeUserFromGuild(userId, guild);
        });
    }
    async addUser(userId) {
        await redisClient.set(`online:${userId}`, "");
    }
    async removeUser(userId) {
        await redisClient.del(`online:${userId}`)
    }

    async addUserToGuild(userId, guildId) {
        const key = `online:guild:${guildId}`;
        await redisClient.sAdd(key, userId);
    }

    async getListMemberOnline(guildId) {
        try {
            const result = await redisClient.sMembers(`online:guild:${guildId}`);
            console.log(result);
            return result;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }

    async removeUserFromGuild(userId, guildId) {
        const key = `online:guild:${guildId}`;
        await redisClient.sRem(key, userId);
    }
}

module.exports = new OnlineStatusService;