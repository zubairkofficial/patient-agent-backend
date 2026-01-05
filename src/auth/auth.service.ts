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
import * as bcrypt from 'bcrypt';
import * as otpGenerator from 'otp-generator';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SignupDto } from './dto/signup.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmailService } from '../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Otp)
    private otpModel: typeof Otp,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = signupDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: false,
    } as any);

    // Generate and send verification OTP
    await this.sendVerificationEmail(email);

    return {
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent to your inbox.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

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
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return only access token
    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
      },
    };
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

    // Invalidate any existing OTPs for this user and type
    await this.otpModel.update(
      { isUsed: true },
      {
        where: {
          userId: user.id,
          type: 'password_reset',
          isUsed: false,
        },
      },
    );

    // Save OTP to database
    await this.otpModel.create({
      userId: user.id,
      code: otp,
      type: 'password_reset',
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

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find valid OTP
    const otpRecord = await this.otpModel.findOne({
      where: {
        userId: user.id,
        code: otp,
        type: 'email_verification',
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
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
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<AuthResponseDto> {
    const { email } = sendOtpDto;

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Invalidate any existing OTPs for this user
    await this.otpModel.update(
      { isUsed: true },
      {
        where: {
          userId: user.id,
          isUsed: false,
        },
      },
    );

    // Save OTP to database (generic type)
    await this.otpModel.create({
      userId: user.id,
      code: otp,
      type: 'generic',
    } as any);

    // Send OTP via email
    await this.emailService.sendEmailVerificationOTP(email, otp);

    return {
      success: true,
      message: 'OTP has been sent to your email.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { email, otp } = verifyOtpDto;

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find valid OTP
    const otpRecord = await this.otpModel.findOne({
      where: {
        userId: user.id,
        code: otp,
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    return {
      success: true,
      message: 'OTP verified successfully.',
    };
  }

  async changePassword(resetPasswordDto: ResetPasswordDto): Promise<AuthResponseDto> {
    const { email, newPassword, otp } = resetPasswordDto;

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find valid OTP
    const otpRecord = await this.otpModel.findOne({
      where: {
        userId: user.id,
        code: otp,
        type: 'password_reset',
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    return {
      success: true,
      message: 'Password has been changed successfully.',
    };
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Invalidate any existing OTPs for this user and type
    await this.otpModel.update(
      { isUsed: true },
      {
        where: {
          userId: user.id,
          type: 'email_verification',
          isUsed: false,
        },
      },
    );

    // Save OTP to database
    await this.otpModel.create({
      userId: user.id,
      code: otp,
      type: 'email_verification',
    } as any);

    // Send OTP via email
    await this.emailService.sendEmailVerificationOTP(email, otp);
  }
}
