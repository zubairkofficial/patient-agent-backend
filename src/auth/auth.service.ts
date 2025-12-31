import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { RefreshToken } from '../models/refresh-token.model';
import * as bcrypt from 'bcrypt';
import * as otpGenerator from 'otp-generator';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmailService } from '../services/email.service';

@Injectable()
export class AuthService {
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Otp)
    private otpModel: typeof Otp,
    @InjectModel(RefreshToken)
    private refreshTokenModel: typeof RefreshToken,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    // Return user data with token
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        },
        token,
      },
    };
  }

  async logout(refreshToken: string | undefined): Promise<AuthResponseDto> {
    try {
      // If refresh token exists, delete it from database
      if (refreshToken) {
        await this.refreshTokenModel.destroy({
          where: { token: refreshToken },
        });
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Log error but still return success to prevent information leakage
      console.error('Logout error:', error);
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<AuthResponseDto> {
    const { email } = forgotPasswordDto;

    // Check if user exists
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If the email exists, a password reset OTP has been sent.',
      };
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Invalidate any existing OTPs for this email and type
    await this.otpModel.update(
      { isUsed: true },
      {
        where: {
          email,
          type: 'password_reset',
          isUsed: false,
        },
      },
    );

    // Save OTP to database
    await this.otpModel.create({
      email,
      code: otp,
      type: 'password_reset',
      expiresAt,
    } as any);

    // Send OTP via email
    await this.emailService.sendPasswordResetOTP(email, otp);

    return {
      success: true,
      message: 'Password reset OTP has been sent to your email.',
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponseDto> {
    const { email, otp } = verifyEmailDto;

    // Find valid OTP
    const otpRecord = await this.otpModel.findOne({
      where: {
        email,
        code: otp,
        type: 'email_verification',
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Mark email as verified
    await user.update({ emailVerified: true });

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    return {
      success: true,
      message: 'Email has been verified successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        },
      },
    };
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Invalidate any existing OTPs for this email and type
    await this.otpModel.update(
      { isUsed: true },
      {
        where: {
          email,
          type: 'email_verification',
          isUsed: false,
        },
      },
    );

    // Save OTP to database
    await this.otpModel.create({
      email,
      code: otp,
      type: 'email_verification',
      expiresAt,
    } as any);

    // Send OTP via email
    await this.emailService.sendEmailVerificationOTP(email, otp);
  }
}
