import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// export const typeORMConfig: TypeOrmModuleOptions = {
//     type: 'postgres',            // 데이터베이스 유형
//     host: '14.58.108.70',        // 데이터베이스 호스트
//     port: 15432,               // 데이터베이스 포트
//     username: 'postgres',         // 데이터베이스 사용자명
//     password: 'ub8877',   // 데이터베이스 비밀번호
//     database: 'postgres',  // 데이터베이스 이름
//     entities: [__dirname + '/../**/*.entity.{js,ts}'],  // 엔티티 경로
//     synchronize: true,        // 애플리케이션 시작 시 스키마 동기화 여부
//     //logging: true,            // 데이터베이스 작업을 로깅할지 여부
//     //////////////////////////////////////////////////////////////////////
// };  

export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',            // 데이터베이스 유형
    host: 'localhost',                     // 데이터베이스 호스트
    port: 5432,                            // 데이터베이스 포트
    username: 'postgres',         // 데이터베이스 사용자명  ubisam
    password: 'ubisam8877',   // 데이터베이스 비밀번호  ub8877
    database: 'Weekly_Report',  // 데이터베이스 이름  postgres
    entities: [__dirname + '/../**/*.entity.{js,ts}'],  // 엔티티 경로
    synchronize: true,        // 애플리케이션 시작 시 스키마 동기화 여부
    //autoLoadEntities: true
    //logging: true,            // 데이터베이스 작업을 로깅할지 여부
    //////////////////////////////////////////////////////////////////////
};  