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
      console.warn(
        '[EmailService] WARNING: SMTP configuration is incomplete. Email functionality may not work.',
      );
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
      from:
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('SMTP_Username'),
    });

    try {
      // Skip verification - it often times out and isn't necessary
      // We'll get proper error messages if the actual send fails
      const mailOptions = {
        from:
          this.configService.get<string>('SMTP_FROM') ||
          this.configService.get<string>('SMTP_Username'),
        to,
        subject,
        html,
      };

      console.log('[EmailService.sendEmail] Sending mail with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        smtpHost:
          this.configService.get<string>('SMTP_Host') || 'smtp.gmail.com',
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

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendPasswordResetOTP(email: string, otp: string): Promise<void> {
    console.log('[EmailService.sendPasswordResetOTP] Starting...', {
      email,
      otp,
    });
    const subject = 'Password Reset OTP';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAFAFA; line-height: 1.6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FAFAFA; padding: 20px 0;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 10px; border: 1px solid #EBEBEB; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #4A9E9E 0%, #5AB5B5 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Password Reset Request</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">You have requested to reset your password. Please use the following OTP code to complete the process:</p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #F5F5F5; border: 2px solid #4A9E9E; border-radius: 10px; padding: 30px 20px; text-align: center; margin: 30px 0;">
                      <h2 style="margin: 0; color: #4A9E9E; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h2>
                    </div>
                    
                    <p style="margin: 20px 0; color: #333333; font-size: 16px;">This OTP will expire in <strong style="color: #595959;">10 minutes</strong>.</p>
                    
                    <div style="background-color: #F5F5F5; border-left: 4px solid #4A9E9E; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.5;">
                        <strong style="color: #595959;">Security Notice:</strong> If you did not request this password reset, please ignore this email. Your account remains secure.
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F5F5F5; padding: 20px 40px; text-align: center; border-top: 1px solid #EBEBEB;">
                    <p style="margin: 0; color: #737373; font-size: 12px; line-height: 1.5;">
                      This is an automated message from Patient Agent. Please do not reply to this email.<br>
                      If you have any questions, please contact our support team.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(email, subject, html);
      console.log(
        '[EmailService.sendPasswordResetOTP] Completed successfully',
        { email },
      );
    } catch (error) {
      console.error('[EmailService.sendPasswordResetOTP] Failed', {
        email,
        error,
      });
      throw error;
    }
  }

  async sendEmailVerificationOTP(email: string, otp: string): Promise<void> {
    console.log('[EmailService.sendEmailVerificationOTP] Starting...', {
      email,
      otp,
    });
    const subject = 'Email Verification OTP';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAFAFA; line-height: 1.6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FAFAFA; padding: 20px 0;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 10px; border: 1px solid #EBEBEB; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #4A9E9E 0%, #5AB5B5 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Verify Your Email Address</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">Thank you for registering with Patient Agent! We're excited to have you on board. Please verify your email address using the following OTP code:</p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #F5F5F5; border: 2px solid #4A9E9E; border-radius: 10px; padding: 30px 20px; text-align: center; margin: 30px 0;">
                      <h2 style="margin: 0; color: #4A9E9E; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h2>
                    </div>
                    
                    <p style="margin: 20px 0; color: #333333; font-size: 16px;">This OTP will expire in <strong style="color: #595959;">10 minutes</strong>.</p>
                    
                    <div style="background-color: #F5F5F5; border-left: 4px solid #4A9E9E; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.5;">
                        <strong style="color: #595959;">Welcome!</strong> Once verified, you'll have full access to all features of Patient Agent. If you did not create an account, please ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F5F5F5; padding: 20px 40px; text-align: center; border-top: 1px solid #EBEBEB;">
                    <p style="margin: 0; color: #737373; font-size: 12px; line-height: 1.5;">
                      This is an automated message from Patient Agent. Please do not reply to this email.<br>
                      If you have any questions, please contact our support team.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(email, subject, html);
      console.log(
        '[EmailService.sendEmailVerificationOTP] Completed successfully',
        { email },
      );
    } catch (error) {
      console.error('[EmailService.sendEmailVerificationOTP] Failed', {
        email,
        error,
      });
      throw error;
    }
  }

  async sendUserCredentials(email: string, password: string) {
    await this.sendEmail(
      email,
      'Your Account Credentials',
      `
      <h3>Your account has been created</h3>
      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>
      <p>Please login and change your password immediately.</p>
    `,
    );
  }
}
