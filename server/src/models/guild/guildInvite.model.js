const mongoose = require('mongoose');
const generateInviteString = require('../../utils/string.util');
const { GUILD_INVITE_EXPIRATION_VALUES } = require('../../enums/guildInviteExpiration.enum');

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
        type: String,
        enum: GUILD_INVITE_EXPIRATION_VALUES,
        required: true,
        default: '1h'
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// TTL index for auto-removal
guildInvites.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GuildInvites = mongoose.model('GuildInvites', guildInvites);
module.exports = GuildInvites;