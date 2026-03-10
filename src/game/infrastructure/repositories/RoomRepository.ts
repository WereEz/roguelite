import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {RoomEntity} from '../../domain/entities/RoomEntity';
import {RoomType} from '../../domain/enums/RoomType';
import {IRoomRepository} from '../../domain/interfaces/IRoomRepository';

@Injectable()
export class RoomRepository implements IRoomRepository {
    constructor(
        @InjectRepository(RoomEntity)
        private readonly repo: Repository<RoomEntity>,
    ) {}

    createMany(sessionId: number, types: RoomType[]): Promise<RoomEntity[]> {
        const entities = types.map((type, index) =>
            this.repo.create({sessionId, type, index: index + 1, isComplete: false}),
        );

        return this.repo.save(entities);
    }

    findBySessionAndIndexWithRoomEnemy(
        sessionId: number,
        index: number,
    ): Promise<RoomEntity | null> {
        return this.repo.findOne({
            where: {sessionId, index},
            relations: {roomEnemy: {enemy: true}},
        });
    }

    async completeRoom(sessionId: number, index: number): Promise<void> {
        await this.repo.update({sessionId, index}, {isComplete: true});
    }
}
