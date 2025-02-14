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

@ManyToOne,@OneToMany,@OneToOne,@ManyToMany

회원가입 이후 auth 테이블을 따로 관리하고, user 테이블과 관계를 맺어야 한다면, 일반적으로 @OneToOne 또는 @ManyToOne 관계가 가장 많이 사용됩니다.

🔹 회원가입 후 인증 관련 데이터 저장 방식 선택
회원가입 후 인증 정보를 auth 테이블에 따로 저장할 경우, User와 Auth 엔티티 간의 관계를 설정해야 합니다.
이때 보편적으로 다음과 같은 두 가지 방법을 사용합니다.

✅ 1. @OneToOne (가장 많이 사용됨)
User당 하나의 인증 정보 (Auth 테이블에서 User를 FK로 참조)
사용자의 인증 정보(비밀번호 해싱된 값, OAuth 토큰 등)를 따로 저장할 때 유용
예제: User 엔티티는 Auth를 가짐
typescript
복사
편집
// src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

@Entity('users')
export class User {
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true })
email: string;

@OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
@JoinColumn() // FK로 auth_id가 추가됨
auth: Auth;
}
typescript
복사
편집
// src/auth/entities/auth.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('auth')
export class Auth {
@PrimaryGeneratedColumn()
id: number;

@Column()
password: string;

@OneToOne(() => User, (user) => user.auth)
user: User;
}
✅ 사용 이유

보안상 Auth 테이블에 인증 관련 정보(비밀번호, OAuth 토큰 등)를 따로 저장 가능
User의 다른 정보(프로필 등)와 분리하여 관리 가능
User를 삭제하면 자동으로 Auth 정보도 삭제되도록 cascade: true 설정 가능
✅ 2. @ManyToOne (회원 정보와 인증 정보를 별도로 관리할 때)
User는 여러 개의 Auth 정보를 가질 수 있음 (예: OAuth, 비밀번호 기반 로그인 등)
예제: Auth 엔티티에서 User를 FK로 참조
typescript
복사
편집
// src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

@Entity('users')
export class User {
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true })
email: string;

@OneToMany(() => Auth, (auth) => auth.user)
auths: Auth[];
}
typescript
복사
편집
// src/auth/entities/auth.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('auth')
export class Auth {
@PrimaryGeneratedColumn()
id: number;

@Column()
password: string;

@ManyToOne(() => User, (user) => user.auths, { onDelete: 'CASCADE' })
user: User;
}
✅ 사용 이유

User가 여러 개의 인증 정보를 가질 경우 (예: 비밀번호, OAuth, SSO 등)
인증 방식별로 auth 데이터를 별도로 관리 가능
onDelete: 'CASCADE'를 추가하면 User가 삭제될 때 Auth 정보도 자동 삭제
🔥 추천 방식
1️⃣ @OneToOne을 사용한 단순한 구조
✅ 회원마다 하나의 인증 정보만 필요할 경우 (password, refreshToken 등)
✅ 보안상 인증 정보를 따로 관리하고 싶을 경우
✅ 가장 일반적으로 사용되는 방식

2️⃣ @ManyToOne을 사용한 유연한 인증 방식
✅ OAuth, SSO, 비밀번호 기반 로그인 등 여러 인증 방식이 존재할 경우
✅ User당 여러 개의 인증 방법을 허용할 경우 (예: 소셜 로그인 + 비밀번호 로그인 동시 지원)

🚀 결론
단순한 인증 구조(회원 1명당 1개의 비밀번호 인증) → @OneToOne 추천
다양한 로그인 방식 지원(OAuth, 비밀번호) → @ManyToOne 추천
👉 @OneToOne을 사용하면 단순하게 관리할 수 있고, 보안적으로도 가장 일반적인 방식입니다.
추가적인 기능이 필요하면 @ManyToOne으로 확장하는 것이 좋습니다.
