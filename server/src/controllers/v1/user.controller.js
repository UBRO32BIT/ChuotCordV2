const userService  = require('../../services/v1/user.service');
const { StatusCodes } = require('http-status-codes');
const errorHandler = require('./error.controller');
const logger = require('../../config/logger');
class UserController {
    async GetUsers(req, res, next) {
        try {
            const results = await userService.GetUsers();
            res.status(StatusCodes.OK).json({
                message: 'Query User',    
                data: results
            })
        }
        catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async ChangePassword(req, res, next) {
        try {
            const {oldPassword, newPassword} = req.body;
            const {userId} = req.user;
            await userService.ChangePassword(userId, oldPassword, newPassword);
            res.status(StatusCodes.OK).json({
                message: "Change password successfully",
            })
        }
        catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    async SendVerifyEmail(req, res, next) {
        try {
            const {userId} = req.user;
            const result = await userService.SendVerifyEmail(userId);
            res.status(StatusCodes.OK).json(result);
        }
        catch (error) {
            logger.error(error);
            errorHandler(error, req, res, next);
        }
    }
    async GetGroupsByUserId(req, res, next) {
        try {
            const {userId} = req.user;
            console.log(`[UserController]: Start getting groups by user id ${userId}`);
            const results = await userService.GetGuildsByUserId(userId);
            res.status(StatusCodes.OK).json({
                message: 'Query user',
                data: results,
            })
        }
        catch (error) {
            logger.error(error);
            errorHandler(error, req, res, next);
        }
    }
    async GetUserById(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const result = await userService.GetUserById(id);
                if (result) {
                    res.status(StatusCodes.OK).json({
                        message: "User found",
                        data: result
                    });
                }
                else res.status(StatusCodes.NOT_FOUND).json({message: "User not found"});
            }
            else res.status(StatusCodes.BAD_REQUEST).json({message: "User ID is required"});
        }
        catch (error) {
            logger.error(error);
            errorHandler(error, req, res, next);
        }
    }
    async UpdateUser(req, res, next) {
        try {
            const { userId } = req.user;
            const { 
                phoneNumber, 
                profileDescription, 
                onlinePresence 
            } = req.body;
    
            // Check if a profile picture was uploaded
            const profilePicture = req.file ? `/uploads/users/${req.file.filename}` : undefined;
    
            // Construct the data object
            const data = {
                phoneNumber,
                profileDescription,
                onlinePresence,
                ...(profilePicture && { profilePicture }), // Only include if a new profile picture is uploaded
            };
    
            // Update user in the service layer
            const result = await userService.UpdateUser(userId, data);
    
            res.status(StatusCodes.OK).json({
                message: "Update successfully",
                data: result,
            });
        } catch (error) {
            logger.error(error);
            errorHandler(error, req, res, next);
        }
    }
    async BanUser(req, res, next) {
        try {
            res.status(StatusCodes.NO_CONTENT).json({message: "test"});
        }
        catch (error) {
            logger.error(error);
            errorHandler(error, req, res, next);
        }
    }
}

module.exports = new UserController;