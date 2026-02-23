import {registerAs} from '@nestjs/config';

export default registerAs('telegram', () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('Missing required environment variable: TELEGRAM_BOT_TOKEN');
    }

    return {
        token: process.env.TELEGRAM_BOT_TOKEN,
    };
});
