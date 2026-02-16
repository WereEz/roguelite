import {registerAs} from '@nestjs/config';

export default registerAs('database', () => {
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
        type: 'postgres' as const,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT!, 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
    };
});
