export type BaseResponse<T, K = string> = {
  success: boolean;
  data: T;
  message: string;
  timestamp: Date;
  metadata?: K;
};
