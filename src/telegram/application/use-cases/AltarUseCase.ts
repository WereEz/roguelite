import {Injectable, Inject, BadRequestException, NotFoundException} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {IInteractionResult} from '../../../base/domain/interfaces/game/IInteractionResult';
import {IPathChoice} from '../../../base/domain/interfaces/game/IPathChoice';
import {Stat, isValidStat} from '../../../game/domain/enums/Stat';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {BotMessages} from '../../domain/constants/BotMessages';
import {
    MenuKeyboards,
    buildBloodAltarKeyboard,
    buildPathChoicesKeyboard,
} from '../../domain/constants/Keyboards';
import * as CallbackData from '../../domain/constants/CallbackData';

@Injectable()
export class AltarUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        @Inject(GAME_FACADE)
        private readonly gameFacade: IGameFacade,
        private readonly replyService: ReplyService,
    ) {}

    async executeAltar(ctx: Context, data: string): Promise<void> {
        const stat = await this.parseStatOrReply(ctx, data, CallbackData.parseAltarStat);

        if (!stat) return;

        const userId = await this.getUserId(ctx);

        const result = await this.runFacadeOrReply(ctx, () =>
            this.gameFacade.useAltar(userId, stat),
        );

        if (!result) return;

        await this.finalize(ctx, this.replyService.renderAltarDone(result), result.pathChoices);
    }

    async executeBloodAltar(ctx: Context, data: string): Promise<void> {
        const stat = await this.parseStatOrReply(ctx, data, CallbackData.parseBloodAltarStat);

        if (!stat) return;

        const userId = await this.getUserId(ctx);

        const result = await this.runFacadeOrReply(ctx, () =>
            this.gameFacade.useBloodAltar(userId, stat),
        );

        if (!result) return;

        await this.renderBloodAltarOutcome(ctx, result);
    }

    async executeLeaveBloodAltar(ctx: Context): Promise<void> {
        const userId = await this.getUserId(ctx);

        const result = await this.runFacadeOrReply(ctx, () =>
            this.gameFacade.leaveBloodAltar(userId),
        );

        if (!result) return;

        await this.finalize(
            ctx,
            this.replyService.renderBloodAltarDone(result),
            result.pathChoices,
        );
    }

    private async getUserId(ctx: Context): Promise<number> {
        const from = assertFrom(ctx);
        const user = await this.userFacade.findOrCreate(from.id, from.username);

        return user.id;
    }

    private async parseStatOrReply(
        ctx: Context,
        data: string,
        parser: (data: string) => string,
    ): Promise<Stat | null> {
        const stat = parser(data);

        if (!isValidStat(stat)) {
            await ctx.reply(BotMessages.UNKNOWN_ACTION);

            return null;
        }

        return stat;
    }

    private async runFacadeOrReply<T>(ctx: Context, fn: () => Promise<T>): Promise<T | null> {
        try {
            return await fn();
        } catch (err) {
            if (err instanceof NotFoundException) {
                await ctx.reply(BotMessages.NO_ACTIVE_GAME_REPLY);

                return null;
            }

            if (err instanceof BadRequestException) {
                await ctx.reply(BotMessages.ALTAR_NO_LONGER_AVAILABLE);

                return null;
            }

            throw err;
        }
    }

    private async renderBloodAltarOutcome(ctx: Context, result: IInteractionResult): Promise<void> {
        if (result.gameOver) {
            await ctx.reply(this.replyService.renderBloodAltarDeath(result), {
                reply_markup: MenuKeyboards.DEFAULT,
            });

            return;
        }

        if (!result.roomComplete && result.bloodAltarState) {
            await ctx.reply(
                this.replyService.renderBloodAltarPrompt({
                    hp: result.character.hp,
                    maxHp: result.character.maxHp,
                    usesRemaining: result.bloodAltarState.usesRemaining,
                    nextCost: result.bloodAltarState.nextCost,
                }),
                {reply_markup: buildBloodAltarKeyboard()},
            );

            return;
        }

        await this.finalize(
            ctx,
            this.replyService.renderBloodAltarDone(result),
            result.pathChoices,
        );
    }

    private async finalize(
        ctx: Context,
        doneMessage: string,
        pathChoices: IPathChoice[],
    ): Promise<void> {
        await ctx.reply(doneMessage);

        if (pathChoices.length === 0) return;

        await ctx.reply(this.replyService.renderPathChoices(), {
            reply_markup: buildPathChoicesKeyboard(pathChoices),
        });
    }
}
