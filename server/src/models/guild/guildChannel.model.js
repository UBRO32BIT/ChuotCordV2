const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { ChannelTypes } = require('../../constants/channel.contraints');
const guildChannels = new mongoose.Schema({
    guild: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guilds',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        enum: Object.values(ChannelTypes),
        required: true,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Messages',
    }],
    accessRoles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuildRoles',
    }],
})

guildChannels.plugin(mongooseDelete, {deletedAt: true});

const GuildChannelModel = mongoose.model('GuildChannels', guildChannels);
module.exports = GuildChannelModel;