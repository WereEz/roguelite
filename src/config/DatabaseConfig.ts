import {ConfigType, registerAs} from '@nestjs/config';
import {get} from 'env-var';
import {DataSourceOptions} from 'typeorm';

export const databaseConfiguration = registerAs('database', () => ({
    host: get('DATABASE_HOST').required().asString(),
    port: get('DATABASE_PORT').required().asPortNumber(),
    username: get('DATABASE_USER').required().asString(),
    password: get('DATABASE_PASSWORD').required().asString(),
    database: get('DATABASE_NAME').required().asString(),
}));

export type DatabaseConfigType = ConfigType<typeof databaseConfiguration>;

export function buildDataSourceOptions(config: DatabaseConfigType): DataSourceOptions {
    return {
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        entities: [__dirname + '/../**/*Entity{.ts,.js}'],
        migrations: [__dirname + '/../**/infrastructure/migrations/*{.ts,.js}'],
        synchronize: false,
    };
}
