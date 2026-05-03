import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {addTransactionalDataSource} from 'typeorm-transactional';
import {
    databaseConfiguration,
    DatabaseConfigType,
    buildDataSourceOptions,
} from './config/DatabaseConfig';
import {telegramConfiguration} from './config/TelegramConfig';
import {UserModule} from './user/UserModule';
import {TelegramModule} from './telegram/TelegramModule';
import {GameModule} from './game/GameModule';
import {HealthModule} from './health/HealthModule';
import {AdminModule} from './admin/AdminModule';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [databaseConfiguration, telegramConfiguration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            inject: [databaseConfiguration.KEY],
            useFactory: (config: DatabaseConfigType) => buildDataSourceOptions(config),
            dataSourceFactory: async (options) => {
                if (!options) {
                    throw new Error('DataSource options not provided');
                }

                return addTransactionalDataSource(new DataSource(options));
            },
        }),
        UserModule,
        TelegramModule,
        GameModule,
        HealthModule,
        AdminModule,
    ],
})
export class App {}
