import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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
    try {
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
        message:
          'Registration successful. Please verify your email with the OTP sent to your inbox.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('[register] failed', { error });
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = loginDto;

      // Find user by email
      const user = await this.userModel.findOne({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user has a password set
      if (!user.password) {
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
        role: user.role,
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
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('[login] failed', { error });
      throw new InternalServerErrorException('Login failed');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AuthResponseDto> {
    try {
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
    } catch (error) {
      console.error('[forgotPassword] failed', { error });
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponseDto> {
    try {
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('[verifyEmail] failed', { error });
      throw new InternalServerErrorException('Email verification failed');
    }
  }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<AuthResponseDto> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('[sendOtp] failed', { error });
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    try {
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('[verifyOtp] failed', { error });
      throw new InternalServerErrorException('OTP verification failed');
    }
  }

  async changePassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthResponseDto> {
    try {
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('[changePassword] failed', { error });
      throw new InternalServerErrorException('Password change failed');
    }
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    console.log('[sendVerificationEmail] start', { email });
    try {
      const user = await this.userModel.findOne({
        where: { email },
      });
      console.log('[sendVerificationEmail] user lookup result', {
        userId: user?.id,
        email: user?.email,
      });

      if (!user) {
        console.log('[sendVerificationEmail] user not found', { email });
        throw new NotFoundException('User not found');
      }

      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      console.log('[sendVerificationEmail] generated otp', { email, otp });

      const [invalidatedCount] = await this.otpModel.update(
        { isUsed: true },
        {
          where: {
            userId: user.id,
            type: 'email_verification',
            isUsed: false,
          },
        },
      );
      console.log('[sendVerificationEmail] invalidated existing otps', {
        email,
        invalidatedCount,
      });

      const otpRecord = await this.otpModel.create({
        userId: user.id,
        code: otp,
        type: 'email_verification',
      } as any);
      console.log('[sendVerificationEmail] otp record created', {
        email,
        otpId: otpRecord?.id,
      });

      console.log('[sendVerificationEmail] sending email', { email });
      await this.emailService.sendEmailVerificationOTP(email, otp);
      console.log('[sendVerificationEmail] email sent', { email });
    } catch (error) {
      console.error('[sendVerificationEmail] failed', { email, error });
      throw error;
    }
  }
}
