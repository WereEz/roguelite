import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DataSourceOptions} from 'typeorm';
import databaseConfig from './config/DatabaseConfig';
import telegramConfig from './config/TelegramConfig';
import {UserModule} from './user/UserModule';
// import {TelegramModule} from './modules/telegram/telegram.module';
// import {GameModule} from './modules/game/game.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [databaseConfig, telegramConfig],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get<DataSourceOptions>('database')!,
        }),
        UserModule,
        // TelegramModule,
        // GameModule,
    ],
})
export class App {}
