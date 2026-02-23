import {Inject, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {Telegraf} from 'telegraf';
import {telegramConfiguration, TelegramConfigType} from '../../config/TelegramConfig';

@Injectable()
export class TelegramService implements OnModuleInit {
    private readonly logger = new Logger(TelegramService.name);
    private bot: Telegraf;

    constructor(
        @Inject(telegramConfiguration.KEY)
        private readonly config: TelegramConfigType,
    ) {}

    onModuleInit(): void {
        this.bot = new Telegraf(this.config.token);

        this.bot.start((ctx) => ctx.reply('Bot is working 🚀'));

        this.bot.launch();

        this.logger.log('Telegram bot started (polling)');
    }
}
