import {registerAs} from '@nestjs/config';
import {DataSourceOptions} from 'typeorm';

export function buildDatabaseConfig(): DataSourceOptions {
    const required = [
        'DATABASE_HOST',
        'DATABASE_PORT',
        'DATABASE_USER',
        'DATABASE_PASSWORD',
        'DATABASE_NAME',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT!, 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/../**/*Entity{.ts,.js}'],
        migrations: [__dirname + '/../**/infrastructure/migrations/*{.ts,.js}'],
        synchronize: false,
    };
}

export default registerAs('database', buildDatabaseConfig);
