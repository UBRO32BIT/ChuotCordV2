const multer = require("multer");
const path = require("path");
const config = require("./config");

// Define allowed image extensions
const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

// File filter function
function imageFileFilter(req, file, cb) {
    const extname = path.extname(file.originalname).toLowerCase();
    if (allowedImageExtensions.includes(extname)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only image files are allowed!"), false); // Reject the file
    }
}

// Configure multer for file storage
const attachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadsPath); // Make sure the 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const uploadAttachment = multer({ storage: attachmentStorage });

// Configure multer for user profile uploads
const userProfileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadsPath + "/users"); // Make sure the 'uploads/users' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const uploadUserProfile = multer({
    storage: userProfileStorage,
    fileFilter: imageFileFilter,
});

module.exports = {
    uploadAttachment,
    uploadUserProfile,
};