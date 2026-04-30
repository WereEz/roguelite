import {Injectable, Inject} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {MenuKeyboards} from '../../domain/constants/Keyboards';

@Injectable()
export class StartUseCase {
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
        const active = await this.gameFacade.getActiveSessionWithCharacter(user.id);

        await ctx.reply(this.replyService.renderStart(from.username), {
            reply_markup: active ? MenuKeyboards.IN_GAME : MenuKeyboards.DEFAULT,
        });
    }
}
