import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);
  const logger = new Logger('Main');
  logger.log(
    `🚀🚀🚀 Server is listening on port:${configService.get<number>(
      'PORT',
      port,
    )} 🚀`,
  );
}
bootstrap();
