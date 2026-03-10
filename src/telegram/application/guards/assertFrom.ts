import {BadRequestException} from '@nestjs/common';
import {Context} from 'telegraf';
import {User} from 'telegraf/types';

export function assertFrom(ctx: Context): User {
    if (!ctx.from) {
        throw new BadRequestException('Message has no sender');
    }

    return ctx.from;
}
