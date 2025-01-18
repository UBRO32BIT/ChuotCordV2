const errorHandler = (error, req, res, next) => {
    console.log(error);
    res.status(error.statusCode || 500).json({
      status: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
    });
}
module.exports = errorHandler;