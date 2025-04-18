import { ConflictException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository, DataSource } from 'typeorm';
import { RegisterDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { UserRank } from 'src/@common/enums/global.enum';

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
        
        // 문자열 → enum 값
        let rankEnumValue: UserRank;

        if (typeof rank === 'string') {
        // 문자열이 enum 키("CEO")인 경우
            rankEnumValue = UserRank[rank as keyof typeof UserRank];
        } else if (typeof rank === 'number') {
        // 숫자가 enum 값(1~5)인 경우
            rankEnumValue = rank;
        } else {
            throw new Error('Invalid rank input');
        }

        // Step 1: User 객체 생성
        const user = new User();
        user.email = email;
        user.username = username;
        user.rank = rankEnumValue;
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
            expiresIn: '20m', // 30분 동안 유효
            //secret: this.configService.get('JWT_SECRET'),
            //expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: 'Secret8877',
            expiresIn: '20m', // 30일
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
            expiresIn: '20m', // 30분 동안 유효
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

    async changePassword(userId: number, currentPassword: string, newPassword: string,
    ): Promise<{ success: boolean; message: string }> {
        //console.log('[ChangePassword] 요청 시작:', { userId, currentPassword, newPassword });

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['auth'],
        });

        if (!user) {
            console.warn('[ChangePassword] 사용자 없음:', userId);
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        if (!user.auth) {
            console.warn('[ChangePassword] 사용자에 연결된 auth 없음:', userId);
            return { success: false, message: '인증 정보가 존재하지 않습니다.' };
        }

        console.log('[ChangePassword] 사용자 및 auth 조회 성공:', user.email);

        const isMatch = await user.auth.comparePassword(currentPassword);
        if (!isMatch) {
            console.warn('[ChangePassword] 현재 비밀번호 불일치');
            return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
        }

        const isSame = await user.auth.comparePassword(newPassword);
        if (isSame) {
            console.warn('[ChangePassword] 새 비밀번호가 기존과 동일함');
            return { success: false, message: '새 비밀번호가 기존 비밀번호와 동일합니다.' };
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.auth.password = hashed;

        await this.authRepository.save(user.auth);
        //console.log('[ChangePassword] 비밀번호 변경 성공:', user.email);

        return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
    }
}
