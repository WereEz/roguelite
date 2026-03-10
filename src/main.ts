import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {initializeTransactionalContext} from 'typeorm-transactional';
import {App} from './app';

async function bootstrap() {
    initializeTransactionalContext();

    const app = await NestFactory.create(App, {cors: true});
    const logger = new Logger('Bootstrap');

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Roguelite API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document);

    const port = parseInt(process.env.APP_PORT || '3000', 10);

    await app.listen(port);

    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().then();
