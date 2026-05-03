import {Injectable, Inject, BadRequestException, NotFoundException} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {IGameFacade, GAME_FACADE} from '../../../base/domain/interfaces/game/IGameFacade';
import {IChooseRoomResult} from '../../../base/domain/interfaces/game/IChooseRoomResult';
import {RoomType} from '../../../game/domain/enums/RoomType';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {BotMessages} from '../../domain/constants/BotMessages';
import {
    Keyboards,
    buildAltarKeyboard,
    buildBloodAltarKeyboard,
    buildPathChoicesKeyboard,
} from '../../domain/constants/Keyboards';
import * as CallbackData from '../../domain/constants/CallbackData';

type RoomHandler = (ctx: Context, result: IChooseRoomResult) => Promise<void>;

@Injectable()
export class ChoosePathUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        @Inject(GAME_FACADE)
        private readonly gameFacade: IGameFacade,
        private readonly replyService: ReplyService,
    ) {}

    private readonly handlers: Record<RoomType, RoomHandler> = {
        [RoomType.ENEMY]: (ctx, result) => this.handleCombat(ctx, result),
        [RoomType.BOSS]: (ctx, result) => this.handleCombat(ctx, result),
        [RoomType.CAMPFIRE]: (ctx, result) => this.handleCampfire(ctx, result),
        [RoomType.ALTAR]: (ctx, result) => this.handleAltar(ctx, result),
        [RoomType.BLOOD_ALTAR]: (ctx, result) => this.handleBloodAltar(ctx, result),
    };

    async execute(ctx: Context, data: string): Promise<void> {
        const roomId = CallbackData.parseRoomId(data);

        if (isNaN(roomId)) {
            throw new BadRequestException('Invalid room id');
        }

        const from = assertFrom(ctx);
        const user = await this.userFacade.findOrCreate(from.id, from.username);

        let result: IChooseRoomResult;

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

        await this.handlers[result.roomType](ctx, result);
    }

    private async handleCombat(ctx: Context, result: IChooseRoomResult): Promise<void> {
        if (!result.enemyInfo) {
            await ctx.reply(BotMessages.NO_ENEMY_IN_ROOM);

            return;
        }

        await ctx.reply(this.replyService.renderEnterRoom(result.enemyInfo), {
            reply_markup: Keyboards.ATTACK,
        });
    }

    private async handleCampfire(ctx: Context, result: IChooseRoomResult): Promise<void> {
        await ctx.reply(
            this.replyService.renderCampfire(result.healedAmount ?? 0, result.hp, result.maxHp),
        );

        await this.showPathChoicesIfAny(ctx, result);
    }

    private async handleAltar(ctx: Context, result: IChooseRoomResult): Promise<void> {
        await ctx.reply(this.replyService.renderAltarPrompt(result.hp, result.maxHp), {
            reply_markup: buildAltarKeyboard(),
        });
    }

    private async handleBloodAltar(ctx: Context, result: IChooseRoomResult): Promise<void> {
        const state = result.bloodAltarState;

        if (!state) {
            throw new Error('Blood altar room missing state');
        }

        await ctx.reply(
            this.replyService.renderBloodAltarPrompt({
                hp: result.hp,
                maxHp: result.maxHp,
                usesRemaining: state.usesRemaining,
                nextCost: state.nextCost,
            }),
            {reply_markup: buildBloodAltarKeyboard()},
        );
    }

    private async showPathChoicesIfAny(ctx: Context, result: IChooseRoomResult): Promise<void> {
        if (result.pathChoices.length === 0) return;

        await ctx.reply(this.replyService.renderPathChoices(), {
            reply_markup: buildPathChoicesKeyboard(result.pathChoices),
        });
    }
}
