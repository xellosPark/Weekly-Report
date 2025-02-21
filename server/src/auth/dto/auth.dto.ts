import { IsNotEmpty, Length, Matches } from 'class-validator';

export class AuthDto {
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

    /**
     * 사용자 비밀번호
     * - 필수 입력 항목
     * - 최소 8자에서 최대 20자
     * - 영문과 숫자를 포함해야 함
     * //비밀번호는 영문과 숫자를 포함하고, 최소 8자 이상 20자 이하로 설정됩니다.
     */
    @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
    @Length(6, 20, { message: '비밀번호는 최소 8자에서 최대 20자까지 입력 가능합니다.' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
    })
    password: string;

}
