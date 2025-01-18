const mongoose = require('mongoose');

const isValidHours = (hours) => {
    return hours >= 0 && hours <= 23;
}
const isValidMinutes = (minutes) => {
    return hours >= 0 && hours <= 60;
}
const isValidDays = (days) => {
    return days >= 0;
}
const guildInviteExpirations = mongoose.Schema({
    duration: {
        days: {
            tupe: Number,
            required: true,
            validator: isValidDays,
        },
        hours: {
            type: Number,
            required: true,
            validator: isValidHours,
        },
        minutes: {
            type: Number,
            required: true,
            validator: isValidMinutes,
        },
    },
    displayName: {
        type: String,
        required: true,
    }
}, {timestamps: true})

const GuildInviteExpirations = mongoose.model('GuildInviteExpirations', guildInviteExpirations);
module.exports = GuildInviteExpirations;