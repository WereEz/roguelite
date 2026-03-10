import {RoomEntity} from '../entities/RoomEntity';
import {RoomType} from '../enums/RoomType';

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';

export interface IRoomRepository {
    createMany(sessionId: number, types: RoomType[]): Promise<RoomEntity[]>;
    findBySessionAndIndexWithRoomEnemy(
        sessionId: number,
        index: number,
    ): Promise<RoomEntity | null>;
    completeRoom(sessionId: number, index: number): Promise<void>;
}
