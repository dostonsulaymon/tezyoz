import { type Request } from 'express';
import { type AuthUserStatus } from '../enums';

export type AuthCachePayload = {
  code: string;
  password: string;
  status: AuthUserStatus;
};

export enum UserRole {
  SuperAdmin = 'SUPER_ADMIN',
  Admin = 'ADMIN',
  User = 'USER',
}

export type JWTPayloadForUser = {
  userId: string;
  role: UserRole;
  organizationId?: string;
};

export interface AuthRequest extends Request {
  user: JWTPayloadForUser;
}
