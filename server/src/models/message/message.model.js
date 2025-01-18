const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const messages = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    replyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Messages',
    },
    attachments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachments',
    }],
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channels',
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    }
})

messages.plugin(mongooseDelete, {deletedAt: true});

const Message = mongoose.model('Messages', messages);
module.exports = Message;