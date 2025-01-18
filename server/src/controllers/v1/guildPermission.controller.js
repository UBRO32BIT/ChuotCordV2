const GuildPermissionService = require('../../services/v1/guildPermission.service');
const { StatusCodes } = require('http-status-codes');

class GuildPermissionController {
    async GetAll(req, res, next) {
        try {
            const result = await GuildPermissionService.GetAll();
            res.status(StatusCodes.OK).json({
                message: "Guild Permissions",
                data: result,
            });
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
}

module.exports = new GuildPermissionController;