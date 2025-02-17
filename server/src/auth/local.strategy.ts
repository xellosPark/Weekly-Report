// src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({ usernameField: 'email' }); // 기본적으로 username을 email로 사용
    }

    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(email, password);
        
        if (!user) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
        return user; // req.user에 저장됨
    }
}
