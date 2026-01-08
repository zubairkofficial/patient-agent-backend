import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from '../services/email.service';
import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Otp]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: {
        // @ts-expect-error - '24h' is a valid string format for expiresIn in jsonwebtoken
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
