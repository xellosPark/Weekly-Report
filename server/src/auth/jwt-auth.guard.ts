// src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // canActivate(context: ExecutionContext) {
  //   return super.canActivate(context);
  // }
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedException('No access token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      // ✅ Access Token 검증
      this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'Secret8877' });
      return super.canActivate(context);
    } catch (error) {
      //accesstoken 만료됨
      throw new UnauthorizedException('Access token expired');
    }
  }
}
