import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JWTPayloadForUser } from '../types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private configService: ConfigService) {
    const accessTokenSecret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!accessTokenSecret) throw new InternalServerErrorException('Missing JWT_ACCESS_TOKEN_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: accessTokenSecret,
    });
  }

  validate(payload: JWTPayloadForUser) {
    return { userId: payload.userId, role: payload.role, organizationId: payload.organizationId };
  }
}
