const GuildChannelModel = require("../../models/guild/guildChannel.model");

class GuildChannelService {
    async GetAllChannel() {

    }
    async GetChannelById(id) {
        try {
            const guild = await GuildChannelModel.findById(id).lean();
            return guild;
        }
        catch (error) {
            return null;
        }
    }
    async CreateChannel(guildId, name, description, type) {
        try {
            const data = {
                guild: guildId,
                name: name,
                description: description,
                type: type,
            }
            const guildChannel = new GuildChannelModel({...data});
            return guildChannel.save().catch();
        }
        catch (error) {
            throw error;
        }
    }
    async UpdateChannel() {

    }
    async DeleteChannel() {

    }
}

module.exports = new GuildChannelService;