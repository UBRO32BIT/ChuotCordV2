const { StatusCodes } = require('http-status-codes');
const logger = require('../../config/logger');
const authService = require('../../services/v1/auth.service');
const userService = require('../../services/v1/user.service');
const errorHandler = require('./error.controller');
const ErrorCodes = require('../../errors/errorCodes');
const ApiError = require('../../errors/ApiError');
class AuthController {
    async Login(req, res, next) {
        try {
            console.log('Cookies: ', req.cookies)
            const {username, password} = req.body;
            const loginData = await authService.Login(username, password);
            if (loginData) {
                if (!loginData.isBanned) {
                    const tokens = await authService.GenerateAuthToken(loginData);
                    //Set cookies
                    res.cookie('refreshToken', tokens.refresh.token, {httpOnly: true});
                    res.status(StatusCodes.OK).json(
                        {
                            message: 'Login successfully',
                            data: {user: loginData, tokens}
                        }
                    );
                }
                else {
                    res.status(StatusCodes.FORBIDDEN).json(
                        {
                            message: 'You have been banned from the system!',
                            data: null
                        }
                    );
                }
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Wrong username or password!',
                    data: null
                });
            }
        }
        catch (error) {
            errorHandler(error, req, res, next);
        }
    }
    async Register(req, res, next) {
        try {
            const {username, email, password, repeatPassword, phoneNumber } = req.body;
            if (password !== repeatPassword) {
                throw new ApiError(ErrorCodes.PASSWORD_DOES_NOT_MATCH);
            }
            if (await userService.GetUserByUsername(username)) {
                throw new ApiError(ErrorCodes.USER_ALREADY_EXISTS);
            }
            if (await userService.GetUserByEmail(email)) {
                throw new ApiError(ErrorCodes.EMAIL_ALREADY_EXISTS);
            }
            const userData = await authService.Register(username, email, password, phoneNumber);
            const tokens = await authService.GenerateAuthToken(userData);
            res.status(StatusCodes.CREATED).json({
                message: "Register successfully", 
                data: {
                    user: userData, 
                    tokens: tokens,
                } 
            });
        }
        catch (error) {
            errorHandler(error, req, res, next);
        }
    }
    async SendRecoveryEmail(req, res, next) {
        try {
            const {email} = req.body;
            await authService.SendRecoveryEmail(email);
            res.status(StatusCodes.OK).json({ message: "Email sent to your email address" });
        }
        catch (error) {
            errorHandler(error, req, res, next);
        }
    }
    async ResetPassword(req, res, next) {
        try {
            const {token} = req.query;
            const {newPassword} = req.body;
            await authService.ResetPassword(token, newPassword);
            res.status(StatusCodes.OK).json({ message: "Change password successfully" });
        }
        catch (error) {
            errorHandler(error, req, res, next);
        }
    }
    async RefreshToken(req, res, next) {
        try {
            const data = req.user;
            const token = await authService.GenerateAccessToken(data);
            res.status(StatusCodes.OK).json(
                {
                    message: 'OK',
                    data: {token: token}
                }
            );
        }
        catch (error) {
            errorHandler(error, req, res, next);
        }
    }
    async RevokeToken(req, res, next) {
        //TODO: REWOKE TOKEN FOR LOGOUT
    }
    async IsAuthenticated(req, res, next) {
        try {
            res.status(StatusCodes.OK).json({message: "test"});
        }
        catch (error) {
            errorHandler(error, req, res, next);
        }
    }
}

module.exports = new AuthController;