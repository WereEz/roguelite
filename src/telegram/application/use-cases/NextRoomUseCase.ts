import {Injectable, Inject} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {BotMessages} from '../../domain/constants/BotMessages';
import {Keyboards} from '../../domain/constants/Keyboards';

@Injectable()
export class NextRoomUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        @Inject(GAME_FACADE)
        private readonly gameFacade: IGameFacade,
        private readonly replyService: ReplyService,
    ) {}

    async execute(ctx: Context): Promise<void> {
        await ctx.answerCbQuery();

        const from = assertFrom(ctx);
        const user = await this.userFacade.findOrCreate(from.id, from.username);
        const active = await this.gameFacade.getActiveSessionWithCharacter(user.id);

        if (!active) {
            await ctx.reply(BotMessages.NO_ACTIVE_GAME_REPLY);

            return;
        }

        const {session, character} = active;

        const roomInfo = await this.gameFacade.getEnterRoomInfo(
            session.id,
            session.currentRoomIndex + 1,
            character.hp,
            character.maxHp,
        );

        if (!roomInfo) {
            await ctx.reply(BotMessages.NO_ENEMY_IN_ROOM);

            return;
        }

        await ctx.reply(this.replyService.renderEnterRoom(roomInfo), {
            reply_markup: Keyboards.ATTACK,
        });
    }
}
