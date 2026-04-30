import {Injectable, Inject} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {BotMessages} from '../../domain/constants/BotMessages';

@Injectable()
export class StatsUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        @Inject(GAME_FACADE)
        private readonly gameFacade: IGameFacade,
        private readonly replyService: ReplyService,
    ) {}

    async execute(ctx: Context): Promise<void> {
        const from = assertFrom(ctx);
        const user = await this.userFacade.findOrCreate(from.id, from.username);
        const result = await this.gameFacade.getActiveSessionWithCharacter(user.id);

        if (!result) {
            await ctx.reply(BotMessages.NO_ACTIVE_GAME_REPLY);

            return;
        }

        await ctx.reply(this.replyService.renderStats(result.currentLayer, result.character));
    }
}
