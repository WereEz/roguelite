import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Inject} from '@nestjs/common';
import {Context, Telegraf} from 'telegraf';
import {telegramConfiguration, TelegramConfigType} from '../../config/TelegramConfig';
import {StartUseCase} from './use-cases/StartUseCase';
import {NewGameUseCase} from './use-cases/NewGameUseCase';
import {StatsUseCase} from './use-cases/StatsUseCase';
import {AttackUseCase} from './use-cases/AttackUseCase';
import {ChoosePathUseCase} from './use-cases/ChoosePathUseCase';
import {AltarUseCase} from './use-cases/AltarUseCase';
import {BotCommand, botCommandDescription} from '../domain/constants/BotCommand';
import {BotMessages} from '../domain/constants/BotMessages';
import * as CallbackData from '../domain/constants/CallbackData';
import {MenuButton} from '../domain/constants/MenuButton';
import {ICallbackRoute} from '../domain/interfaces/ICallbackRoute';

const exactMatch =
    (value: string) =>
    (data: string): boolean =>
        data === value;

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TelegramService.name);
    private bot: Telegraf;
    private callbackRoutes: ICallbackRoute[] = [];

    constructor(
        @Inject(telegramConfiguration.KEY)
        private readonly config: TelegramConfigType,
        private readonly startUseCase: StartUseCase,
        private readonly newGameUseCase: NewGameUseCase,
        private readonly statsUseCase: StatsUseCase,
        private readonly attackUseCase: AttackUseCase,
        private readonly choosePathUseCase: ChoosePathUseCase,
        private readonly altarUseCase: AltarUseCase,
    ) {}

    private buildICallbackRoutes(): ICallbackRoute[] {
        return [
            {
                match: CallbackData.isAttack,
                handle: (ctx, data) => this.attackUseCase.execute(ctx, data),
            },
            {
                match: CallbackData.isChoosePath,
                handle: (ctx, data) => this.choosePathUseCase.execute(ctx, data),
            },
            {
                match: CallbackData.isAltar,
                handle: (ctx, data) => this.altarUseCase.executeAltar(ctx, data),
            },
            {
                match: CallbackData.isBloodAltar,
                handle: (ctx, data) => this.altarUseCase.executeBloodAltar(ctx, data),
            },
            {
                match: exactMatch(CallbackData.LEAVE_BLOOD_ALTAR),
                handle: (ctx) => this.altarUseCase.executeLeaveBloodAltar(ctx),
            },
            {
                match: exactMatch(CallbackData.NEW_GAME),
                handle: (ctx) => this.newGameUseCase.execute(ctx),
            },
        ];
    }

    onModuleInit(): void {
        this.bot = new Telegraf(this.config.token);
        this.callbackRoutes = this.buildICallbackRoutes();

        this.bot.telegram
            .setMyCommands([
                {command: BotCommand.START, description: botCommandDescription(BotCommand.START)},
                {
                    command: BotCommand.NEW_GAME,
                    description: botCommandDescription(BotCommand.NEW_GAME),
                },
                {command: BotCommand.STATS, description: botCommandDescription(BotCommand.STATS)},
            ])
            .catch((err) => this.logger.error('Failed to set bot commands', err));

        this.bot.start(this.wrap((ctx) => this.startUseCase.execute(ctx)));
        this.bot.command(
            BotCommand.NEW_GAME,
            this.wrap((ctx) => this.newGameUseCase.execute(ctx)),
        );
        this.bot.command(
            BotCommand.STATS,
            this.wrap((ctx) => this.statsUseCase.execute(ctx)),
        );

        this.bot.hears(
            MenuButton.NEW_GAME,
            this.wrap((ctx) => this.newGameUseCase.execute(ctx)),
        );
        this.bot.hears(
            MenuButton.STATS,
            this.wrap((ctx) => this.statsUseCase.execute(ctx)),
        );

        this.bot.on('callback_query', async (ctx) => {
            if (!('data' in ctx.callbackQuery)) return;

            const data = ctx.callbackQuery.data;

            await ctx.answerCbQuery().catch(() => void 0);

            const route = this.callbackRoutes.find((r) => r.match(data));

            if (!route) return;

            try {
                await route.handle(ctx, data);
            } catch (err) {
                this.logger.error(`Callback error [${data}]`, err);
                await ctx.reply(BotMessages.INTERNAL_ERROR).catch(() => void 0);
            }
        });

        this.bot.catch((err, ctx) => {
            this.logger.error(`Unhandled bot error for update ${ctx.update.update_id}`, err);
        });

        this.bot.launch().catch((err) => this.logger.error('Bot launch failed', err));

        this.logger.log('Telegram bot started');
    }

    private wrap<C extends Context>(handler: (ctx: C) => Promise<void>) {
        return async (ctx: C) => {
            try {
                await handler(ctx);
            } catch (err) {
                this.logger.error('Handler error', err);
                await ctx.reply(BotMessages.INTERNAL_ERROR).catch(() => void 0);
            }
        };
    }

    onModuleDestroy(): void {
        this.bot.stop();
    }
}
