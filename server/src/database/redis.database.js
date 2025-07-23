const redis = require('redis');
const config = require('../config/config');

const redisClient = redis.createClient({
    url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`
});

module.exports = redisClient;