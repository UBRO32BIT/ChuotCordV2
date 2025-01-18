const userService = require('./user.service');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const UserModel = require("../../models/user/user.model");
const bcrypt = require('bcryptjs');
const moment = require("moment");
const jwt = require("jsonwebtoken");
const config = require('../../config/config');
const ErrorCodes = require('../../errors/errorCodes');

const JWT_RECOVERY_SECRET_KEY = config.jwt.recoverySecret;
const ACCESS_TOKEN_EXPIRATION_MINUTES = config.jwt.accessExpirationMinutes;
const REFRESH_TOKEN_EXPIRATION_DAYS = config.jwt.refreshExpirationDays;

class AuthService {
    async Register(username, email, password, phoneNumber) {
        const isUsernameExist = await userService.GetUserByUsername(username);
        if (isUsernameExist) {
            throw new ApiError(ErrorCodes.USER_ALREADY_EXISTS);
        }
        const data = {
            username: username,
            email: email,
            password: password,
            phone_number: phoneNumber,
        }
        const result = new UserModel({...data});
        return result.save().catch();
    }
    async Login(username, password) {
        const user = await userService.GetUserByUsername(username);
        if (user) {
            const isPasswordValid = await bcrypt.compare(
                `${password}`,
                user.password
            );
            if (isPasswordValid) {
                return user;
            }
        }
        return null;
    }
    async SendRecoveryEmail(email) {
        const user = await userService.GetUserByEmail(email);
        if (!user) {
            throw new ApiError(ErrorCodes.USER_NOT_FOUND);
        }
        const token = await tokenService.GenerateRecoveryToken(user._id);
        return await emailService.SendRecoveryEmail(email, user.username, token);
    }
    async ResetPassword(token, newPassword) {
        const payload = jwt.verify(token, JWT_RECOVERY_SECRET_KEY);
        await userService.ResetPassword(payload.sub, newPassword);
    }
    async GenerateAccessToken(user) {
        return await tokenService.GenerateAccessToken(user._id, user.username);
    }
    async GenerateRefreshToken(user) {
        return await tokenService.GenerateRefreshToken(user._id, user.username);
    }
    async GenerateAuthToken(user) {
        const accessToken = await this.GenerateAccessToken(user);
        const refreshToken = await this.GenerateRefreshToken(user);
        const accessTokenExpires = moment().add(ACCESS_TOKEN_EXPIRATION_MINUTES, 'minutes');
        const refreshTokenExpires = moment().add(REFRESH_TOKEN_EXPIRATION_DAYS, 'days');
        await tokenService.SaveTokenToDB(
            refreshToken,
            'REFRESH',
            refreshTokenExpires,
        );
        
        return {
            accessToken: {
                token: accessToken,
                exp: accessTokenExpires
            },
            refresh: {
                token: refreshToken,
                exp: refreshTokenExpires
            }
        }
    }
}

module.exports = new AuthService;