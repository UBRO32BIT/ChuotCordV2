const { Mongoose } = require("mongoose");

const GuildAuditLog = Mongoose.Schema({
    guildId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Guilds',
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    target: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    }
}, {timestamps: true})