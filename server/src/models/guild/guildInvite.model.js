const mongoose = require('mongoose');
const generateInviteString = require('../../utils/string.util');

const guildInvites = new mongoose.Schema({
    guild: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guilds',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    string: {
        type: String,
        required: true,
        unique: true,
        default: generateInviteString,
    },
    expiration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuildInviteExpirations',
        default: null,
        require: true,
    }
},{timestamps: true})

const GuildInvites = mongoose.model('GuildInvites', guildInvites);
module.exports = GuildInvites;