import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const { method, url } = request;
    const ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.connection.remoteAddress;
    
    const startTime = Date.now();
    
    // Log incoming request
    this.logger.log(`🚀 ${method} ${url} - ${ip}`);

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Log successful response
        this.logger.log(`✅ ${method} ${url} - ${response.statusCode} (${duration}ms)`);
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Log error response
        this.logger.error(`❌ ${method} ${url} - ${error.status || 500} (${duration}ms) - ${error.message}`);
        
        return throwError(() => error);
      })
    );
  }

}
