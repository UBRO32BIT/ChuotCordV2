const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');

const connectToMongoDB = async () => {
    mongoose.connect(config.mongoose.url, config.mongoose.options)
        .then(() => {
            logger.info('Connected to MongoDB');
        })
        .catch((err) => {
            logger.error(`MongoDB connection failed: ${err}`);
        }
    );
}

module.exports = connectToMongoDB;