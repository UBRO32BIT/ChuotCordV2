const path = require('path');
const config = require('../config/config');

function getFullUrl(relativePath) {
    const baseUrl = config.serverHost;
    return `${baseUrl}${relativePath}`;
}

function getFileType(fileName) {
    const extname = path.extname(fileName).toLowerCase();

    // Define file type categories based on extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.flv'];
    const textExtensions = ['.txt', '.md', '.log'];
    const codeExtensions = ['.js', '.ts', '.json', '.html', '.css', '.tsx', '.java', '.cs' , '.py'];
    
    if (imageExtensions.includes(extname)) {
        return 'image';
    } else if (videoExtensions.includes(extname)) {
        return 'video';
    } else if (textExtensions.includes(extname)) {
        return 'text';
    } else if (codeExtensions.includes(extname)) {
        return 'code';
    } else {
        return 'file'; // Default type for unclassified files
    }
}

module.exports = { getFileType, getFullUrl };