import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Boostrap');

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
