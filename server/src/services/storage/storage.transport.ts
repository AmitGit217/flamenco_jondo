import * as Transport from 'winston-transport';
import { StorageService } from './storage.service'; // Ensure this is the correct path to your service
import { bucketName } from './static';

export class S3Transport extends Transport {
  private storageService: StorageService;
  private bucketName: bucketName;

  constructor(opts: any, storageService: StorageService) {
    super(opts);
    this.storageService = storageService;
    this.bucketName = opts.bucketName || 'system'; // Use the 'system' bucket by default
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const logMessage = `${info.timestamp || new Date().toISOString()} ${info.level}: ${info.message}\n`;

    // Upload the log message to the S3 bucket
    this.storageService
      .uploadFile(`logs/${info.level}.log`, logMessage)
      .then(() => callback())
      .catch((err) => console.error('Failed to upload log to S3', err));
  }
}
