const { StatusCodes } = require("http-status-codes");
const ms = require("ms");
const ApiError = require("../../errors/ApiError");
const ErrorCodes = require("../../errors/errorCodes");
const GuildInviteModel = require("../../models/guild/guildInvite.model");
const guildService = require("./guild.service");
const userService = require("./user.service");
const { emitGuildUpdated } = require("../../utils/socket");

// Common populate options
const GUILD_POPULATE = {
    path: "guild",
    select: "_id name image members",
};
const CREATOR_POPULATE = {
    path: "creator",
    select: "_id username profilePicture",
};

class GuildInviteService {
    /**
     * Create a new guild invite
     */
    async CreateInvite({ id, userId, expiration }) {
        const expirationMs = ms(expiration);
        if (!expirationMs) {
            throw new ApiError(ErrorCodes.INVALID_INVITE_EXPIRATION);
        }

        const expiresAt = new Date(Date.now() + expirationMs);

        const guildInvite = new GuildInviteModel({
            guild: id,
            creator: userId,
            expiration,
            expiresAt,
        });

        return guildInvite.save();
    }

    /**
     * Find invite by code
     */
    async GetInviteByCode(inviteCode) {
        try {
            return await GuildInviteModel.findOne({ string: inviteCode })
                .populate(GUILD_POPULATE)
                .populate(CREATOR_POPULATE)
                .lean();
        } catch (error) {
            return null;
        }
    }

    /**
     * Get all invites for a guild
     */
    async GetInvitesByGuildId(guildId) {
        try {
            return await GuildInviteModel.find({ guild: guildId })
                .populate(GUILD_POPULATE)
                .populate(CREATOR_POPULATE)
                .lean();
        } catch (error) {
            return null;
        }
    }

    /**
     * Add a user to a guild using an invite
     */
    async AddMemberByInviteCode(inviteCode, userId) {
        const invite = await this.GetInviteByCode(inviteCode);

        if (!invite) {
            throw new ApiError(ErrorCodes.GUILD_INVITE_NOT_FOUND);
        }

        if (invite.expiresAt && invite.expiresAt < new Date()) {
            throw new ApiError(ErrorCodes.GUILD_INVITE_EXPIRED);
        }

        const isGuildMember = Array.isArray(invite.guild.members) &&
            invite.guild.members.some(
                (member) => member.memberId.toString() === userId
            );

        if (isGuildMember) {
            throw new ApiError(ErrorCodes.USER_ALREADY_GUILD_MEMBER);
        }

        await guildService.AddMember(invite.guild._id, userId);
        await userService.AppendGroup(userId, invite.guild._id);

        const guildResult = await guildService.GetGuildById(invite.guild._id);
        emitGuildUpdated(guildResult);

        return guildResult;
    }
}

module.exports = new GuildInviteService();