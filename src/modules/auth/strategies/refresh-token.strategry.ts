import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JWTPayloadForUser } from '../types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    const refreshTokenSecret = configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
    if (!refreshTokenSecret) throw new InternalServerErrorException('Missing JWT_REFRESH_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
      secretOrKey: refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  validate(payload: JWTPayloadForUser) {
    return { ...payload };
  }
}
