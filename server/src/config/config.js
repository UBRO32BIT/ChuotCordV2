const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(8080),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    REDIS_HOST: Joi.string().description('Redis host url'),
    REDIS_PORT: Joi.number().description('Redis port number'),
    JWT_ACCESS_SECRET: Joi.string().required().description('JWT access secret key'),
    JWT_REFRESH_SECRET: Joi.string().required().description('JWT refresh secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    SERVER_HOST: Joi.string().description('server host url'),
    SSL_CERT_PATH: Joi.string().description('SSL certificate path'),
    SSL_KEY_PATH: Joi.string().description('SSL key path'),
    UPLOADS_DIR: Joi.string().description('uploads directory path'),
    CORS_ORIGIN_DEVELOPMENT: Joi.string().description('CORS origin for development environment'),
    CORS_ORIGIN_PRODUCTION: Joi.string().description('CORS origin for production environment'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      
    },
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD || '',
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    recoverySecret: envVars.JWT_RECOVERY_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  rtc: {
    minPort: envVars.RTC_MIN_PORT,
    maxPort: envVars.RTC_MAX_PORT,
    announcedIp: envVars.RTC_ANNOUNCED_IP,
  },
  serverHost: envVars.SERVER_HOST,
  clientHost: envVars.CLIENT_HOST,
  sslCertPath: envVars.SSL_CERT_PATH,
  sslKeyPath: envVars.SSL_KEY_PATH,
  uploadsPath: envVars.UPLOADS_DIR,
  corsOriginDevelopment: envVars.CORS_ORIGIN_DEVELOPMENT,
  corsOriginProduction: envVars.CORS_ORIGIN_PRODUCTION,
  useHttps: envVars.USE_HTTPS,
};