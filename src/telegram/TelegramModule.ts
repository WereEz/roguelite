import {Module} from '@nestjs/common';
import {TelegramService} from './application/TelegramService';
import {ReplyService} from './application/ReplyService';
import {StartUseCase} from './application/use-cases/StartUseCase';
import {NewGameUseCase} from './application/use-cases/NewGameUseCase';
import {StatsUseCase} from './application/use-cases/StatsUseCase';
import {AttackUseCase} from './application/use-cases/AttackUseCase';
import {NextRoomUseCase} from './application/use-cases/NextRoomUseCase';
import {UserModule} from '../user/UserModule';
import {GameModule} from '../game/GameModule';

@Module({
    imports: [UserModule, GameModule],
    providers: [
        TelegramService,
        ReplyService,
        StartUseCase,
        NewGameUseCase,
        StatsUseCase,
        AttackUseCase,
        NextRoomUseCase,
    ],
})
export class TelegramModule {}
