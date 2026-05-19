import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as https from 'https';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync("E:/privkey/weekly-report.ubisam.com/privkey.pem"),
  //   cert: fs.readFileSync("E:/privkey/weekly-report.ubisam.com/fullchain.pem"),
  // };

  // https로만 사용 할때
  // const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  //   httpsOptions,
  // });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // .well-known 인증 경로
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/.well-known',
  });

  // 일반 정적 파일 (index.html 포함)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        //"https://192.168.0.202:4002",
        //"http://192.168.0.202:4002",
        "https://weekly-report.ubisam.com",
        "http://weekly-report.ubisam.com",
        //"http://ubisam.iptime.org:4002"
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // React SPA 라우팅 처리
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  // 환경 변수 로딩
  const envFile = process.env.NODE_ENV === 'docker' ? '.env.docker' : '.env.local';
  dotenv.config({ path: envFile });
  console.log(`Using env file: ${envFile}`);

  // HTTPS 포트 실행
  const PORT = process.env.PORT || 4001;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 HTTPS Server running at https://weekly-report.ubisam.com  ${PORT}`);
}

bootstrap();