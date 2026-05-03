import {Module} from '@nestjs/common';
import {TelegramService} from './application/TelegramService';
import {ReplyService} from './application/ReplyService';
import {StartUseCase} from './application/use-cases/StartUseCase';
import {NewGameUseCase} from './application/use-cases/NewGameUseCase';
import {StatsUseCase} from './application/use-cases/StatsUseCase';
import {AttackUseCase} from './application/use-cases/AttackUseCase';
import {ChoosePathUseCase} from './application/use-cases/ChoosePathUseCase';
import {AltarUseCase} from './application/use-cases/AltarUseCase';
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
        ChoosePathUseCase,
        AltarUseCase,
    ],
})
export class TelegramModule {}
