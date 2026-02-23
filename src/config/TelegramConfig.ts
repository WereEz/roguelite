import {ConfigType, registerAs} from '@nestjs/config';
import {get} from 'env-var';

export const telegramConfiguration = registerAs('telegram', () => ({
    token: get('TELEGRAM_BOT_TOKEN').required().asString(),
}));

export type TelegramConfigType = ConfigType<typeof telegramConfiguration>;
