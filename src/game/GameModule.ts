import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CharacterEntity} from './domain/entities/CharacterEntity';
import {GameSessionEntity} from './domain/entities/GameSessionEntity';
import {EnemyEntity} from './domain/entities/EnemyEntity';
import {RoomEntity} from './domain/entities/RoomEntity';
import {CHARACTER_REPOSITORY} from './domain/interfaces/ICharacterRepository';
import {ENEMY_REPOSITORY} from './domain/interfaces/IEnemyRepository';
import {GAME_SESSION_REPOSITORY} from './domain/interfaces/IGameSessionRepository';
import {ROOM_REPOSITORY} from './domain/interfaces/IRoomRepository';
import {CharacterService} from './domain/services/CharacterService';
import {GameSessionService} from './domain/services/GameSessionService';
import {EnemyService} from './domain/services/EnemyService';
import {CombatService} from './domain/services/CombatService';
import {RoomService} from './domain/services/RoomService';
import {CharacterRepository} from './infrastructure/repositories/CharacterRepository';
import {EnemyRepository} from './infrastructure/repositories/EnemyRepository';
import {GameSessionRepository} from './infrastructure/repositories/GameSessionRepository';
import {RoomRepository} from './infrastructure/repositories/RoomRepository';

@Module({
    imports: [
        TypeOrmModule.forFeature([GameSessionEntity, CharacterEntity, RoomEntity, EnemyEntity]),
    ],
    providers: [
        GameSessionService,
        CharacterService,
        CombatService,
        EnemyService,
        RoomService,
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
            provide: ENEMY_REPOSITORY,
            useClass: EnemyRepository,
        },
    ],
    exports: [],
})
export class GameModule {}
