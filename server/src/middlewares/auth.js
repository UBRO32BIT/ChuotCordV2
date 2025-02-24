const jwt = require("jsonwebtoken");
const { StatusCodes } = require('http-status-codes');
const { GetUserById } = require('../services/v1/user.service');
const config = require('../config/config');

const JWT_ACCESS_SECRET_KEY = config.jwt.accessSecret;
const JWT_REFRESH_SECRET_KEY = config.jwt.refreshSecret;

const checkAccessToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        //Token not found
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid access token' })
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_ACCESS_SECRET_KEY)
        const userData = await GetUserById(payload.sub);
        req.user = {
            userId: payload.sub,
            data: userData,
        }
        next();
    } catch (error) {
        console.log(`[AuthMiddleware]: Invalid access token: ${error.message}`)
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'You are unauthorized to access this resource'
        })
    }
}

const checkRefreshToken = async (req, res, next) => {
    try {
        if (!req.cookies?.refreshToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Refresh token not found'
            });
        }

        const payload = jwt.verify(req.cookies.refreshToken, JWT_REFRESH_SECRET_KEY);
        const user = await GetUserById(payload.sub);
        
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'User not found'
            });
        }

        req.user = {
            _id: payload.sub,
            username: payload.username,
        };
        next();
    } catch (error) {
        console.error('[Auth Middleware]:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Invalid refresh token'
        });
    }
};

module.exports = {
    checkAccessToken,
    checkRefreshToken,
};