import {Injectable, Inject} from '@nestjs/common';
import {Context} from 'telegraf';
import {IUserFacade, USER_FACADE} from '../../../base/domain/interfaces/user/IUserFacade';
import {ReplyService} from '../ReplyService';
import {assertFrom} from '../guards/assertFrom';
import {MenuButton} from '../../domain/constants/MenuButton';

@Injectable()
export class StartUseCase {
    constructor(
        @Inject(USER_FACADE)
        private readonly userFacade: IUserFacade,
        private readonly replyService: ReplyService,
    ) {}

    async execute(ctx: Context): Promise<void> {
        const from = assertFrom(ctx);

        await this.userFacade.findOrCreate(from.id, from.username);
        await ctx.reply(this.replyService.renderStart(from.username), {
            reply_markup: {
                keyboard: [[{text: MenuButton.NEW_GAME}, {text: MenuButton.STATS}]],
                resize_keyboard: true,
            },
        });
    }
}
