import { HttpException, HttpStatus } from '@nestjs/common';

export class GlobalException extends HttpException {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, error: any, statusCode?: number) {
    super({ message, statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR }, error);
  }
}
