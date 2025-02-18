const { StatusCodes } = require("http-status-codes");
const ApiError = require("../../errors/ApiError");
const GuildInviteModel = require("../../models/guild/guildInvite.model");
const guildService = require("./guild.service");
const userService = require("./user.service");
const ErrorCodes = require("../../errors/errorCodes");
const { getSocket } = require("../../utils/socket");

class GuildInviteService {
    async CreateInvite({id, userId}) {
        try {
            const data = {
                guild: id,
                creator: userId,
            }
            const guildInvite = new GuildInviteModel({...data});
            return guildInvite.save().catch();
        }
        catch (error) {
            throw error;
        }
    }

    async GetInviteByCode(inviteCode) {
        try {
            const guildInvite = await GuildInviteModel.findOne({
                string: inviteCode,
            })
            .populate({
                path: 'guild',
                select: '_id name image members'
            })
            .populate({
                path: 'creator',
                select: '_id username profilePicture'
            })
            .lean();
            return guildInvite;
        }
        catch (error) {
            return null;
        }
    }

    async GetInvitesByGuildId(guildId) {
        try {
            const guildInvites = await GuildInviteModel.find({
                guild: guildId,
            })
            .populate({
                path: 'guild',
                select: '_id name image members'
            })
            .populate({
                path: 'creator',
                select: '_id username profilePicture'
            })
            .lean();
            return guildInvites;
        }
        catch (error) {
            return null;
        }
    }

    async AddMemberByInviteCode(inviteCode, userId) {
        try {
            const invite = await this.GetInviteByCode(inviteCode);
            if (!invite) {
                throw new ApiError(ErrorCodes.GUILD_INVITE_NOT_FOUND);
            }
            const guildMembers = invite.guild.members
            let isGuildMember = false;
            if (Array.isArray(guildMembers)) {
                guildMembers.map((member) => {
                    console.log(member.memberId.toString() === userId)
                    if (member.memberId.toString() === userId) {
                        isGuildMember = true;
                        return;
                    }
                })
            }
            if (isGuildMember) {
                throw new ApiError(ErrorCodes.USER_ALREADY_GUILD_MEMBER);
            }
            await guildService.AddMember(invite.guild._id, userId);
            await userService.AppendGroup(userId, invite.guild._id);
            
            const socket = getSocket();
            const guildResult = await guildService.GetGuildById(invite.guild._id);
            socket.to(guildResult._id.toString()).emit('user_joined_guild', {
                guildId: guildResult._id,
                member: guildResult.members.find(member => member.memberId._id.toString() === userId)
            });
            return guildResult;
        }
        catch (error) {
            throw error;
        }
    }
}

module.exports = new GuildInviteService;