import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { logger } from './services/utils/logger';

const blue = '\x1b[34m';
const underline = '\x1b[4m';
const reset = '\x1b[0m';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = 3000;
  await app.listen(port, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
  });

  Logger.log(`${blue}🚀 NODE_ENV: ${process.env.NODE_ENV}`, 'Bootstrap');
  // Logger.log(
  //   `${blue}🚀 Application is running on: ${underline}http://localhost:${port}${reset}`,
  //   'Bootstrap',
  // );
  // Logger.log(
  //   `${blue}🚀 S3 endpoint: ${underline}${process.env.S3_ENDPOINT}${reset}`,
  //   'Bootstrap',
  // );
}

bootstrap();
