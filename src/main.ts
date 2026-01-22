import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { getConnectionToken } from '@nestjs/sequelize';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sync database tables
  const sequelize = app.get(getConnectionToken());
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });

  app.enableCors({
    origin: ['http://localhost:4173', 'http://localhost:5173', 'http://13.53.135.222'],
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
