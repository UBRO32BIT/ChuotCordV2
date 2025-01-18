const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokens = new Schema({
    token: {
        type: String,
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL'],
        required: true,
    },
    expires: {
        type: Date,
        required: true
    }
},{timestamps: true});

const Token = mongoose.model('Tokens', tokens);
module.exports = Token;