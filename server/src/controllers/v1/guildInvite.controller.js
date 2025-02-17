const guildInviteService = require("../../services/v1/guildInvite.service");
const { StatusCodes } = require('http-status-codes');
const handleApiError = require("./error.controller");

class InviteController {
    async CreateInvite(req, res, next) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            if (!id) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Guild ID is required",
                })
            }
            else {
                const guildInvite = await guildInviteService.CreateInvite({userId, id});
                res.status(StatusCodes.CREATED).json({
                    message: "Guild invite created",
                    data: guildInvite,
                });
            }
        }
        catch (error) {
            console.log(error);
            handleApiError(error, req, res, next);
        }
    }
    async AddMemberByInviteCode(req, res, next) {
        try {
            const { inviteCode } = req.params;
            const { userId } = req.user;
            const guildResult = await guildInviteService.AddMemberByInviteCode(inviteCode, userId);
            res.status(StatusCodes.OK).json({
                message: "Joined successfully",
                data: guildResult,
            });
        }
        catch (error) {
            handleApiError(error, req, res, next);
        }
    }
    async GetInviteByCode(req, res, next) {
        try {
            const { inviteCode } = req.params;
            const guildInvite = await guildInviteService.GetInviteByCode(inviteCode);
            if (guildInvite) {
                res.status(StatusCodes.OK).json({
                    message: "Invite found",
                    data: guildInvite,
                });
            }
            else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "Invite not found or expired",
                    data: null
                });
            }
        }
        catch (error) {
            handleApiError(error, req, res, next);
        }
    }

    async GetInvitesByGuildId(req, res, next) {
        try {
            const { id } = req.params;
            const guildInvites = await guildInviteService.GetInvitesByGuildId(id);
            res.status(StatusCodes.OK).json({
                message: "Invite found",
                data: guildInvites,
            });
        }
        catch (error) {
            handleApiError(error, req, res, next);
        }
    }
    async DeleteInvite(req, res, next) {
        try {
            res.status(StatusCodes.NO_CONTENT).json({message: "test"});
        }
        catch (error) {
            handleApiError(error, req, res, next);
        }
    }
}

module.exports = new InviteController;