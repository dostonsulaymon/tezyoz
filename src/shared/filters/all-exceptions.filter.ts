import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { DateTime } from 'luxon';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? this.getExceptionMessage(exception) : 'Internal Server Error';
    const name = exception instanceof HttpException ? exception.name : 'Error';
    const requestId = ctx.getRequest<Request>().headers['x-request-id'];

    const responseBody = {
      error: {
        status: httpStatus,
        name,
        message,
      },
      timestamp: DateTime.now().toISO(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      requestId,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getExceptionMessage(exception: HttpException): string {
    // eslint-disable-next-line
    return exception['response']['message'] || exception['message'];
  }
}
