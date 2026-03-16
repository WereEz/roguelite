import 'reflect-metadata';
import {CombatService} from '../../game/domain/services/CombatService';
import {RandomService} from '../../game/domain/services/RandomService';
import {CombatantStateDto} from '../../game/domain/dtos/CombatantStateDto';
import {CombatEventType} from '../../game/domain/enums/CombatEventType';
import {CombatResult} from '../../game/domain/enums/CombatResult';
import {PlayerAction} from '../../game/domain/enums/PlayerAction';

const DEFAULT_STATS: CombatantStateDto = {hp: 100, strength: 10, endurance: 5, agility: 5};

function makeChar(overrides: Partial<CombatantStateDto> = {}): CombatantStateDto {
    return {...DEFAULT_STATS, ...overrides};
}

function makeService(rollValues: boolean[], intBetweenValue = 0): CombatService {
    const mockRandom = {
        roll: jest.fn().mockImplementation(() => rollValues.shift() ?? false),
        intBetween: jest.fn().mockReturnValue(intBetweenValue),
        pick: jest.fn(),
    } as unknown as RandomService;

    return new CombatService(mockRandom);
}

describe('CombatService', () => {
    describe('processTurn — turn order', () => {
        it('player attacks first when agility is equal', () => {
            const service = makeService([false, false]);
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.STRIKE);

            expect(result.events[0].type).toBe(CombatEventType.PLAYER_HIT);
        });

        it('enemy attacks first when enemy agility is higher', () => {
            const service = makeService([false, false]);
            const player = makeChar({agility: 3});
            const enemy = makeChar({agility: 8});

            const result = service.processTurn(player, enemy, PlayerAction.STRIKE);

            expect(result.events[0].type).toBe(CombatEventType.PLAYER_TOOK_DAMAGE);
        });
    });

    describe('processTurn — combat results', () => {
        it('returns ONGOING when both survive', () => {
            const service = makeService([false, false]);
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.STRIKE);

            expect(result.result).toBe(CombatResult.ONGOING);
            expect(result.enemyHp).toBe(92);
            expect(result.playerHp).toBe(92);
        });

        it('returns WIN when enemy hp reaches 0', () => {
            const service = makeService([false]);
            const enemy = makeChar({hp: 1, endurance: 0});

            const result = service.processTurn(makeChar(), enemy, PlayerAction.STRIKE);

            expect(result.result).toBe(CombatResult.WIN);
            expect(result.enemyHp).toBe(0);
        });

        it('returns LOSE when player hp reaches 0 (enemy attacks first)', () => {
            const service = makeService([false]);

            const player = makeChar({hp: 1, endurance: 0, agility: 1});
            const enemy = makeChar({strength: 50, agility: 10});

            const result = service.processTurn(player, enemy, PlayerAction.STRIKE);

            expect(result.result).toBe(CombatResult.LOSE);
            expect(result.playerHp).toBe(0);
        });

        it('enemy does not attack after dying from player first strike', () => {
            const service = makeService([false]);
            const enemy = makeChar({hp: 1, endurance: 0});

            const result = service.processTurn(makeChar(), enemy, PlayerAction.STRIKE);

            const playerTookDamage = result.events.some(
                (e) => e.type === CombatEventType.PLAYER_TOOK_DAMAGE,
            );
            expect(playerTookDamage).toBe(false);
        });
    });

    describe('STRIKE action', () => {
        it('deals damage and emits PLAYER_HIT when enemy does not dodge', () => {
            const service = makeService([false, false]);
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.STRIKE);

            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_HIT, damage: 8});
        });

        it('emits PLAYER_MISS and deals no damage when enemy dodges', () => {
            const service = makeService([true, false]);
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.STRIKE);

            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_MISS});
            expect(result.enemyHp).toBe(100);
        });
    });

    describe('PRECISE_STRIKE action', () => {
        it('bypasses dodge check and deals reduced deterministic damage', () => {
            const mockRandom = {
                roll: jest.fn().mockReturnValue(false),
                intBetween: jest.fn().mockReturnValue(0),
                pick: jest.fn(),
            } as unknown as RandomService;
            const service = new CombatService(mockRandom);

            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.PRECISE_STRIKE);

            expect(result.events).toContainEqual({
                type: CombatEventType.PLAYER_PRECISE_HIT,
                damage: 7,
            });
            // roll should only be called once (for player's dodge vs enemy attack)
            expect((mockRandom.roll as jest.Mock).mock.calls).toHaveLength(1);
        });
    });

    describe('EVADE action', () => {
        it('player evades and counters when dodge succeeds', () => {
            const service = makeService([true]); // player evades successfully
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.EVADE);

            expect(result.playerHp).toBe(100);
            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_EVADED});
            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_COUNTER, damage: 8});
            expect(result.enemyHp).toBe(92);
        });

        it('player evades without countering when action is not EVADE but dodge triggers', () => {
            const service = makeService([false, true]); // [enemy dodge=no, player dodge=yes]
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.STRIKE);

            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_EVADED});
            const counter = result.events.find((e) => e.type === CombatEventType.PLAYER_COUNTER);
            expect(counter).toBeUndefined();
        });

        it('emits PLAYER_EVADE_FAILED and deals damage when evade fails', () => {
            const service = makeService([false]);
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.EVADE);

            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_EVADE_FAILED});
            expect(result.events).toContainEqual({
                type: CombatEventType.PLAYER_TOOK_DAMAGE,
                damage: 8,
            });
            expect(result.playerHp).toBe(92);
            expect(result.enemyHp).toBe(100); // no player attack on EVADE
        });

        it('player does not deal damage when action is EVADE regardless of outcome', () => {
            // even when evade succeeds and counter triggers, player "attack" is 0
            // counter damage comes from EnemyAttack path, not PlayerAttack
            const service = makeService([true]);
            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.EVADE);

            const playerHit = result.events.find(
                (e) =>
                    e.type === CombatEventType.PLAYER_HIT ||
                    e.type === CombatEventType.PLAYER_PRECISE_HIT,
            );
            expect(playerHit).toBeUndefined();
        });
    });

    describe('damage calculation', () => {
        it('applies endurance reduction to incoming damage (min 1)', () => {
            const service = makeService([false, false]);
            const weakPlayer = makeChar({strength: 1});
            const tankEnemy = makeChar({endurance: 100});

            const result = service.processTurn(weakPlayer, tankEnemy, PlayerAction.STRIKE);

            const hitEvent = result.events.find(
                (e) => e.type === CombatEventType.PLAYER_HIT);
            expect(hitEvent?.damage).toBe(1);
        });

        it('uses intBetween(0, floor(strength/2)) for damage variance', () => {
            const mockRandom = {
                roll: jest.fn().mockReturnValue(false),
                intBetween: jest.fn().mockReturnValue(5),
                pick: jest.fn(),
            } as unknown as RandomService;
            const service = new CombatService(mockRandom);

            const result = service.processTurn(makeChar(), makeChar(), PlayerAction.STRIKE);

            expect((mockRandom.intBetween as jest.Mock).mock.calls[0]).toEqual([0, 5]);
            expect(result.events).toContainEqual({type: CombatEventType.PLAYER_HIT, damage: 13});
        });
    });
});