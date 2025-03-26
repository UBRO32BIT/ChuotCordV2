
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const http = require("http");
const https = require("https");
const { createSocket } = require('./utils/socket');
const connectToMongoDB = require('./database/mongo.database');
const fs = require('fs');

let server;
var key = fs.readFileSync(config.sslKeyPath);
var cert = fs.readFileSync(config.sslCertPath);
var options = { key: key, cert: cert };
const useHttps = config.useHttps === "true";
const httpServer = useHttps ? https.createServer(options, app) : http.createServer(app);

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
  //exitHandler();
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