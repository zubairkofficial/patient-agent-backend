import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from '../services/email.service';
import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AdminService } from './auth-admin.service';
@Module({
  imports: [
    SequelizeModule.forFeature([User, Otp]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
    }),
    AuthModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminService,
    EmailService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, AdminService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
