import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt-access') {
  /**
   * Override handleRequest to make authentication optional.
   * If the token is invalid or missing, we don't throw an error
   * but return null, allowing guest access.
   */
  handleRequest(err: any, user: any) {
    // If there's an error or no user, return null (guest access)
    if (err || !user) {
      return null;
    }
    
    // If authentication is successful, return the user
    return user;
  }

  /**
   * Override canActivate to always return true.
   * This ensures that the request continues regardless of auth status.
   */
  canActivate(context: ExecutionContext) {
    // Call parent canActivate but don't wait for it
    // This triggers the authentication attempt but doesn't block on it
    const result = super.canActivate(context);
    
    // Always allow the request to proceed
    if (result instanceof Promise) {
      return result.catch(() => true);
    }
    
    return true;
  }
}
