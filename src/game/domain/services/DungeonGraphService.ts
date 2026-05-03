import {Injectable} from '@nestjs/common';
import {RoomType} from '../enums/RoomType';
import {RoomDirection} from '../enums/RoomDirection';
import {RandomService} from './RandomService';
import {IRoomGraphNode} from '../interfaces/IRoomGraphNode';
import {IRoomGraphConnection} from '../interfaces/IRoomGraphConnection';
import {IDungeonGraph} from '../interfaces/IDungeonGraph';

export const DUNGEON_MIDDLE_LAYER_COUNT = 2;
export const DUNGEON_MIN_ROOMS_PER_LAYER = 2;
export const DUNGEON_MAX_ROOMS_PER_LAYER = 3;

const DIRECTIONS_BY_ROOM_COUNT: Record<number, RoomDirection[]> = {
    1: [RoomDirection.CENTER],
    2: [RoomDirection.LEFT, RoomDirection.RIGHT],
    3: [RoomDirection.LEFT, RoomDirection.CENTER, RoomDirection.RIGHT],
};

@Injectable()
export class DungeonGraphService {
    private static readonly ROOM_WEIGHTS: Partial<Record<RoomType, number>> = {
        [RoomType.ENEMY]: 50,
        [RoomType.CAMPFIRE]: 25,
        [RoomType.BLOOD_ALTAR]: 12.5,
        [RoomType.ALTAR]: 12.5,
    };

    constructor(private readonly randomService: RandomService) {}

    public generate(): IDungeonGraph {
        const nodes: IRoomGraphNode[] = [];
        const connections: IRoomGraphConnection[] = [];

        const layerIndices: number[][] = [];

        for (let layer = 1; layer <= DUNGEON_MIDDLE_LAYER_COUNT; layer++) {
            const count = this.randomService.intBetween(
                DUNGEON_MIN_ROOMS_PER_LAYER,
                DUNGEON_MAX_ROOMS_PER_LAYER,
            );

            const layerStart = nodes.length;
            const indices: number[] = [];
            const directions = DIRECTIONS_BY_ROOM_COUNT[count];

            for (let i = 0; i < count; i++) {
                nodes.push({
                    type: this.randomService.weighted(DungeonGraphService.ROOM_WEIGHTS),
                    layer,
                    direction: directions[i],
                });
                indices.push(layerStart + i);
            }

            layerIndices.push(indices);
        }

        const bossIndex = nodes.length;

        nodes.push({
            type: RoomType.BOSS,
            layer: DUNGEON_MIDDLE_LAYER_COUNT + 1,
            direction: RoomDirection.CENTER,
        });
        layerIndices.push([bossIndex]);

        for (let l = 0; l < layerIndices.length - 1; l++) {
            const current = layerIndices[l];
            const next = layerIndices[l + 1];
            const added = new Set<string>();
            const connectedFromNodes = new Set<number>();

            const addConnection = (from: number, to: number) => {
                const key = `${from}-${to}`;

                if (!added.has(key)) {
                    added.add(key);
                    connectedFromNodes.add(from);
                    connections.push({fromIndex: from, toIndex: to});
                }
            };

            for (const toIdx of next) {
                const fromIdx = this.randomService.pick(current);

                addConnection(fromIdx, toIdx);
            }

            for (const fromIdx of current) {
                if (!connectedFromNodes.has(fromIdx)) {
                    const toIdx = this.randomService.pick(next);

                    addConnection(fromIdx, toIdx);
                }

                if (next.length > 1 && this.randomService.roll(0.5)) {
                    const toIdx = this.randomService.pick(next);

                    addConnection(fromIdx, toIdx);
                }
            }
        }

        return {nodes, connections};
    }
}
