const mongoose = require('mongoose');
const { getFullUrl } = require('../../utils/file.util');
const { GetAttactmentContent } = require('../../services/v1/attachment.service');

const attachments = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video', 'text', 'code', 'file'],
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})

// Add a virtual field to get the full URL
attachments.virtual('fullUrl').get(function () {
    return getFullUrl(this.url);
});

attachments.virtual('content');

// Ensure virtuals are included in the response JSON
attachments.set('toJSON', { virtuals: true });
attachments.set('toObject', { virtuals: true });

attachments.post('find', async function (docs) {
    for (const doc of docs) {
        if (doc.type === 'code') {
            doc.content = await GetAttactmentContent(doc.url);
        }
    }
});

module.exports = mongoose.model('Attachments', attachments);