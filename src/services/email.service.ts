import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_Host');
    const smtpUser = this.configService.get<string>('SMTP_Username');
    const smtpPassword = this.configService.get<string>('SMTP_Password');
    const smtpPort = this.configService.get<number>('SMTP_Port') || 465;

    console.log('[EmailService] Initializing SMTP configuration...');
    console.log('[EmailService] SMTP Config:', {
      host: smtpHost || 'smtp.gmail.com (default)',
      port: smtpPort,
      user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT SET',
      passwordSet: smtpPassword ? 'YES' : 'NO',
    });

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.warn('[EmailService] WARNING: SMTP configuration is incomplete. Email functionality may not work.');
      console.warn('[EmailService] Missing:', {
        host: !smtpHost,
        user: !smtpUser,
        password: !smtpPassword,
      });
    }

    // Port 465 requires SSL/TLS, so secure should be true
    // Port 587 uses STARTTLS, so secure should be false
    const isSecure = smtpPort === 465;
    console.log('[EmailService] Creating transporter with:', {
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword ? '***' : undefined,
      },
    });

    this.transporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort,
      secure: isSecure, // true for 465 (SSL/TLS), false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Increase connection timeout and debug options
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 30000, // 30 seconds
      // For port 587, require TLS
      requireTLS: smtpPort === 587,
      tls: {
        rejectUnauthorized: false, // Set to true in production with valid certificates
      },
      // Add debug option to see SMTP communication
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    console.log('[EmailService] Transporter created successfully');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    console.log('[EmailService.sendEmail] Starting email send...', {
      to,
      subject,
      from: this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_Username'),
    });

    try {
      // Skip verification - it often times out and isn't necessary
      // We'll get proper error messages if the actual send fails
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_Username'),
        to,
        subject,
        html,
      };

      console.log('[EmailService.sendEmail] Sending mail with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        smtpHost: this.configService.get<string>('SMTP_Host') || 'smtp.gmail.com',
        smtpPort: this.configService.get<number>('SMTP_Port') || 465,
      });

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[EmailService.sendEmail] Email sent successfully!', {
        messageId: info.messageId,
        response: info.response,
      });
    } catch (error) {
      console.error('[EmailService.sendEmail] Error sending email:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        command: (error as any)?.command,
        response: (error as any)?.response,
        responseCode: (error as any)?.responseCode,
        host: this.configService.get<string>('SMTP_Host') || 'smtp.gmail.com',
        port: this.configService.get<number>('SMTP_Port') || 465,
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendPasswordResetOTP(email: string, otp: string): Promise<void> {
    console.log('[EmailService.sendPasswordResetOTP] Starting...', { email, otp });
    const subject = 'Password Reset OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following OTP code:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    try {
      await this.sendEmail(email, subject, html);
      console.log('[EmailService.sendPasswordResetOTP] Completed successfully', { email });
    } catch (error) {
      console.error('[EmailService.sendPasswordResetOTP] Failed', { email, error });
      throw error;
    }
  }

  async sendEmailVerificationOTP(email: string, otp: string): Promise<void> {
    console.log('[EmailService.sendEmailVerificationOTP] Starting...', { email, otp });
    const subject = 'Email Verification OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Thank you for registering! Please verify your email address using the following OTP code:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    try {
      await this.sendEmail(email, subject, html);
      console.log('[EmailService.sendEmailVerificationOTP] Completed successfully', { email });
    } catch (error) {
      console.error('[EmailService.sendEmailVerificationOTP] Failed', { email, error });
      throw error;
    }
  }
}

