import {Injectable, Inject, BadRequestException, NotFoundException} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {RoomType} from '../../../game/domain/enums/RoomType';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {BotMessages} from '../../domain/constants/BotMessages';
import {Keyboards, buildPathChoicesKeyboard} from '../../domain/constants/Keyboards';
import * as CallbackData from '../../domain/constants/CallbackData';

@Injectable()
export class ChoosePathUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        @Inject(GAME_FACADE)
        private readonly gameFacade: IGameFacade,
        private readonly replyService: ReplyService,
    ) {}

    async execute(ctx: Context, data: string): Promise<void> {
        await ctx.answerCbQuery();

        const roomId = CallbackData.parseRoomId(data);

        if (isNaN(roomId)) {
            throw new BadRequestException('Invalid room id');
        }

        const from = assertFrom(ctx);
        const user = await this.userFacade.findOrCreate(from.id, from.username);

        let result;

        try {
            result = await this.gameFacade.chooseRoom(user.id, roomId);
        } catch (err) {
            if (err instanceof NotFoundException) {
                await ctx.reply(BotMessages.NO_ACTIVE_GAME_REPLY);

                return;
            }

            if (err instanceof BadRequestException) {
                await ctx.reply(BotMessages.INVALID_ROOM_CHOICE);

                return;
            }

            throw err;
        }

        if (result.roomType === RoomType.ENEMY || result.roomType === RoomType.BOSS) {
            if (!result.enemyInfo) {
                await ctx.reply(BotMessages.NO_ENEMY_IN_ROOM);

                return;
            }

            await ctx.reply(this.replyService.renderEnterRoom(result.enemyInfo), {
                reply_markup: Keyboards.ATTACK,
            });
        } else {
            await ctx.reply(
                this.replyService.renderEmptyRoom(
                    result.layer,
                    result.playerHp,
                    result.playerMaxHp,
                ),
            );

            if (result.pathChoices.length > 0) {
                await ctx.reply(this.replyService.renderPathChoices(), {
                    reply_markup: buildPathChoicesKeyboard(result.pathChoices),
                });
            }
        }
    }
}
