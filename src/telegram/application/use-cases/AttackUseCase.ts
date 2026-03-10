import {Injectable, Inject, NotFoundException} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {PlayerAction, isValidPlayerAction} from '../../../game/domain/enums/PlayerAction';
import {CombatResult} from '../../../game/domain/enums/CombatResult';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {BotMessages} from '../../domain/constants/BotMessages';
import {Keyboards} from '../../domain/constants/Keyboards';
import * as CallbackData from '../../domain/constants/CallbackData';

@Injectable()
export class AttackUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        @Inject(GAME_FACADE)
        private readonly gameFacade: IGameFacade,
        private readonly replyService: ReplyService,
    ) {}

    async execute(ctx: Context, data: string): Promise<void> {
        const action = CallbackData.parseAction(data);

        if (!isValidPlayerAction(action)) {
            await ctx.answerCbQuery(BotMessages.UNKNOWN_ACTION);

            return;
        }

        const from = assertFrom(ctx);
        const user = await this.userFacade.findOrCreate(from.id, from.username);

        await ctx.answerCbQuery();

        let result;

        try {
            result = await this.gameFacade.processCombatTurn(user.id, action as PlayerAction);
        } catch (err) {
            if (err instanceof NotFoundException) {
                await ctx.reply(BotMessages.NO_ACTIVE_GAME_REPLY);

                return;
            }

            throw err;
        }

        if (result.result === CombatResult.ONGOING) {
            await ctx.reply(this.replyService.renderCombatTurn(result), {
                reply_markup: Keyboards.ATTACK,
            });
        } else if (result.result === CombatResult.WIN && !result.gameOver) {
            await ctx.reply(this.replyService.renderCombatWin(result), {
                reply_markup: Keyboards.NEXT_ROOM,
            });
        } else if (result.result === CombatResult.WIN && result.gameOver) {
            await ctx.reply(this.replyService.renderGameWon(result), {
                reply_markup: Keyboards.NEW_GAME,
            });
        } else {
            await ctx.reply(this.replyService.renderCombatLose(result), {
                reply_markup: Keyboards.NEW_GAME,
            });
        }
    }
}
