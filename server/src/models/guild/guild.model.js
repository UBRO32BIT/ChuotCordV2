const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');
const config = require('../../config/config');

const guilds = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    image: {
        type: String,
        required: false,
        default: null,
        get: function (value) {
            const host = config.serverHost;
            return value ? `${host}${value}` : null;
        },
    },
    channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuildChannels',
    }],
    logChannel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuildChannels',
    },
    enableMemberVerification: {
        type: Boolean,
        default: false,
    },
    enableJoinLog: {
        type: Boolean,
        default: false,
    },
    canGenerateInvite: {
        type: Boolean,
        default: true,
    },
    members: [{
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        },
        alias: {
            type: String,
        },
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GuildRoles'
        }],
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        }
    }],
    blacklists: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        },
        reason: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
        endDate: {
            type: Date,
        }
    }],
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuildRoles'
    }]
}, {
    timestamps: true, 
    toObject : {getters: true}, 
    toJSON : {getters: true}
})

guilds.plugin(mongooseDelete, {deletedAt: true});
guilds.plugin(mongoosePaginate);

const Guild = mongoose.model('Guilds', guilds);
module.exports = Guild;