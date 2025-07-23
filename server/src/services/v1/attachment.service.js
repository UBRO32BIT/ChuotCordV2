const attachmentModel = require("../../models/message/attachment.model");
const { getFileType } = require('../../utils/file.util');
const fs = require('fs');
const path = require("path");

class AttachmentService {
    async GetAttactmentContent(filePath) {
        try {
            const fileType = getFileType(filePath);
            if (fileType === 'code') {
                const content = fs.readFileSync(path.join(__dirname, '../../../' + filePath), 'utf-8');
                return content;
            }
        }
        catch (error) {
            console.error("Error reading attachment content:", error);
        }
        finally {
            return null;
        }
    }
}

module.exports = new AttachmentService();