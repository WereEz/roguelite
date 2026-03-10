import {Injectable, Inject} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {Keyboards} from '../../domain/constants/Keyboards';

@Injectable()
export class NewGameUseCase {
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

        const existing = await this.gameFacade.getActiveSessionWithCharacter(user.id);

        let session, character, isNew: boolean;

        if (existing) {
            ({session, character} = existing);
            isNew = false;
        } else {
            ({session, character} = await this.gameFacade.initSession(user.id));
            isNew = true;
        }

        await ctx.reply(
            this.replyService.renderNewGame(isNew, session.currentRoomIndex + 1, character),
        );

        const roomInfo = await this.gameFacade.getEnterRoomInfo(
            session.id,
            session.currentRoomIndex + 1,
            character.hp,
            character.maxHp,
        );

        if (roomInfo) {
            await ctx.reply(this.replyService.renderEnterRoom(roomInfo), {
                reply_markup: Keyboards.ATTACK,
            });
        }
    }
}
