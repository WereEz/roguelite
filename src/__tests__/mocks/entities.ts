import {CharacterEntity} from '../../game/domain/entities/CharacterEntity';
import {RoomEntity} from '../../game/domain/entities/RoomEntity';
import {GameSessionEntity} from '../../game/domain/entities/GameSessionEntity';
import {RoomType} from '../../game/domain/enums/RoomType';
import {GameSessionStatus} from '../../game/domain/enums/GameSessionStatus';

export function makeCharacter(overrides: Partial<CharacterEntity> = {}): CharacterEntity {
    return {
        id: 1,
        sessionId: 1,
        strength: 10,
        endurance: 10,
        agility: 10,
        hp: 100,
        maxHp: 100,
        session: undefined as never,
        ...overrides,
    } as CharacterEntity;
}

export function makeRoom(overrides: Partial<RoomEntity> = {}): RoomEntity {
    return {
        id: 42,
        sessionId: 1,
        layer: 2,
        type: RoomType.ALTAR,
        direction: 'center',
        roomEnemy: null,
        isComplete: false,
        interactionCount: 0,
        session: undefined as never,
        ...overrides,
    } as RoomEntity;
}

export function makeSession(overrides: Partial<GameSessionEntity> = {}): GameSessionEntity {
    return {
        id: 1,
        userId: 100,
        status: GameSessionStatus.ACTIVE,
        currentRoomId: null,
        currentRoom: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: undefined as never,
        ...overrides,
    } as GameSessionEntity;
}
