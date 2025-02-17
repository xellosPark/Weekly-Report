import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // JWT 기본 전략 설정 // Passport 모듈 추가
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Secret8877', // 환경변수에서 가져오기
      signOptions: { expiresIn: '30m' }, // 토큰 만료 시간 설정
    }),
    TypeOrmModule.forFeature([Auth, User])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, LocalAuthGuard],
  //JwtStrategy, PassportModule를 다른 모듈에서 사용할수 있게 등록
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
