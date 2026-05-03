import {Context} from 'telegraf';

export interface ICallbackRoute {
    match: (data: string) => boolean;
    handle: (ctx: Context, data: string) => Promise<void>;
}
