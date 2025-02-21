import { ConflictException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository, DataSource } from 'typeorm';
import { RegisterDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
        private readonly jwtService: JwtService, // ✅ JwtService 주입
    ) { }

    async register(registerDto: RegisterDto): Promise<User> {
        const { email, password, username, rank, team, site, admin, state, authMethod } = registerDto;

        // Step 1: User 객체 생성
        const user = new User();
        user.email = email;
        user.username = username;
        user.rank = rank;
        user.team = team;
        user.site = site;
        user.admin = admin;
        user.state = state;


        // Step 2: Auth 객체 생성 & 비밀번호 저장
        const auth = new Auth();
        auth.user = user;
        auth.password = password;
        auth.authMethod = authMethod;
        await auth.hashPassword();

        user.auth = auth; // User와 Auth 연결

        // Step 3: User 저장 → cascade 옵션 덕분에 Auth도 저장됨
        return await this.userRepository.save(user);
    }

    //유저 체크
    async validateUser(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['auth'],
        });

        if (!user || !user.auth) return null;

        const isMatch = await user.auth.comparePassword(password);
        return isMatch ? user : null;
    }

    async generateTokens(user: any) {
        const payload = { email: user.email, sub: user.id };

        // jwt service 사용할수 있도록 private jwtService: JwtService
        const accessToken = this.jwtService.sign(payload, {
            secret: 'Secret8877',
            expiresIn: '30m', // 30분 동안 유효
            //secret: this.configService.get('JWT_SECRET'),
            //expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: 'Secret8877',
            expiresIn: '30d', // 30일
            //secret: this.configService.get('JWT_SECRET'),
            //expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
        })

        const userData = await this.userRepository.findOne({ where: { email: user.email } });
        await this.saveRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken, userData };
    }

    generateAccessToken(user: any) {
        const payload = { email: user.email, sub: user.id };

        // jwt service 사용할수 있도록 private jwtService: JwtService
        const accessToken = this.jwtService.sign(payload, {
            secret: 'Secret8877',
            expiresIn: '30m', // 30분 동안 유효
            //secret: this.configService.get('JWT_SECRET'),
            //expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        });

        return { accessToken };
    }

    // ✅ Refresh Token 저장
    async saveRefreshToken(userId: number, refreshToken: string) {
        const auth = await this.authRepository.findOne({ where: { user: { id: userId } } });

        if (auth) {
            auth.refreshToken = JSON.stringify(refreshToken); // ✅ 문자열로 변환 후 저장
            await this.authRepository.save(auth);
        }
    }

    // ✅ Refresh Token 검증 및 Access Token 재발급
    async refreshAccessToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.REFRESH_SECRET || 'Secret8877',
            });

            const user = await this.userRepository.findOne({ where: { id: decoded.sub }, relations: ['auth'] });

            // const user | null = await this.userRepository.findOne({
            //     where: { id: decoded.sub },
            //     relations: ['auth'],
            //   });

            if (!user || typeof user.auth.refreshToken !== "string") {
                throw new UnauthorizedException("Invalid refresh token format");
            }

            let dbRefreshToken = user.auth.refreshToken;

            try {
                dbRefreshToken = JSON.parse(user.auth.refreshToken);
            } catch (error) {
                // JSON.parse() 실패 시, 원래 값 유지
                dbRefreshToken = user.auth.refreshToken;
            }

            //if (!user || user.auth.refreshToken?.trim() !== refreshToken.trim()) {
            if (String(dbRefreshToken).trim() !== String(refreshToken).trim()) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.generateAccessToken(user);
        } catch (error) {
            throw new UnauthorizedException('Refresh token expired or invalid');
        }
    }

    // ✅ Refresh Token 삭제 (로그아웃 시 사용)
    async logout(userId: number): Promise<void> {
        const auth = await this.authRepository.findOne({ where: { user: { id: userId } } });

        if (!auth) {
            throw new UnauthorizedException('User not found');
        }

        auth.refreshToken = null; // Refresh Token 삭제
        await this.authRepository.save(auth);
    }
}
