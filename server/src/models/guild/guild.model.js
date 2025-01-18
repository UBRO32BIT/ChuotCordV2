const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    },
    channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuildChannels',
    }],
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
},{timestamps: true})

guilds.plugin(mongooseDelete, {deletedAt: true});
guilds.plugin(mongoosePaginate);

const Guild = mongoose.model('Guilds', guilds);
module.exports = Guild;