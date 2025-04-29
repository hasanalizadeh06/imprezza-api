import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 📦 Serve uploaded static files (images, etc.)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out properties not in the DTO
      forbidNonWhitelisted: true, // Throw an error if unknown props are passed
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true }, // Implicit type conversion
    }),
  );

  // 📚 Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Imprezza API 🎁')
    .setDescription('Send and receive gifts — Wolt-style but with love 💌')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 🚀 Start your engine
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
