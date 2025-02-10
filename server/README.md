npm i pg typeorm @nestjs/typeorm
npm install uuid

nest g module auth
nest g controller auth -—no-spec
nest g service auth --no-spec

npm install bcryptjs
npm install --save-dev @types/bcryptjs

//passport-jwt는 JWT를 검증하고 해독
npm install @nestjs/jwt @nestjs/config
npm install @nestjs/passport @nestjs/jwt passport-jwt
npm install @nestjs/passport@10.0.3 passport-jwt@4.0.1 @nestjs/jwt@10.0.2

클라이언트가 로그인 요청 → 서버가 JWT 토큰 발급
클라이언트가 API 요청 시 Authorization 헤더에 JWT 토큰 포함
JwtStrategy가 호출되어 토큰 검증 후 사용자 정보를 반환
검증이 성공하면 요청이 정상적으로 처리됨.

"@typescript-eslint/no-use-before-define": ["error"],
"@typescript-eslint/no-shadow": ["error"],
"@typescript-eslint/camelcase": "off",
"@typescript-eslint/unbound-method": "off",
"@typescript-eslint/no-non-null-assertion": "off",
"@typescript-eslint/no-unsafe-member-access": "off",
"@typescript-eslint/no-unsafe-assignment": "off",
"@typescript-eslint/no-unsafe-return": "off", // 규칙 비활성화
"@typescript-eslint/no-unused-vars": [
"warn",
{ "argsIgnorePattern": "^_" }
],

401 vs. 403 차이
401 Unauthorized: 사용자가 인증되지 않았거나 유효하지 않은 토큰을 제공한 경우 발생.
403 Forbidden: 사용자는 인증되었지만 해당 리소스에 접근할 권한이 없는 경우 발생.
