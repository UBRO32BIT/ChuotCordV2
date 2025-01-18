const { StatusCodes } = require('http-status-codes');
const logger = require('../../config/logger');
const guildChannelService = require("../../services/v1/guildChannel.service");
const guildService = require('../../services/v1/guild.service');
const errorHandler = require('./error.controller');

class GuildChannelController {
    async GetChannelsByGuildId(req, res, next) {
        try {
            res.status(StatusCodes.OK).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async GetChannelById(req, res, next) {
        try {
            const { channelId } = req.params;
            const guildChannel = await guildChannelService.GetChannelById(channelId);
            if (guildChannel) {
                res.status(StatusCodes.OK).json({
                    message: "Channel found",
                    data: guildChannel
                });
            }
            else {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: "Channel not found",
                    data: null
                });
            }
        }
        catch (error) {
            logger.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async CreateChannel(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`[GuildController]: Start creating channel with body: ` + req.body);
            const {name, description, type} = req.body;
            if (!id || !name || !type) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Guild ID and channel name and type is required"
                })
            }
            else {
                const data = await guildChannelService.CreateChannel(id, name, description, type);
                await guildService.AddGuildChannel(id, data._id);
                res.status(StatusCodes.CREATED).json({
                    message: "Channel created",
                    data: data,
                });
            }
        }
        catch (error) {
            logger.error(error);
            errorHandler(error, req, res, next);
        }
    }
    async UpdateChannel(req, res, next) {
        try {
            res.status(StatusCodes.OK).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async DeleteChannel(req, res, next) {
        try {
            res.status(StatusCodes.NO_CONTENT).json({message: "test"});
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
}

module.exports = new GuildChannelController;