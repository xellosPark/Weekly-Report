import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 9100, `0.0.0.0`);
  console.log(`http://localhost:${9100}`);
}
bootstrap();
