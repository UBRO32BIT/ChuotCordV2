const guildInviteService = require("../../services/v1/guildInvite.service");
const { StatusCodes } = require("http-status-codes");
const handleApiError = require("./error.controller");
const { GUILD_INVITE_EXPIRATION_VALUES } = require("../../enums/guildInviteExpiration.enum");

class InviteController {
    /**
     * Create a new guild invite
     */
    async CreateInvite(req, res, next) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const { expiration } = req.body;

            if (!id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Guild ID is required",
                });
            }

            if (!GUILD_INVITE_EXPIRATION_VALUES.includes(expiration)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid expiration option. Valid options: ${GUILD_INVITE_EXPIRATION_VALUES.join(", ")}`,
                });
            }

            const guildInvite = await guildInviteService.CreateInvite({ userId, id, expiration });

            return res.status(StatusCodes.CREATED).json({
                message: "Guild invite created",
                data: guildInvite,
            });
        } catch (error) {
            handleApiError(error, req, res, next);
        }
    }

    /**
     * Join guild via invite code
     */
    async AddMemberByInviteCode(req, res, next) {
        try {
            const { inviteCode } = req.params;
            const { userId } = req.user;

            const guildResult = await guildInviteService.AddMemberByInviteCode(inviteCode, userId);

            return res.status(StatusCodes.OK).json({
                message: "Joined successfully",
                data: guildResult,
            });
        } catch (error) {
            handleApiError(error, req, res, next);
        }
    }

    /**
     * Get invite by code
     */
    async GetInviteByCode(req, res, next) {
        try {
            const { inviteCode } = req.params;
            const guildInvite = await guildInviteService.GetInviteByCode(inviteCode);

            if (!guildInvite) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "Invite not found or expired",
                    data: null,
                });
            }

            return res.status(StatusCodes.OK).json({
                message: "Invite found",
                data: guildInvite,
            });
        } catch (error) {
            handleApiError(error, req, res, next);
        }
    }

    /**
     * Get all invites for a guild (excluding expired)
     */
    async GetInvitesByGuildId(req, res, next) {
        try {
            const { id } = req.params;
            const guildInvites = await guildInviteService.GetInvitesByGuildId(id);

            const validInvites = guildInvites.filter(
                (invite) => invite.expiresAt && new Date(invite.expiresAt) > new Date()
            );

            return res.status(StatusCodes.OK).json({
                message: "Invites found",
                data: validInvites,
            });
        } catch (error) {
            handleApiError(error, req, res, next);
        }
    }

    /**
     * Delete invite by code
     */
    async DeleteInvite(req, res, next) {
        try {
            const { inviteCode } = req.params;
            await guildInviteService.DeleteInvite(inviteCode);

            return res.status(StatusCodes.NO_CONTENT).json({
                message: "Invite deleted",
            });
        } catch (error) {
            handleApiError(error, req, res, next);
        }
    }
}

module.exports = new InviteController();