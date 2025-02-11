import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 추가
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js 클라이언트 주소
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // 쿠키 인증이 필요할 경우 추가
  });

  // 정적 파일 서빙 설정 (필요 시)
  app.use('/static', express.static(join(__dirname, '../client/public')));

  await app.listen(process.env.PORT ?? 9801);
  console.log(`http://localhost:${process.env.PORT ?? 9801}`);
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
});