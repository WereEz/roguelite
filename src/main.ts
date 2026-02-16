import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {cors: true});
    const logger = new Logger('Bootstrap');

    app.setGlobalPrefix('api');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Roguelite API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document);

    const port = 3000;

    await app.listen(port);

    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().then();
