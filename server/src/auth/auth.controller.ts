import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')

export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)  // 성공 시 201 코드 반환
    async signup(@Body(ValidationPipe) authDto: AuthDto) {
        try {
            // 회원가입 서비스 호출
            await this.authService.signup(authDto);

            // 성공 응답 반환
            return { message: 'Signup successful', status: HttpStatus.CREATED };
        } catch (error) {
            // 서버 오류 처리
            throw new HttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Signup failed due to server error',
                error: (error as Error).message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/signin')
    @HttpCode(HttpStatus.CREATED)  // 성공 시 201 코드 반환  // 성공 시 200 코드 반환
    async signin(@Body(ValidationPipe) authDto: AuthDto) {
        return this.authService.signin(authDto);
    }

    @Get('/refresh')
    //사용자 정의 파라미터 데코레이터 사용 @GetUser()
    @UseGuards(AuthGuard())
    refresh(@GetUser() auth: AuthDto) {
        return this.authService.refreshToken(auth);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() auth: AuthDto) {
        console.log('user', auth.email);
    }

}
