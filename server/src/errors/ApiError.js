const ErrorCodes = require("./errorCodes");

class ApiError extends Error {
    constructor(errorCode, isOperational = true, stack = '') {
        if (!errorCode) {
            errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
        }
        super(errorCode.message);
        this.errorCode = errorCode.code;
        this.statusCode = errorCode.status;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;