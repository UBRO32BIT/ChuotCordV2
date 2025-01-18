const mongoose = require('mongoose');

const guildPermission = new mongoose.Schema({
    permissionCode: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('GuildPermissions', guildPermission);