import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
    databaseConfiguration,
    DatabaseConfigType,
    buildDataSourceOptions,
} from './config/DatabaseConfig';
import {telegramConfiguration} from './config/TelegramConfig';
import {UserModule} from './user/UserModule';
import {TelegramModule} from './telegram/TelegramModule';
import {GameModule} from './game/GameModule';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [databaseConfiguration, telegramConfiguration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            inject: [databaseConfiguration.KEY],
            useFactory: (config: DatabaseConfigType) => buildDataSourceOptions(config),
        }),
        UserModule,
        TelegramModule,
        GameModule,
    ],
})
export class App {}
