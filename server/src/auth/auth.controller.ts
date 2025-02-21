import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Request, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-auth.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * 
     * http://localhost:9801/auth/register
     * {
        "email": "test3@example.com",
        "username": "test3",
        "password": "1q2w3e4r",
        "rank": 1,
        "team": 1,
        "site": 1,
        "admin": 2,
        "state": 1,
        "authMethod": "local"
        }
     */
    @Post('register')
    async register(@Body(ValidationPipe) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    /**
     * 
     * http://localhost:9801/auth/signin
     * {
        "email": "tes1@example.com",
        "password": "1q2w3e4r"
        }
     */
    //1️⃣ LocalAuthGuard 실행 → LocalStrategy.validate(email, password) 자동 호출
    //2️⃣ validate()에서 AuthService.validateUser(email, password) 실행 → 유저 검증
    //3️⃣ 로그인 성공 시 req.user에 검증된 유저 정보 자동 저장
    //4️⃣ 컨트롤러에서 req.user를 this.authService.login(req.user)에 전달하여 JWT 발급
    //보통 NestJS에서는 passport-local을 활용한 LocalAuthGuard 방식이 더 권장되는 패턴
    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async login(@Request() req: any, @Res() res: Response) { // ✅ Express Response 타입 사용
        const { accessToken, refreshToken, userData } = await this.authService.generateTokens(req.user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // ✅ XSS 공격 방어 (클라이언트에서 접근 불가)
            //secure: process.env.NODE_ENV === 'production' ? true : false, // ✅ true : HTTPS에서만 쿠키 전송
            secure: false,
            sameSite: 'strict', // ✅ CSRF 공격 방어
            path: '/', // ✅ 쿠키 경로 설정
            maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7일간 유지
        });

        return res.json({ accessToken, refreshToken, userData });
    }

    /*
        http://localhost:9801/auth/refresh
    */

    // ✅ Refresh Token을 통한 Access Token 재발급
    @Post('refresh')
    @UseGuards(AuthGuard())
    async refresh(@Request() req: any, @Res() res: Response) {
        const oldRefreshToken = req.cookies.refreshToken; // ✅ 쿠키에서 Refresh Token 가져오기
        const { accessToken, refreshToken } = await this.authService.generateTokens(oldRefreshToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // ✅ XSS 공격 방어 (클라이언트에서 접근 불가)
            //secure: process.env.NODE_ENV === 'production' ? true : false, // ✅ true : HTTPS에서만 쿠키 전송
            secure: false,
            sameSite: 'strict', // ✅ CSRF 공격 방어
            path: '/', // ✅ 쿠키 경로 설정
            maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7일간 유지
        });

        console.log('token 재발급');

        return res.json({ accessToken });
    }

    /*
     * 
     * curl -X POST http://localhost:3000/auth/logout
        -H "Authorization: Bearer ACCESS_TOKEN"
     */
    // ✅ 로그아웃 API
    @Post('logout')
    @UseGuards(JwtAuthGuard) // ✅ 로그인된 사용자만 로그아웃 가능
    async logout(@Request() req: any, @Res() res: Response) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.authService.logout(req.user.id);  // DB에서 Refresh Token 삭제

        // ✅ 클라이언트 쿠키 삭제
        res.clearCookie('refreshToken', {
            httpOnly: true,
            //secure: process.env.NODE_ENV === 'production' ? true : false,
            secure: false,
            sameSite: 'strict',
            expires: new Date(0), // 즉시 만료
        });

        return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    }

}
