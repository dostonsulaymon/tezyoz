import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SMTP_KEY');
    this.defaultFrom = this.configService.get<string>('SMTP_FROM')!;

    if (!apiKey || !this.defaultFrom) {
      throw new Error('SMTP_KEY or SMTP_FROM is missing in environment variables');
    }

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );
  }

  // Send OTP email
  async sendOtp(to: string, otp: string) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = 'Your OTP Code';
    sendSmtpEmail.htmlContent = `
      <h2>Your OTP Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code will expire in 2 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    sendSmtpEmail.sender = { email: this.defaultFrom };
    sendSmtpEmail.to = [{ email: to }];

    return await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
