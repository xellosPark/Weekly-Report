import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Auth } from '../../auth/auth.entity';

//사용자 정의 파라미터 데코레이터

// 콜백 함수의 매개변수
// data: 데코레이터에 전달된 추가 데이터입니다. 사용자가 데코레이터에 특정 값을 전달했다면 이 값이 들어옵니다. (예: @GetUser('id'))
// ctx: ExecutionContext: 현재 실행 컨텍스트를 나타냅니다. 이 컨텍스트를 통해 요청 객체나 핸들러 정보 등에 접근할 수 있습니다.
// ctx를 사용한 요청 객체 접근
// ctx.switchToHttp().getRequest()를 사용하면 HTTP 요청 객체에 접근할 수 있습니다. 이를 통해 사용자 정보를 추출하거나 특정 데이터를 가공할 수 있습니다.

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): Auth => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
});