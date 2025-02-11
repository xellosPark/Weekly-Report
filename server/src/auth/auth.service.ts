import { ConflictException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository, DataSource } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {

    private activeEmail: string | null = null; // 단일 이메일 저장 (refreshToken 때문에 필요)

    constructor(
        @InjectRepository(Auth)
        private userRepository: Repository<Auth>,
        private dataSource: DataSource, // 직접 쿼리 실행을 위한 DataSource
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    private async getMissingId(): Promise<number> {
        // // ID를 오름차순으로 정렬하고 누락된 ID를 찾음
        // const result = await this.dataSource.query<{ nextId: number }[]>(
        //     `SELECT id + 1 AS nextId
        //    FROM auth a
        //    WHERE NOT EXISTS (
        //        SELECT 1 FROM auth b WHERE b.id = a.id + 1
        //    )
        //    ORDER BY id ASC
        //    LIMIT 1;`
        // );

        // return result.length > 0 ? result[0].nextId : 1; // 누락된 ID가 없으면 ID를 1로 시작

        // 현재 테이블에 있는 ID를 기준으로 누락된 ID를 찾음
        const ids = await this.dataSource.query<{ id: number }[]>(`SELECT id FROM auth ORDER BY id ASC;`);

        // ID 목록을 배열로 변환
        const idSet = new Set(ids.map(row => row.id));

        // ID 목록을 배열로 변환
        const idArray = ids.map(row => row.id).sort((a, b) => a - b);

        for (let i = 1; i <= Math.max(...Array.from(idSet)) + 1; i++) {
            if (!idSet.has(i)) {
                return i; // 누락된 ID 반환
            }
        }

        return ids.length + 1; // 누락된 ID가 없으면 다음 ID 반환
    }



    async signup(authDto: AuthDto) {
        const { email, password } = authDto;

        // 암호 처리
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        //const user = this.userRepository.create({ email, password: hashedPassword, });

        // 누락된 ID 확인 및 새 ID 생성
        const missingId = await this.getMissingId();
        console.log('Generated missing ID:', missingId); // 누락된 ID 가져오기

        // 새로운 사용자 엔티티 생성
        const user = this.userRepository.create({
            id: missingId,
            email,
            password: hashedPassword,
        });

        try {
            await this.userRepository.save(user);
        } catch (error) {
            console.log(error);
            // 이미 email 있는지 확인 23505 확인 한다.
            const dbError = error as { code?: string };
            if (dbError.code === '23505') {
                throw new ConflictException('이미 존재하는 이메일입니다.');
            }

            throw new InternalServerErrorException('회원가입 도중 에러가 발생했습니다.');
        }
    }

    async signin(authDto: AuthDto) {
        const { email, password } = authDto;

        // 입력받은 사용자 이름과 비밀번호를 콘솔에 출력
        console.log('signIn email:', email);
        console.log('signIn password:', password);

        const user = await this.userRepository.findOneBy({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            const { accessToken, refreshToken } = await this.getTokens(email)
            console.log("Access Token:", accessToken);
            console.log("Refresh Token:", refreshToken);

            // 이메일 저장
            this.activeEmail = email;
            console.log('Active email:', this.activeEmail);


            // 로그인 성공 시 응답 반환 (토큰 포함)
            return {
                message: 'Signin successful',
                status: HttpStatus.CREATED,
                accessToken,
                refreshToken,
            };

        } else {
            throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
        }
    }

    async getTokens(email: string) {
        const Payload = { email };
        const [accessToken, refreshToken] = await Promise.all([
            // jwt service 사용할수 있도록 private jwtService: JwtService
            this.jwtService.signAsync(Payload, {
                // secret: 'Secret8877',
                // expiresIn: '30m', // 30분 동안 유효
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
            }),
            this.jwtService.signAsync(Payload, {
                // secret: 'Secret8877',
                // expiresIn: '30d', // 30일
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
            })
        ])

        return { accessToken, refreshToken };
    }

    async refreshToken(auth: AuthDto) {
        // user 정보는 client에서 가져와야한다.
        console.log('user');
        const { email } = auth;

        // 저장된 이메일과 요청 이메일 비교
        if (this.activeEmail !== email) {
            console.error(`이메일 불일치: 저장된 이메일(${this.activeEmail}), 요청된 이메일(${email})`);
            throw new ForbiddenException('이메일이 일치하지 않아 인증에 실패했습니다.');
        }

        const { accessToken, refreshToken } = await this.getTokens(email);

        console.log("User email:", email);

        // if (!auth.hashedRefreshToken) {
        //     throw new ForbiddenException('Invalid refresh token');
        // }

        return { accessToken, refreshToken };
    }

}
