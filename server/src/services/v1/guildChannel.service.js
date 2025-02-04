const { default: mongoose } = require("mongoose");
const GuildChannelModel = require("../../models/guild/guildChannel.model");
const GuildModel = require("../../models/guild/guild.model");

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
    async UpdateChannel(channelId, updateData) {
        try {
            const updatedChannel = await GuildChannelModel.findByIdAndUpdate(
                channelId,
                updateData,
                { new: true }
            );
    
            if (!updatedChannel) {
                throw new Error('Channel not found');
            }
    
            return updatedChannel;
        } catch (error) {
            throw error;
        }
    }
    
    async DeleteChannel(channelId) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const channel = await GuildChannelModel.findById(channelId).session(session);
            if (!channel) {
                throw new Error('Channel not found');
            }
    
            // Delete the channel
            await channel.delete({ session });
    
            // Check if this was the last channel in the guild
            const remainingChannels = await GuildChannelModel.find({ guild: channel.guild }).session(session);
    
            if (remainingChannels.length === 0) {
                await GuildModel.findByIdAndUpdate(channel.guild, { logChannel: null }).session(session);
            }
    
            await session.commitTransaction();
            session.endSession();
    
            return { message: 'Channel deleted successfully' };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }    
}

module.exports = new GuildChannelService;