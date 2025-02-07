const GuildModel = require("../../models/guild/guild.model");
const GuildRoles = require("../../models/guild/guildRole.model");
const GuildPermissions = require("../../models/guild/guildPermission.model");
const ErrorCodes = require("../../errors/errorCodes");
const MessageService = require("./message.service");
const ApiError = require("../../errors/ApiError");

class GuildService {
    async GetGuilds() {
        try {
            const guilds = await GuildModel.find()
                .populate({
                    path: 'channels',
                    select: '_id name type',
                })
                .populate({
                    path: 'members.memberId',
                    select: '_id username profilePicture onlinePresence',
                })
                .populate({
                    path: 'members.roles',
                    select: '_id name color permissionCodes displayType',
                });
    
            return guilds;
        } catch (error) {
            console.error(error);
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

    async GetMemberRoles(guildId, memberId) {
        try {
            const guild = await GuildModel.findById(guildId);
            if (!guild) {
                throw new ApiError(ErrorCodes.GUILD_NOT_FOUND);
            }
            const member = guild.members.find(
                (member) => member.memberId.toString() === memberId
            )
            if (!member) {
                throw new ApiError(ErrorCodes.NOT_A_MEMBER);
            }
            return member.roles;
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
    async AssignRole(guildId, memberId, roleIds) {
        try {
            await GuildModel.findOneAndUpdate(
                {
                    _id: guildId,
                    'members.memberId': memberId,
                },
                {
                    $set: { 'members.$.roles': Array.isArray(roleIds) ? roleIds : [roleIds] },
                }
            );
            return await this.GetGuildById(guildId);
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

    async UpdateGuild(guildId, updateData) {
        try {
            const guild = await GuildModel.findById(guildId);
            if (!guild) {
                throw new ApiError(ErrorCodes.GUILD_NOT_FOUND);
            }
    
            // Update only the allowed fields
            if (updateData.name) guild.name = updateData.name;
            if (updateData.image) guild.image = updateData.image;
            if (updateData.logChannel) guild.logChannel = updateData.logChannel;
            if (typeof updateData.enableMemberVerification !== 'undefined') {
                guild.enableMemberVerification = updateData.enableMemberVerification;
            }
            if (typeof updateData.enableJoinLog !== 'undefined') {
                guild.enableJoinLog = updateData.enableJoinLog;
            }
            if (typeof updateData.canGenerateInvite !== 'undefined') {
                guild.canGenerateInvite = updateData.canGenerateInvite;
            }
    
            await guild.save();
            return await this.GetGuildById(guildId);
        } catch (error) {
            throw new Error(`Failed to update guild: ${error.message}`);
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

    async TransferOwnership(guildId, newOwnerId) {
        try {
            const guild = await GuildModel.findById(guildId);
            if (!guild) {
                throw new ApiError(ErrorCodes.GUILD_NOT_FOUND);
            }

            if (guild.owner.toString() === newOwnerId) {
                throw new ApiError(ErrorCodes.ALREADY_OWNER);
            }

            const isMember = guild.members.some(
                member => member.memberId.toString() === newOwnerId
            );
            if (!isMember) {
                throw new ApiError(ErrorCodes.NOT_A_MEMBER);
            }
            
            guild.owner = newOwnerId;
            await guild.save();
        }
        catch (error) {
            throw error;
        }
    }
    async AddMember(guildId, memberId) {
        try {
            const guild = await GuildModel.findById(guildId);
            
            await GuildModel.findByIdAndUpdate(
                guildId,
                { $push: { members: { memberId: memberId } } },
                { new: true, useFindAndModify: false }
            );

            
            if (guild.logChannel && guild.enableJoinLog) {
                await MessageService.AddLogMessage(memberId, guild.logChannel, 'join');
            }
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
            const guild = await GuildModel.findById(guildId);
            if (guild.logChannel && guild.enableJoinLog) {
                await MessageService.AddLogMessage(memberId, guild.logChannel, 'leave');
            }
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

            if (guild.logChannel && guild.enableJoinLog) {
                await MessageService.AddLogMessage(memberId, guild.logChannel, 'ban');
            }
    
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