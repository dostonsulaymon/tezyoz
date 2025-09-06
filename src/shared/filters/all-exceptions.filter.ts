import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { ErrorResponse } from '../dto/base-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? this.getExceptionMessage(exception) : 'Internal Server Error';
    const errorType = exception instanceof HttpException ? exception.name : 'InternalServerError';
    
    // Extract validation errors if present
    let details: string[] | undefined;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response && Array.isArray(response.message)) {
        details = response.message;
      }
    }

    const responseBody = new ErrorResponse(
      httpStatus,
      Array.isArray(message) ? message[0] : message,
      errorType,
      details
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getExceptionMessage(exception: HttpException): string {
    // eslint-disable-next-line
    return exception['response']['message'] || exception['message'];
  }
}
