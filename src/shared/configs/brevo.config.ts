import { ConfigService } from '@nestjs/config';

export const getBrevoConfig = (configService: ConfigService) => ({
  apiKey: configService.get<string>('SMTP_KEY'),
  defaultFrom: configService.get<string>('SMTP_FROM'),
});
