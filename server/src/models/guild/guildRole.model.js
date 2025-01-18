const mongoose = require('mongoose');
const permissionCodes = require('../../constants/permission.contraints')

const guildRoles = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: "#FFFFFF",
        required: true,
    },
    guildId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guilds',
        required: true,
    },
    permissionCodes: [{
        type: String,
        required: true,
        enum: Object.values(permissionCodes)
    }],
    displayType: {
        type: String,
        enum: ["none", "only_icon", "standard", "combined", "seperate"],
        default: "none",
    },
    highlightOnMemberList: {
        type: Boolean,
        default: true,
    },
    // position: {
    //     type: Number,
    //     required: true,
    // },
})

const Role = mongoose.model('GuildRoles', guildRoles);
module.exports = Role;