jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => undefined,
    initializeTransactionalContext: () => undefined,
}));

import {GameFacade} from '../../game/infrastructure/facades/GameFacade';
import {
    ALTAR_STAT_BOOST,
    AltarService,
    BLOOD_ALTAR_MAX_USES,
    CAMPFIRE_HEAL_RATIO,
} from '../../game/domain/services/AltarService';
import {GameSessionService} from '../../game/domain/services/GameSessionService';
import {CharacterService} from '../../game/domain/services/CharacterService';
import {RoomService} from '../../game/domain/services/RoomService';
import {EnemyService} from '../../game/domain/services/EnemyService';
import {CombatService} from '../../game/domain/services/CombatService';
import {RoomEnemyService} from '../../game/domain/services/RoomEnemyService';
import {RandomService} from '../../game/domain/services/RandomService';
import {DungeonGraphService} from '../../game/domain/services/DungeonGraphService';
import {RoomType} from '../../game/domain/enums/RoomType';
import {GameSessionStatus} from '../../game/domain/enums/GameSessionStatus';
import {RoomEntity} from '../../game/domain/entities/RoomEntity';
import {CharacterEntity} from '../../game/domain/entities/CharacterEntity';
import {makeCharacter, makeRoom, makeSession as makeSessionBase} from '../mocks/entities';

function makeSession(character: CharacterEntity, room: RoomEntity) {
    return makeSessionBase({character, currentRoomId: room.id, currentRoom: room});
}

interface Mocks {
    gameSessionService: jest.Mocked<GameSessionService>;
    characterService: jest.Mocked<CharacterService>;
    roomService: jest.Mocked<RoomService>;
    roomEnemyService: jest.Mocked<RoomEnemyService>;
}

