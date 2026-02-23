import {Inject, Injectable, NotFoundException} from '@nestjs/common';
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

    getRooms(sessionId: number): Promise<RoomEntity[]> {
        return this.roomRepository.findBySessionId(sessionId);
    }

    async getRoomByIndex(sessionId: number, index: number): Promise<RoomEntity> {
        const room = await this.roomRepository.findBySessionAndIndex(sessionId, index);

        if (!room) {
            throw new NotFoundException(`Room in ${sessionId} and ${index} not found`);
        }

        return room;
    }

    async completeRoom(sessionId: number, index: number): Promise<void> {
        const room = await this.roomRepository.findBySessionAndIndex(sessionId, index);

        if (!room) {
            throw new NotFoundException(`Room in ${sessionId} and ${index} not found`);
        }

        await this.roomRepository.completeRoom(room.id);
    }
}
