const MessageModel = require("../../models/message/message.model");
const AttachmentModel = require("../../models/message/attachment.model");
const { emitMessage } = require("../../utils/socket");

class MessageService {
    async GetMessagesByChannelId(channelId, { limit = 20, before = null }) {
        try {
            const query = { channelId };

            // If 'before' is provided, fetch messages older than the cursor
            if (before) {
                query._id = { $lt: before };
            }

            const messages = await MessageModel.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .populate([
                    {
                        path: 'sender',
                        select: '_id username profilePicture',
                    },
                    {
                        path: 'attachments',
                        select: '_id type originalFileName url fullUrl',
                    }
                ]);

            return messages.reverse();
        } catch (error) {
            throw error;
        }
    }

    async SearchMessages(guildId, { 
        channelId, 
        content, 
        attachmentType, 
        sender, 
        before, 
        after, 
        page = 1, 
        limit = 20 
    }) {
        try {
            const query = { guildId };
    
            if (channelId) query.channelId = channelId;
            if (content) query.content = { $regex: content, $options: 'i' };
            if (sender) query.sender = sender;
            if (before || after) {
                query.timestamp = {};
                if (before) query.timestamp.$lte = before;
                if (after) query.timestamp.$gte = after;
            }
            if (attachmentType) {
                query.attachments = { 
                    $exists: true, 
                    $not: { $size: 0 } 
                };
            }
    
            const messages = await MessageModel.paginate(query, {
                page,
                limit,
                sort: { timestamp: -1 },
                populate: [
                    { path: 'sender', select: '_id username profilePicture' },
                    { 
                        path: 'attachments',
                        match: attachmentType ? { type: attachmentType } : {},
                        select: '_id type originalFileName url fullUrl'
                    }
                ]
            });
    
            return messages;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async AddMessage(data) {
        try {
            const attachments = Array.isArray(data.attachments)
                ? await Promise.all(data.attachments.map(async (attachment) => {
                    const newAttachment = new AttachmentModel(attachment);
                    await newAttachment.save();
                    return newAttachment._id;
                }))
                : [];

            const processedData = {
                sender: data.userId,
                content: data.message,
                replyId: data.replyId,
                type: data.type,
                attachments,
                channelId: data.channelId,
            };

            const message = new MessageModel({ ...processedData });
            const savedMessage = await message.save();
            const result = await savedMessage.populate([
                {
                    path: 'sender',
                    select: '_id username profilePicture',
                },
                {
                    path: 'attachments',
                    select: '_id type originalFileName url fullUrl',
                }
            ]);

            emitMessage(data.channelId, result);

            return result;
        } catch (error) {
            throw error;
        }
    }

    async AddLogMessage(userId, channelId, logType) {
        try {
            const data = {
                userId,
                channelId,
                type: logType,
            };

            return await this.AddMessage(data);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new MessageService;