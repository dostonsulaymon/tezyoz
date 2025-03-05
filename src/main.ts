import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationConfig } from './shared/configs/validation.config';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const configService = app.get(ConfigService);

  app.useGlobalPipes(ValidationConfig);

  const port = configService.getOrThrow('PORT', { infer: true });

  await app.listen(port, () => {
    Logger.log(`ENV: ${configService.get('NODE_ENV')} PORT: ${port}`, 'Bootstrap');
  });
}

void bootstrap();
