import 'reflect-metadata';
import {
    DungeonGraphService,
    DUNGEON_MIDDLE_LAYER_COUNT,
    DUNGEON_MIN_ROOMS_PER_LAYER,
    DUNGEON_MAX_ROOMS_PER_LAYER,
} from '../../game/domain/services/DungeonGraphService';
import {RandomService} from '../../game/domain/services/RandomService';
import {RoomType} from '../../game/domain/enums/RoomType';
import {RoomDirection} from '../../game/domain/enums/RoomDirection';

interface RandomOverrides {
    intBetween?: (min: number, max: number) => number;
    pick?: <T>(arr: T[]) => T;
    roll?: (chance: number) => boolean;
}

function makeService(overrides: RandomOverrides = {}): DungeonGraphService {
    const random = {
        intBetween: jest.fn(overrides.intBetween ?? ((_min: number, max: number) => max)),
        pick: jest.fn(overrides.pick ?? (<T>(arr: T[]) => arr[0])),
        roll: jest.fn(overrides.roll ?? (() => false)),
    } as unknown as RandomService;

    return new DungeonGraphService(random);
}

describe('DungeonGraphService', () => {
    describe('generate — structure', () => {
        it('produces middle layers + 1 boss layer with correct totals', () => {
            const service = makeService({intBetween: () => DUNGEON_MIN_ROOMS_PER_LAYER});
            const graph = service.generate();

            const expectedTotal = DUNGEON_MIDDLE_LAYER_COUNT * DUNGEON_MIN_ROOMS_PER_LAYER + 1;

            expect(graph.nodes).toHaveLength(expectedTotal);

            const layers = graph.nodes.map((n) => n.layer);

            expect(Math.min(...layers)).toBe(1);
            expect(Math.max(...layers)).toBe(DUNGEON_MIDDLE_LAYER_COUNT + 1);
        });

        it('places exactly one BOSS at the final layer in the CENTER', () => {
            const service = makeService();
            const graph = service.generate();

            const bosses = graph.nodes.filter((n) => n.type === RoomType.BOSS);

            expect(bosses).toHaveLength(1);
            expect(bosses[0].layer).toBe(DUNGEON_MIDDLE_LAYER_COUNT + 1);
            expect(bosses[0].direction).toBe(RoomDirection.CENTER);
        });

        it('emits only ENEMY or EMPTY rooms in middle layers', () => {
            const service = makeService();
            const graph = service.generate();

            const middleNodes = graph.nodes.filter(
                (n) => n.layer >= 1 && n.layer <= DUNGEON_MIDDLE_LAYER_COUNT,
            );

            for (const node of middleNodes) {
                expect([RoomType.ENEMY, RoomType.EMPTY]).toContain(node.type);
            }
        });

        it('respects min/max rooms per middle layer', () => {
            const service = makeService();
            const graph = service.generate();

            for (let layer = 1; layer <= DUNGEON_MIDDLE_LAYER_COUNT; layer++) {
                const count = graph.nodes.filter((n) => n.layer === layer).length;

                expect(count).toBeGreaterThanOrEqual(DUNGEON_MIN_ROOMS_PER_LAYER);
                expect(count).toBeLessThanOrEqual(DUNGEON_MAX_ROOMS_PER_LAYER);
            }
        });

        it('uses LEFT/RIGHT directions for 2-room layers', () => {
            const service = makeService({intBetween: () => 2});
            const graph = service.generate();

            const layer1 = graph.nodes.filter((n) => n.layer === 1);

            expect(layer1).toHaveLength(2);
            expect(layer1.map((n) => n.direction).sort()).toEqual(
                [RoomDirection.LEFT, RoomDirection.RIGHT].sort(),
            );
        });

        it('uses LEFT/CENTER/RIGHT directions for 3-room layers', () => {
            const service = makeService({intBetween: () => 3});
            const graph = service.generate();

            const layer1 = graph.nodes.filter((n) => n.layer === 1);

            expect(layer1).toHaveLength(3);
            expect(layer1.map((n) => n.direction).sort()).toEqual(
                [RoomDirection.LEFT, RoomDirection.CENTER, RoomDirection.RIGHT].sort(),
            );
        });
    });

    describe('generate — connectivity', () => {
        it('every middle-layer node has at least one outgoing connection', () => {
            const service = makeService();
            const graph = service.generate();

            graph.nodes.forEach((node, idx) => {
                if (node.layer > DUNGEON_MIDDLE_LAYER_COUNT) return;

                const outgoing = graph.connections.filter((c) => c.fromIndex === idx);

                expect(outgoing.length).toBeGreaterThan(0);
            });
        });

        it('every node beyond the first layer has at least one incoming connection', () => {
            const service = makeService();
            const graph = service.generate();

            graph.nodes.forEach((node, idx) => {
                if (node.layer === 1) return;

                const incoming = graph.connections.filter((c) => c.toIndex === idx);

                expect(incoming.length).toBeGreaterThan(0);
            });
        });

        it('connections only point from layer N to layer N+1', () => {
            const service = makeService();
            const graph = service.generate();

            for (const conn of graph.connections) {
                const fromLayer = graph.nodes[conn.fromIndex].layer;
                const toLayer = graph.nodes[conn.toIndex].layer;

                expect(toLayer).toBe(fromLayer + 1);
            }
        });

        it('does not produce duplicate connections even when extra-edge rolls succeed', () => {
            const service = makeService({roll: () => true});
            const graph = service.generate();

            const seen = new Set<string>();

            for (const conn of graph.connections) {
                const key = `${conn.fromIndex}-${conn.toIndex}`;

                expect(seen.has(key)).toBe(false);
                seen.add(key);
            }
        });

        it('every middle node can reach the boss', () => {
            const service = makeService();
            const graph = service.generate();
            const bossIdx = graph.nodes.findIndex((n) => n.type === RoomType.BOSS);

            const reachable = (from: number): boolean => {
                if (from === bossIdx) return true;

                return graph.connections
                    .filter((c) => c.fromIndex === from)
                    .some((c) => reachable(c.toIndex));
            };

            graph.nodes.forEach((node, idx) => {
                if (node.layer > DUNGEON_MIDDLE_LAYER_COUNT) return;

                expect(reachable(idx)).toBe(true);
            });
        });
    });
});