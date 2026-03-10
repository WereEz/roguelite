import {Inject, Injectable} from '@nestjs/common';
import {RoomEntity} from '../entities/RoomEntity';
import {RoomType} from '../enums/RoomType';
import {ROOM_REPOSITORY, IRoomRepository} from '../interfaces/IRoomRepository';

@Injectable()
export class RoomService {
    constructor(
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    generateForSession(sessionId: number, types: RoomType[]): Promise<RoomEntity[]> {
        return this.roomRepository.createMany(sessionId, types);
    }

    getRoomByIndexWithRoomEnemy(sessionId: number, index: number): Promise<RoomEntity | null> {
        return this.roomRepository.findBySessionAndIndexWithRoomEnemy(sessionId, index);
    }

    async completeRoom(sessionId: number, index: number): Promise<void> {
        await this.roomRepository.completeRoom(sessionId, index);
    }
}