function makeFacade(): {facade: GameFacade; mocks: Mocks} {
    const gameSessionService = {
        findActiveSessionWithCharacterLocked: jest.fn(),
        setCurrentRoom: jest.fn().mockResolvedValue(undefined),
        finishSession: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<GameSessionService>;

    const characterService = {
        updateHp: jest.fn().mockResolvedValue(undefined),
        boostStat: jest.fn(),
    } as unknown as jest.Mocked<CharacterService>;

    const roomService = {
        findByIdWithRoomEnemy: jest.fn(),
        findByIdWithRoomEnemyIfReachable: jest.fn(),
        findNextRooms: jest.fn().mockResolvedValue([]),
        completeRoom: jest.fn().mockResolvedValue(undefined),
        incrementInteractionCount: jest.fn().mockResolvedValue(undefined),
        toPathChoices: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<RoomService>;

    const roomEnemyService = {
        updateCurrentHp: jest.fn(),
    } as unknown as jest.Mocked<RoomEnemyService>;

    const altarService = new AltarService(gameSessionService, characterService, roomService);

    const facade = new GameFacade(
        gameSessionService,
        characterService,
        roomService,
        {} as EnemyService,
        {} as CombatService,
        roomEnemyService,
        {} as RandomService,
        {} as DungeonGraphService,
        altarService,
    );

    return {
        facade,
        mocks: {gameSessionService, characterService, roomService, roomEnemyService},
    };
}

describe('GameFacade — campfire / altar / blood altar', () => {
    describe('chooseRoom — CAMPFIRE', () => {
        it('heals 40% of maxHp, capped at maxHp, and auto-completes', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 30, maxHp: 100});
            const room = makeRoom({type: RoomType.CAMPFIRE});
            const session = makeSession(character, makeRoom({id: 7, isComplete: true}));

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemyIfReachable.mockResolvedValue(room);

            const result = await facade.chooseRoom(100, room.id);

            expect(mocks.characterService.updateHp).toHaveBeenCalledWith(
                character.id,
                30 + Math.floor(100 * CAMPFIRE_HEAL_RATIO),
            );
            expect(mocks.roomService.completeRoom).toHaveBeenCalledWith(room.id);
            expect(result.healedAmount).toBe(40);
            expect(result.hp).toBe(70);
        });

        it('caps healing at maxHp', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 90, maxHp: 100});
            const room = makeRoom({type: RoomType.CAMPFIRE});
            const session = makeSession(character, makeRoom({id: 7, isComplete: true}));

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemyIfReachable.mockResolvedValue(room);

            const result = await facade.chooseRoom(100, room.id);

            expect(mocks.characterService.updateHp).toHaveBeenCalledWith(character.id, 100);
            expect(result.healedAmount).toBe(10);
            expect(result.hp).toBe(100);
        });
    });

    describe('chooseRoom — ALTAR / BLOOD_ALTAR entry', () => {
        it('does not auto-complete altar; sets it as current room', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter();
            const room = makeRoom({type: RoomType.ALTAR});
            const session = makeSession(character, makeRoom({id: 7, isComplete: true}));

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemyIfReachable.mockResolvedValue(room);

            const result = await facade.chooseRoom(100, room.id);

            expect(mocks.gameSessionService.setCurrentRoom).toHaveBeenCalledWith(
                session.id,
                room.id,
            );
            expect(mocks.roomService.completeRoom).not.toHaveBeenCalled();
            expect(result.roomType).toBe(RoomType.ALTAR);
            expect(result.bloodAltarState).toBeUndefined();
        });

        it('exposes blood altar state with usesRemaining and nextCost', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({maxHp: 90, hp: 60});
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 1});
            const session = makeSession(character, makeRoom({id: 7, isComplete: true}));

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemyIfReachable.mockResolvedValue(room);

            const result = await facade.chooseRoom(100, room.id);

            expect(result.bloodAltarState).toEqual({
                usesRemaining: BLOOD_ALTAR_MAX_USES - 1,
                nextCost: Math.ceil(90 / 3),
            });
        });
    });

    describe('useAltar', () => {
        it('boosts the chosen stat and completes the room', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({strength: 10});
            const room = makeRoom({type: RoomType.ALTAR});
            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);
            mocks.characterService.boostStat.mockResolvedValue({
                stats: {strength: 11, endurance: 10, agility: 10, hp: 100, maxHp: 100},
                statDelta: 1,
                hpDelta: 0,
                maxHpDelta: 0,
            });

            const result = await facade.useAltar(100, 'STRENGTH');

            expect(mocks.characterService.boostStat).toHaveBeenCalledWith(
                character,
                character.id,
                'STRENGTH',
                ALTAR_STAT_BOOST,
            );
            expect(mocks.roomService.completeRoom).toHaveBeenCalledWith(room.id);
            expect(result.roomComplete).toBe(true);
            expect(result.gameOver).toBe(false);
            expect(result.character.strength).toBe(11);
        });

        it('rejects when current room is not an altar', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter();
            const room = makeRoom({type: RoomType.CAMPFIRE});
            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);

            await expect(facade.useAltar(100, 'STRENGTH')).rejects.toThrow();
            expect(mocks.characterService.boostStat).not.toHaveBeenCalled();
        });
    });

    describe('useBloodAltar — cost first, bonus after', () => {
        it('subtracts cost, applies stat boost, increments uses', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 100, maxHp: 99}); // cost = 33
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 0});
            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);
            mocks.characterService.boostStat.mockResolvedValue({
                stats: {strength: 11, endurance: 10, agility: 10, hp: 67, maxHp: 99},
                statDelta: 1,
                hpDelta: 0,
                maxHpDelta: 0,
            });

            const result = await facade.useBloodAltar(100, 'STRENGTH');

            expect(mocks.characterService.updateHp).toHaveBeenCalledWith(character.id, 67);
            expect(mocks.characterService.boostStat).toHaveBeenCalledWith(
                expect.objectContaining({hp: 67}),
                character.id,
                'STRENGTH',
                ALTAR_STAT_BOOST,
            );
            expect(mocks.roomService.incrementInteractionCount).toHaveBeenCalledWith(room.id);
            expect(mocks.roomService.completeRoom).not.toHaveBeenCalled();
            expect(mocks.gameSessionService.finishSession).not.toHaveBeenCalled();
            expect(result.roomComplete).toBe(false);
            expect(result.bloodAltarState?.usesRemaining).toBe(BLOOD_ALTAR_MAX_USES - 1);
        });

        it('kills the player when cost exceeds hp; pays the toll without granting stat', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 20, maxHp: 99, strength: 10}); // cost = 33
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 0});
            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);

            const result = await facade.useBloodAltar(100, 'STRENGTH');

            expect(mocks.characterService.updateHp).toHaveBeenCalledWith(character.id, 0);
            expect(mocks.characterService.boostStat).not.toHaveBeenCalled();
            expect(mocks.roomService.incrementInteractionCount).toHaveBeenCalledWith(room.id);
            expect(mocks.roomService.completeRoom).toHaveBeenCalledWith(room.id);
            expect(mocks.gameSessionService.finishSession).toHaveBeenCalledWith(
                session.id,
                GameSessionStatus.LOST,
            );
            expect(result.gameOver).toBe(true);
            expect(result.character.hp).toBe(0);
            expect(result.character.strength).toBe(10);
        });

        it('endurance does not save player from a fatal cost', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 10, maxHp: 99, endurance: 10}); // cost = 33
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 0});
            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);

            const result = await facade.useBloodAltar(100, 'ENDURANCE');

            expect(mocks.characterService.boostStat).not.toHaveBeenCalled();
            expect(result.gameOver).toBe(true);
            expect(result.character.endurance).toBe(10);
        });

        it('auto-completes the room on the third use', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 100, maxHp: 99});

            const room = makeRoom({
                type: RoomType.BLOOD_ALTAR,
                interactionCount: BLOOD_ALTAR_MAX_USES - 1,
            });

            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);
            mocks.characterService.boostStat.mockResolvedValue({
                stats: {strength: 11, endurance: 10, agility: 10, hp: 67, maxHp: 99},
                statDelta: 1,
                hpDelta: 0,
                maxHpDelta: 0,
            });

            const result = await facade.useBloodAltar(100, 'STRENGTH');

            expect(mocks.roomService.completeRoom).toHaveBeenCalledWith(room.id);
            expect(result.roomComplete).toBe(true);
            expect(result.bloodAltarState).toBeUndefined();
        });
    });

    describe('leaveBloodAltar', () => {
        it('completes the room and returns path choices, no stat change', async () => {
            const {facade, mocks} = makeFacade();
            const character = makeCharacter({hp: 50, strength: 10});
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 1});
            const session = makeSession(character, room);

            mocks.gameSessionService.findActiveSessionWithCharacterLocked.mockResolvedValue(
                session,
            );
            mocks.roomService.findByIdWithRoomEnemy.mockResolvedValue(room);

            const result = await facade.leaveBloodAltar(100);

            expect(mocks.characterService.boostStat).not.toHaveBeenCalled();
            expect(mocks.roomService.completeRoom).toHaveBeenCalledWith(room.id);
            expect(result.roomComplete).toBe(true);
            expect(result.gameOver).toBe(false);
            expect(result.character.strength).toBe(10);
            expect(result.character.hp).toBe(50);
        });
    });
});
