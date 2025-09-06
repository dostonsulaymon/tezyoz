import { Injectable, Logger, LogLevel } from '@nestjs/common';

@Injectable()
export class GlobalLoggerService extends Logger {
  private static instance: GlobalLoggerService;
  
  constructor() {
    super('GlobalLogger');
  }

  static getInstance(): GlobalLoggerService {
    if (!GlobalLoggerService.instance) {
      GlobalLoggerService.instance = new GlobalLoggerService();
    }
    return GlobalLoggerService.instance;
  }

  // Custom log methods with context
  logInfo(message: string, context?: string): void {
    this.log(message, context || 'App');
  }

  logError(message: string, trace?: string, context?: string): void {
    this.error(message, trace, context || 'App');
  }

  logWarn(message: string, context?: string): void {
    this.warn(message, context || 'App');
  }

  logDebug(message: string, context?: string): void {
    this.debug(message, context || 'App');
  }

  logVerbose(message: string, context?: string): void {
    this.verbose(message, context || 'App');
  }

  // Formatted logging methods
  logRequest(method: string, url: string, statusCode?: number, duration?: number): void {
    const status = statusCode ? ` - ${statusCode}` : '';
    const time = duration ? ` (${duration}ms)` : '';
    this.log(`${method} ${url}${status}${time}`, 'Request');
  }

  logDatabase(operation: string, table: string, duration?: number): void {
    const time = duration ? ` (${duration}ms)` : '';
    this.log(`${operation} ${table}${time}`, 'Database');
  }

  logAuth(action: string, user?: string): void {
    const userInfo = user ? ` - ${user}` : '';
    this.log(`${action}${userInfo}`, 'Auth');
  }

  logService(service: string, action: string, details?: string): void {
    const info = details ? ` - ${details}` : '';
    this.log(`${service}: ${action}${info}`, 'Service');
  }

  // JSON logging for structured data
  logObject(obj: any, context?: string, level: LogLevel = 'log'): void {
    const message = JSON.stringify(obj, null, 2);
    switch (level) {
      case 'error':
        this.error(message, undefined, context || 'Object');
        break;
      case 'warn':
        this.warn(message, context || 'Object');
        break;
      case 'debug':
        this.debug(message, context || 'Object');
        break;
      case 'verbose':
        this.verbose(message, context || 'Object');
        break;
      default:
        this.log(message, context || 'Object');
    }
  }
}

// Global logger instance - can be imported anywhere
export const GlobalLogger = GlobalLoggerService.getInstance();
