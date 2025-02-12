import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: '*', // 허용할 클라이언트 URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러 반환
      transform: true, // 요청 데이터를 DTO의 타입에 맞게 변환
    }),
  );

  // 클라이언트 정적 파일 제공
  // app.use('/', express.static(join(__dirname, '..', 'public')));

  // ✅ 포트 설정 및 서버 실행
  const PORT = process.env.PORT || 9801;
  await app.listen(PORT);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌐 Next.js Static Site available at http://localhost:${PORT}`);
}

// ✅ 예외 처리 추가
bootstrap().catch((error) => {
  console.error('❌ Error during application bootstrap:', error);
});
