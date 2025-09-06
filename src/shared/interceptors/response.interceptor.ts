import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { SuccessResponse } from '../dto/base-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const statusCode = response.statusCode;

        // If data is already in the correct format, return as is
        if (data && typeof data === 'object' && 'success' in data && 'statusCode' in data) {
          return data;
        }

        // Determine the default message based on status code
        let message = 'Operation completed successfully';
        switch (statusCode) {
          case 201:
            message = 'Resource created successfully';
            break;
          case 200:
            message = 'Operation completed successfully';
            break;
          case 204:
            message = 'Operation completed successfully';
            break;
        }

        // For endpoints that return custom messages
        if (data && typeof data === 'object' && data.message) {
          message = data.message;
          delete data.message; // Remove message from data to avoid duplication
        }

        return new SuccessResponse(statusCode, message, data);
      }),
    );
  }
}
