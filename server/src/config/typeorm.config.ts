import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',            // 데이터베이스 유형
    host: '14.58.108.70',        // 데이터베이스 호스트
    port: 15432,               // 데이터베이스 포트
    username: 'postgres',         // 데이터베이스 사용자명
    password: 'ub8877',   // 데이터베이스 비밀번호
    database: 'postgres',  // 데이터베이스 이름
    entities: [__dirname + '/../**/*.entity.{js,ts}'],  // 엔티티 경로
    synchronize: true,        // 애플리케이션 시작 시 스키마 동기화 여부
    //logging: true,            // 데이터베이스 작업을 로깅할지 여부
    //////////////////////////////////////////////////////////////////////
};  