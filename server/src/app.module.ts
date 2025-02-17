import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // isGlobal 옵션을 true로 설정하여 ConfigModule을 전역적으로 사용 가능하게 함.
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    AuthModule,
    UserModule
  ],
  controllers: [],
  //ConfigService란?
  //ConfigService는 NestJS의 @nestjs/config 모듈에서 제공되는 서비스로, 환경 변수 및 애플리케이션 설정값을 관리합니다.
  //주로 환경 변수(process.env)를 읽고 관리하며, 타입 안전성과 유효성 검사를 제공합니다.
  providers: [ConfigService],
})
export class AppModule { }
