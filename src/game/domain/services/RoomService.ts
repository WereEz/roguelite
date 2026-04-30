import {Inject, Injectable} from '@nestjs/common';
import {RoomEntity} from '../entities/RoomEntity';
import {ROOM_REPOSITORY, IRoomRepository} from '../interfaces/IRoomRepository';
import {IDungeonGraph} from '../interfaces/IDungeonGraph';

@Injectable()
export class RoomService {
    constructor(
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    generateGraph(sessionId: number, graph: IDungeonGraph): Promise<RoomEntity[]> {
        return this.roomRepository.createGraph(sessionId, graph.nodes, graph.connections);
    }

    findByIdWithRoomEnemy(roomId: number): Promise<RoomEntity | null> {
        return this.roomRepository.findByIdWithRoomEnemy(roomId);
    }

    findByIdWithRoomEnemyIfReachable(
        roomId: number,
        sessionId: number,
        currentRoomId: number | null,
    ): Promise<RoomEntity | null> {
        return this.roomRepository.findByIdWithRoomEnemyIfReachable(roomId, sessionId, currentRoomId);
    }

    findFirstLayerRooms(sessionId: number): Promise<RoomEntity[]> {
        return this.roomRepository.findFirstLayerRooms(sessionId);
    }

    findNextRooms(roomId: number): Promise<RoomEntity[]> {
        return this.roomRepository.findNextRooms(roomId);
    }

    async completeRoom(roomId: number): Promise<void> {
        await this.roomRepository.completeRoom(roomId);
    }
}
