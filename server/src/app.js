const express = require('express');
const helmet = require('helmet');
const path = require("path");
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser')
const httpStatus = require('http-status');
const config = require('./config/config');
//const morgan = require('./config/morgan');
//const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
//const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./errors/ApiError');
const errorHandler = require('./controllers/v1/error.controller');
const ErrorCodes = require('./errors/errorCodes');

const app = express();

require('dotenv').config();
// if (config.env !== 'test') {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// set security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors({
  credentials: true, 
  origin: true
}));
app.options('*', cors());

// cookies parser from request data
app.use(cookieParser())

// jwt authentication
// app.use(passport.initialize());
// passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

app.use('/uploads', express.static(config.uploadsPath, {
  setHeaders: (res, filePath) => {
      if (filePath.endsWith('.png') || filePath.endsWith('.jfif')) {
          res.setHeader('Content-Type', 'image/png');
      }
  }
}));

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(ErrorCodes.RESOURCE_NOT_FOUND));
});

// convert error to ApiError, if needed
// app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;