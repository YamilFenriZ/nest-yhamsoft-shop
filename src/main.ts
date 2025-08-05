import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Configuración CORS basada en ambiente
  // const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];
  
  // app.enableCors({
  //   origin: process.env.NODE_ENV === 'development' 
  //     ? true 
  //     : allowedOrigins,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  //   credentials: true,
  //   maxAge: 3600,
  // });
  
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,      
    })
  );

  const config = new DocumentBuilder()
  .setTitle('YhamStore Professional RESTFul API')
  .setDescription('YhamSoft Shop endpoinst')
  .setVersion('1.0')
  //.addTag('cats')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  logger.log(`App running in port: ${ process.env.PORT }`);
}
bootstrap();
