const GuildModel = require("../../models/guild/guild.model");
const GuildRoles = require("../../models/guild/guildRole.model");
const GuildPermissions = require("../../models/guild/guildPermission.model");
const ErrorCodes = require("../../errors/errorCodes");
const ApiError = require("../../errors/ApiError");

class GuildService {
    async GetGuilds() {
        try {
            const guilds = await GuildModel.paginate();
            return guilds;
        }
        catch (error) {
            return null;
        }
    }
    async GetGuildById(id) {
        try {
            const guild = await GuildModel.findById(id)
            .populate({
                path: 'channels',
                select: '_id name type',
            })
            .populate({
                path: 'members.memberId',
                select: '_id username profilePicture onlinePresence'
            })
            .populate({
                path: 'members.roles',
                select: '_id name color permissionCodes displayType'
            });
            return guild
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async GetGuildRoles(guildId) {
        try {
            const roles = await GuildRoles.find({ guildId: guildId });
            return roles;
        }
        catch (error) {
            throw error;
        }
    }
    async AddRole(guildId, data) {
        try {
            const role = new GuildRoles({ ...data, guildId: guildId });
            return role.save();
        }
        catch (error) {
            throw error;
        }
    }

    async CreateGuild({userId, name}) {
        const data = {
            name: name,
            owner: userId,
            members: [{
                memberId: userId,
            }]
        }
        try {
            const guild = new GuildModel({...data});
            return guild.save().catch();
        }
        catch (error) {
            throw error;
        }
    }
    async AddGuildChannel(guildId, channelId) {
        try {
            await GuildModel.findOneAndUpdate(
                { _id: guildId },
                { $addToSet: { channels: channelId } }
            );
        }
        catch (error) {
            throw error;
        }
    }
    async AddMember(guildId, memberId) {
        try {
            await GuildModel.findByIdAndUpdate(
                guildId,
                { $push: { members: { memberId: memberId } } },
                { new: true, useFindAndModify: false }
            );
        }
        catch (error) {
            throw error;
        }
    }
    async RemoveMember(guildId, memberId) {
        try {
            await GuildModel.findByIdAndUpdate(
                guildId,
                { $pull: { members: memberId } }
            );
        }
        catch (error) {
            throw error;
        }
    }
    async BanMember(guildId, memberId, reason, endDate = null) {
        try {
            // Check if the member is already in the blacklist
            const guild = await GuildModel.findById(guildId);
            if (!guild) throw new ApiError(ErrorCodes.GUILD_NOT_FOUND);
    
            const isBlacklisted = guild.blacklists.some(
                (blacklist) => blacklist.userId.toString() === memberId
            );
    
            if (isBlacklisted) {
                throw new ApiError(ErrorCodes.MEMBER_ALREADY_BANNED);
            }
    
            // Add the member to the blacklist
            await GuildModel.findByIdAndUpdate(
                guildId,
                {
                    $push: {
                        blacklists: {
                            userId: memberId,
                            reason: reason,
                            endDate: endDate,
                        },
                    },
                    $pull: {
                        members: { memberId: memberId }, // Remove the member from the guild
                    },
                },
                { new: true, useFindAndModify: false }
            );
    
            return { success: true, message: 'Member has been banned successfully' };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async DeleteGuild(id) {
        try {
            const guild = await GuildModel.findById(id);
            const result = await guild.delete();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
}

module.exports = new GuildService;