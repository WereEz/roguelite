import {Module} from '@nestjs/common';
import {TelegramService} from './application/TelegramService';

@Module({
    providers: [TelegramService],
})
export class TelegramModule {}
