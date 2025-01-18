
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { createServer } = require('https');
const { createSocket } = require('./utils/socket');
const connectToMongoDB = require('./database/mongo.database');
const fs = require('fs');

let server;
var key = fs.readFileSync(__dirname + '/../selfsigned.key');
var cert = fs.readFileSync(__dirname + '/../selfsigned.crt');
var options = { key: key, cert: cert };
const httpServer = createServer(options, app);

//Create socket server
createSocket(httpServer);

//Connect to mongodb
connectToMongoDB();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

server = httpServer.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});