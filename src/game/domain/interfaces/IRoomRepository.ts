import {RoomEntity} from '../entities/RoomEntity';
import {IRoomGraphNode} from './IRoomGraphNode';
import {IRoomGraphConnection} from './IRoomGraphConnection';

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';

export interface IRoomRepository {
    createGraph(
        sessionId: number,
        nodes: IRoomGraphNode[],
        connections: IRoomGraphConnection[],
    ): Promise<RoomEntity[]>;
    findByIdWithRoomEnemy(roomId: number): Promise<RoomEntity | null>;
    findByIdWithRoomEnemyIfReachable(
        roomId: number,
        sessionId: number,
        currentRoomId: number | null,
    ): Promise<RoomEntity | null>;
    findFirstLayerRooms(sessionId: number): Promise<RoomEntity[]>;
    findNextRooms(roomId: number): Promise<RoomEntity[]>;
    completeRoom(roomId: number): Promise<void>;
}
