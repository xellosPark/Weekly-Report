import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

export class UserDto {
    /**
     * 사용자 이메일
     * - 필수 입력 항목
     * - 이메일 형식이어야 함
     * - dto.email = 'user@example.com'; // 유효
     * - dto.email = 'user@.com'; // 유효하지 않음
     * - dto.email = '@example.com'; // 유효하지 않음
     */
    @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
    @Matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        { message: '유효한 이메일 형식이 아닙니다.' }
    )
    email: string;

    @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.'})
    username: string;

    @IsInt()
    @Transform(({ value }) => value ?? 0) // 값이 없으면 0으로 설정
    rank: number;

    @IsInt()
    @Transform(({ value }) => value ?? 0) // 값이 없으면 0으로 설정
    team: number;

    @IsInt()
    @Transform(({ value }) => value ?? 0) // 값이 없으면 0으로 설정
    site: number;

    @IsInt()
    @Transform(({ value }) => value ?? 0) // 값이 없으면 0으로 설정
    admin: number;

    @IsInt()
    @Transform(({ value }) => value ?? 0) // 값이 없으면 0으로 설정
    state: number;

}