import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationConfig } from './shared/configs/validation.config';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { GlobalLogger } from './shared/services/global-logger.service';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  const configService = app.get(ConfigService);

  app.useGlobalPipes(ValidationConfig);
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Tezyoz API')
    .setDescription('API documentation for Tezyoz application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.getOrThrow('PORT', { infer: true });

  await app.listen(port, () => {
    Logger.log(`ENV: ${configService.get('NODE_ENV')} PORT: ${port}`, 'Bootstrap');
  });
}

void bootstrap();
