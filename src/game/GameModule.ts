import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CharacterEntity} from './domain/entities/CharacterEntity';
import {GameSessionEntity} from './domain/entities/GameSessionEntity';
import {EnemyEntity} from './domain/entities/EnemyEntity';
import {RoomEntity} from './domain/entities/RoomEntity';
import {RoomConnectionEntity} from './domain/entities/RoomConnectionEntity';
import {RoomEnemyEntity} from './domain/entities/RoomEnemyEntity';
import {CHARACTER_REPOSITORY} from './domain/interfaces/ICharacterRepository';
import {ENEMY_REPOSITORY} from './domain/interfaces/IEnemyRepository';
import {GAME_SESSION_REPOSITORY} from './domain/interfaces/IGameSessionRepository';
import {ROOM_REPOSITORY} from './domain/interfaces/IRoomRepository';
import {ROOM_ENEMY_REPOSITORY} from './domain/interfaces/IRoomEnemyRepository';
import {CharacterService} from './domain/services/CharacterService';
import {GameSessionService} from './domain/services/GameSessionService';
import {EnemyService} from './domain/services/EnemyService';
import {CombatService} from './domain/services/CombatService';
import {RoomService} from './domain/services/RoomService';
import {RoomEnemyService} from './domain/services/RoomEnemyService';
import {RandomService} from './domain/services/RandomService';
import {DungeonGraphService} from './domain/services/DungeonGraphService';
import {AltarService} from './domain/services/AltarService';
import {CharacterRepository} from './infrastructure/repositories/CharacterRepository';
import {EnemyRepository} from './infrastructure/repositories/EnemyRepository';
import {GameSessionRepository} from './infrastructure/repositories/GameSessionRepository';
import {RoomRepository} from './infrastructure/repositories/RoomRepository';
import {RoomEnemyRepository} from './infrastructure/repositories/RoomEnemyRepository';
import {GameFacade} from './infrastructure/facades/GameFacade';
import {GAME_FACADE} from '../base/domain/interfaces/game/IGameFacade';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            GameSessionEntity,
            CharacterEntity,
            RoomEntity,
            RoomConnectionEntity,
            RoomEnemyEntity,
            EnemyEntity,
        ]),
    ],
    providers: [
        GameSessionService,
        CharacterService,
        CombatService,
        EnemyService,
        RoomService,
        RoomEnemyService,
        RandomService,
        DungeonGraphService,
        AltarService,
        {
            provide: GAME_FACADE,
            useClass: GameFacade,
        },
        {
            provide: GAME_SESSION_REPOSITORY,
            useClass: GameSessionRepository,
        },
        {
            provide: CHARACTER_REPOSITORY,
            useClass: CharacterRepository,
        },
        {
            provide: ROOM_REPOSITORY,
            useClass: RoomRepository,
        },
        {
            provide: ROOM_ENEMY_REPOSITORY,
            useClass: RoomEnemyRepository,
        },
        {
            provide: ENEMY_REPOSITORY,
            useClass: EnemyRepository,
        },
    ],
    exports: [GAME_FACADE],
})
export class GameModule {}
