import {Injectable, Inject} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {Keyboards, MenuKeyboards, buildPathChoicesKeyboard} from '../../domain/constants/Keyboards';

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
        const isNew = existing === null;

        const {session, character, currentLayer} =
            existing ?? (await this.gameFacade.initSession(user.id));

        await ctx.reply(this.replyService.renderNewGame(isNew, currentLayer, character), {
            reply_markup: MenuKeyboards.IN_GAME,
        });

        const inActiveCombat =
            session.currentRoomId !== null &&
            session.currentRoom !== null &&
            !session.currentRoom.isComplete;

        if (inActiveCombat) {
            const room = await this.gameFacade.getEnterRoomInfo(
                session.id,
                session.currentRoomId!,
                character.hp,
                character.maxHp,
            );

            if (room) {
                await ctx.reply(this.replyService.renderEnterRoom(room), {
                    reply_markup: Keyboards.ATTACK,
                });

                return;
            }
        }

        const choices = await this.gameFacade.getPathChoices(session.id, session.currentRoomId);

        if (choices.length > 0) {
            await ctx.reply(this.replyService.renderPathChoices(), {
                reply_markup: buildPathChoicesKeyboard(choices),
            });
        }
    }
}
