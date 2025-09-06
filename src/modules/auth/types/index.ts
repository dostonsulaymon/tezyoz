import { type Request } from 'express';


export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export type JWTPayloadForUser = {
  userId: string;
  role: UserRole;
};

export interface AuthRequest extends Request {
  user: JWTPayloadForUser;
}
