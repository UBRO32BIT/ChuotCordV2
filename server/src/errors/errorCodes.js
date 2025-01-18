const { StatusCodes } = require('http-status-codes');

const ErrorCodes = {
  INTERNAL_SERVER_ERROR: {
    code: 100,
    message: "Internal server error",
    status: StatusCodes.INTERNAL_SERVER_ERROR,
  },
  RESOURCE_NOT_FOUND: {
    code: 101,
    message: "Resource not found",
    status: StatusCodes.NOT_FOUND,
  },
  INVALID_INPUT: {
    code: 102,
    message: "Invalid input provided",
    status: StatusCodes.BAD_REQUEST,
  },
  INVALID_TOKEN: {
    code: 103,
    message: "Invalid token",
    status: StatusCodes.UNAUTHORIZED,
  },
  UNAUTHORIZED_ACCESS: {
    code: 104,
    message: "Unauthorized access",
    status: StatusCodes.UNAUTHORIZED,
  },
  USER_NOT_FOUND: {
    code: 1001,
    message: "User not found",
    status: StatusCodes.NOT_FOUND,
  },
  OLD_PASSWORD_INCORRECT: {
    code: 1003,
    message: "Old password is incorrect",
    status: StatusCodes.BAD_REQUEST,
  },
  PASSWORD_DOES_NOT_MATCH: {
    code: 1004,
    message: "Password and repeat password do not match",
    status: StatusCodes.BAD_REQUEST,
  },
  USER_ALREADY_EXISTS: {
    code: 1005,
    message: "Username already exists",
    status: StatusCodes.CONFLICT,
  },
  EMAIL_ALREADY_EXISTS: {
    code: 1006,
    message: "Email already exists",
    status: StatusCodes.CONFLICT,
  },
  EMAIL_ALREADY_VERIFIED: {
    code: 1007,
    message: "Email is already verified",
    status: StatusCodes.BAD_REQUEST,
  },
  SEND_OTP_COOLDOWN: {
    code: 1008,
    message: "You must wait 30 seconds before requesting a new OTP",
    status: StatusCodes.TOO_MANY_REQUESTS,
  },
  OTP_EXPIRED: {
    code: 1009,
    message: "OTP has expired or is invalid",
    status: StatusCodes.BAD_REQUEST,
  },
  WRONG_OTP: {
    code: 1010,
    message: "Wrong OTP, please try again",
    status: StatusCodes.BAD_REQUEST,
  },
  GUILD_NOT_FOUND: {
    code: 2001,
    message: "Guild not found",
    status: StatusCodes.NOT_FOUND,
  },
  MEMBER_ALREADY_BANNED: {
    code: 2002,
    message: "The current user is already banned from this guild",
    status: StatusCodes.BAD_REQUEST,
  },
  GUILD_INVITE_NOT_FOUND: {
    code: 2101,
    message: "Guild invite not found",
    status: StatusCodes.NOT_FOUND,
  },
  USER_IS_ALREADY_MEMBER: {
    code: 2102,
    message: "The current user is already a guild member",
    status: StatusCodes.BAD_REQUEST,
  }
};

module.exports = ErrorCodes;
