import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
// import { StorageService } from '../storage/storage.service';
// import { S3Transport } from '../storage/storage.transport';

// const storageService = new StorageService();

export const logger = WinstonModule.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorizes the log level
        winston.format.printf(({ level, message, context, timestamp }) => {
          let coloredMessage = message;
          switch (level) {
            case 'error':
              coloredMessage = `\x1b[31m${message}\x1b[0m`; // Red
              break;
            case 'warn':
              coloredMessage = `\x1b[33m${message}\x1b[0m`; // Yellow
              break;
            case 'info':
              coloredMessage = `\x1b[32m${message}\x1b[0m`; // Green
              break;
            default:
              coloredMessage = message;
          }
          return `${timestamp} [${level}]${context ? ` [${context}]` : ''}: ${coloredMessage}`;
        }),
      ),
    }),
    // new S3Transport({ level: 'info', bucketName: 'system' }, storageService),
    // new S3Transport({ level: 'error', bucketName: 'system' }, storageService),
    // new S3Transport({ level: 'warn', bucketName: 'system' }, storageService),
  ],
});
