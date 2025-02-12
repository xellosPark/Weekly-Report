npm i pg typeorm @nestjs/typeorm
npm install uuid
npm install cors

nest g module auth
nest g controller auth --no-spec
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

cp -r ./client-app/build ./server/public
