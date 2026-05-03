import {
    ALTAR_STAT_BOOST,
    AltarService,
    BLOOD_ALTAR_MAX_USES,
} from '../../game/domain/services/AltarService';
import {GameSessionService} from '../../game/domain/services/GameSessionService';
import {CharacterService} from '../../game/domain/services/CharacterService';
import {IStatBoostResult} from '../../game/domain/interfaces/IStatBoostResult';
import {RoomService} from '../../game/domain/services/RoomService';
import {RoomType} from '../../game/domain/enums/RoomType';
import {GameSessionStatus} from '../../game/domain/enums/GameSessionStatus';
import {makeCharacter, makeRoom, makeSession} from '../mocks/entities';

interface Mocks {
    gameSessionService: jest.Mocked<GameSessionService>;
    characterService: jest.Mocked<CharacterService>;
    roomService: jest.Mocked<RoomService>;
}

function makeService(): {service: AltarService; mocks: Mocks} {
    const gameSessionService = {
        setCurrentRoom: jest.fn().mockResolvedValue(undefined),
        finishSession: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<GameSessionService>;

    const characterService = {
        updateHp: jest.fn().mockResolvedValue(undefined),
        boostStat: jest.fn(),
    } as unknown as jest.Mocked<CharacterService>;

    const roomService = {
        completeRoom: jest.fn().mockResolvedValue(undefined),
        incrementInteractionCount: jest.fn().mockResolvedValue(undefined),
        findNextRooms: jest.fn().mockResolvedValue([]),
        toPathChoices: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<RoomService>;

    const service = new AltarService(gameSessionService, characterService, roomService);

    return {service, mocks: {gameSessionService, characterService, roomService}};
}

function boostResult(overrides: Partial<IStatBoostResult> = {}): IStatBoostResult {
    return {
        stats: {strength: 11, endurance: 10, agility: 10, hp: 100, maxHp: 100},
        statDelta: 1,
        hpDelta: 0,
        maxHpDelta: 0,
        ...overrides,
    };
}

describe('AltarService', () => {
    describe('useAltar', () => {
        it('passes ALTAR_STAT_BOOST as the delta to CharacterService', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter();
            const room = makeRoom();

            mocks.characterService.boostStat.mockResolvedValue(boostResult());

            await service.useAltar(room, character, 'STRENGTH');

            expect(mocks.characterService.boostStat).toHaveBeenCalledWith(
                character,
                character.id,
                'STRENGTH',
                ALTAR_STAT_BOOST,
            );
        });

        it('surfaces boost details in the result', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter();
            const room = makeRoom();

            mocks.characterService.boostStat.mockResolvedValue(
                boostResult({statDelta: 1, hpDelta: 0, maxHpDelta: 0}),
            );

            const result = await service.useAltar(room, character, 'STRENGTH');

            expect(result.boost).toEqual({
                stat: 'STRENGTH',
                statDelta: 1,
                hpDelta: 0,
                maxHpDelta: 0,
            });
            expect(result.character.strength).toBe(11);
            expect(result.roomComplete).toBe(true);
        });

        it('reports hp/maxHp deltas when boosting endurance', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter({endurance: 10, hp: 100, maxHp: 100});
            const room = makeRoom();

            mocks.characterService.boostStat.mockResolvedValue({
                stats: {strength: 10, endurance: 11, agility: 10, hp: 110, maxHp: 110},
                statDelta: 1,
                hpDelta: 10,
                maxHpDelta: 10,
            });

            const result = await service.useAltar(room, character, 'ENDURANCE');

            expect(result.boost?.maxHpDelta).toBe(10);
            expect(result.boost?.hpDelta).toBe(10);
            expect(result.character.maxHp).toBe(110);
            expect(result.character.hp).toBe(110);
        });
    });

    describe('useBloodAltar', () => {
        it('kills the player and skips boost when cost ≥ hp', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter({hp: 20, maxHp: 99}); // cost = 33
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 0});
            const session = makeSession();

            const result = await service.useBloodAltar(session, room, character, 'STRENGTH');

            expect(mocks.characterService.boostStat).not.toHaveBeenCalled();
            expect(mocks.gameSessionService.finishSession).toHaveBeenCalledWith(
                session.id,
                GameSessionStatus.LOST,
            );
            expect(result.gameOver).toBe(true);
            expect(result.boost).toBeUndefined();
        });

        it('on a non-final use, exposes refreshed nextCost based on the boosted maxHp', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter({hp: 100, maxHp: 90}); // cost = 30
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 0});
            const session = makeSession();

            mocks.characterService.boostStat.mockResolvedValue({
                stats: {strength: 10, endurance: 11, agility: 10, hp: 80, maxHp: 100},
                statDelta: 1,
                hpDelta: 10,
                maxHpDelta: 10,
            });

            const result = await service.useBloodAltar(session, room, character, 'ENDURANCE');

            expect(result.roomComplete).toBe(false);
            expect(result.bloodAltarState?.nextCost).toBe(Math.ceil(100 / 3));
            expect(result.bloodAltarState?.usesRemaining).toBe(BLOOD_ALTAR_MAX_USES - 1);
            expect(result.boost?.stat).toBe('ENDURANCE');
        });

        it('completes the room and surfaces boost on the final use', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter({hp: 100, maxHp: 99});

            const room = makeRoom({
                type: RoomType.BLOOD_ALTAR,
                interactionCount: BLOOD_ALTAR_MAX_USES - 1,
            });

            const session = makeSession();

            mocks.characterService.boostStat.mockResolvedValue(
                boostResult({stats: {strength: 11, endurance: 10, agility: 10, hp: 67, maxHp: 99}}),
            );

            const result = await service.useBloodAltar(session, room, character, 'STRENGTH');

            expect(mocks.roomService.completeRoom).toHaveBeenCalledWith(room.id);
            expect(result.roomComplete).toBe(true);
            expect(result.bloodAltarState).toBeUndefined();
            expect(result.boost).toEqual({
                stat: 'STRENGTH',
                statDelta: 1,
                hpDelta: 0,
                maxHpDelta: 0,
            });
        });
    });

    describe('leaveBloodAltar', () => {
        it('returns no boost', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter();
            const room = makeRoom({type: RoomType.BLOOD_ALTAR, interactionCount: 1});

            const result = await service.leaveBloodAltar(room, character);

            expect(mocks.characterService.boostStat).not.toHaveBeenCalled();
            expect(result.boost).toBeUndefined();
            expect(result.roomComplete).toBe(true);
        });
    });

    describe('enterCampfire', () => {
        it('caps healing at maxHp', async () => {
            const {service, mocks} = makeService();
            const character = makeCharacter({hp: 90, maxHp: 100});
            const room = makeRoom({type: RoomType.CAMPFIRE});
            const session = makeSession();

            const result = await service.enterCampfire(session, room, character);

            expect(mocks.characterService.updateHp).toHaveBeenCalledWith(character.id, 100);
            expect(result.healedAmount).toBe(10);
            expect(result.hp).toBe(100);
        });
    });
});
