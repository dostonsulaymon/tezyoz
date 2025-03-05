export type BaseErrorResponse = {
  error: {
    status: number;
    name: string;
    message: string | string[];
  };
  timestamp: Date;
  path: string;
  requestId?: string;
};
