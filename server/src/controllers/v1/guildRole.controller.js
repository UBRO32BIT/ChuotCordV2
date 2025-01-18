const { StatusCodes } = require("http-status-codes");
const guildService = require("../../services/v1/guild.service");
const errorHandler = require("./error.controller");

class GuildRoleController {
    async GetRolesByGuildId(req, res, next) {
        try {
            const { id } = req.params;
            const result = await guildService.GetGuildRoles(id);
            res.status(StatusCodes.OK).json({
                message: "Roles List",
                data: result,
            });
        }
        catch (error) {
            console.log(error);
            errorHandler(error, req, res, next);
        }
    }

    async CreateRole(req, res, next) {
        try {
            const { guildId } = req.params;
            const data = req.body;
            const result = await guildService.AddRole(guildId, data);
            res.status(StatusCodes.CREATED).json({
                message: "Role created",
                data: result,
            })
        }
        catch (error) {
            console.log(error);
            errorHandler(error, req, res, next);
        }
    }
    async GetRoleById(req, res, next) {
        try {
            res.status(StatusCodes.OK).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async CreateRole(req, res, next) {
        try {
            res.status(StatusCodes.CREATED).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async UpdateRole(req, res, next) {
        try {
            res.status(StatusCodes.OK).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async DeleteRole(req, res, next) {
        try {
            res.status(StatusCodes.NO_CONTENT).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
}

module.exports = new GuildRoleController;