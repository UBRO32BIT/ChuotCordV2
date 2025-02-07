const messageService  = require('../../services/v1/message.service');
const { StatusCodes } = require('http-status-codes');
const { getFileType } = require('../../utils/file.util');
const errorHandler = require('./error.controller');

class MessageController {
    async GetMessagesByChannelId(req, res, next) {
        try {
            const {channelId} = req.params;
            const { limit, before } = req.query;
            const messages = await messageService.GetMessagesByChannelId(channelId, {
                limit: parseInt(limit, 10) || 20,
                before,
            });
            res.status(StatusCodes.OK).json({
                message: "Message List",
                data: messages,
            });
        }
        catch (error) {
            console.log(error);
            errorHandler(error, req, res, next);
        }
    }

    async SearchMessages(req, res, next) {
        try {
            const {id: guildId} = req.params;
            const {
                channelId,
                content,
                attachmentType,
                sender,
                before,
                after,
                page = 1,
                limit = 20
            } = req.query;
    
            const filters = {
                channelId,
                content,
                attachmentType,
                sender,
                before: before ? new Date(before) : null,
                after: after ? new Date(after) : null,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10)
            };
    
            const messages = await messageService.SearchMessages(guildId, filters);
            return res.status(StatusCodes.OK).json(messages);
        } catch (error) {
            console.error('Error searching messages:', error);
            errorHandler(error, req, res, next);
        }
    }

    async AddMessage(req, res, next) {
        try {
            const { channelId } = req.params;
            const { userId } = req.user;
            const { message } = req.body;
            // Classify files by type and generate file URLs
            const fileUrls = req?.files?.map((file) => {
                const fileType = getFileType(file.originalname); // Get the file type based on the filename
                return {
                    type: fileType, // Use the classified type
                    url: `/uploads/${file.filename}`,
                };
            });

            const messageData = {
                channelId,
                message,
                userId,
                attachments: fileUrls,
            };
            const savedMessage = await messageService.AddMessage(messageData);
            return res.status(201).json(savedMessage);
        }
        catch (error) {
            console.log(error);
            errorHandler(error, req, res, next);
        }
    }
}

module.exports = new MessageController;