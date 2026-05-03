import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {RoomConnectionEntity} from '../../domain/entities/RoomConnectionEntity';
import {RoomEntity} from '../../domain/entities/RoomEntity';
import {IRoomRepository} from '../../domain/interfaces/IRoomRepository';
import {IRoomGraphNode} from '../../domain/interfaces/IRoomGraphNode';
import {IRoomGraphConnection} from '../../domain/interfaces/IRoomGraphConnection';

@Injectable()
export class RoomRepository implements IRoomRepository {
    constructor(
        @InjectRepository(RoomEntity)
        private readonly repo: Repository<RoomEntity>,
        @InjectRepository(RoomConnectionEntity)
        private readonly connectionRepo: Repository<RoomConnectionEntity>,
    ) {}

    async createGraph(
        sessionId: number,
        nodes: IRoomGraphNode[],
        connections: IRoomGraphConnection[],
    ): Promise<RoomEntity[]> {
        const entities = nodes.map((node) =>
            this.repo.create({
                sessionId,
                type: node.type,
                layer: node.layer,
                direction: node.direction,
                isComplete: false,
            }),
        );

        const saved = await this.repo.save(entities);

        const connectionEntities = connections.map((c) =>
            this.connectionRepo.create({
                fromRoomId: saved[c.fromIndex].id,
                toRoomId: saved[c.toIndex].id,
            }),
        );

        await this.connectionRepo.save(connectionEntities);

        return saved;
    }

    findByIdWithRoomEnemy(roomId: number): Promise<RoomEntity | null> {
        return this.repo.findOne({
            where: {id: roomId},
            relations: {roomEnemy: {enemy: true}},
        });
    }

    async findByIdWithRoomEnemyIfReachable(
        roomId: number,
        sessionId: number,
        currentRoomId: number | null,
    ): Promise<RoomEntity | null> {
        const qb = this.repo
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.roomEnemy', 're')
            .leftJoinAndSelect('re.enemy', 'e')
            .where('r.id = :roomId AND r.sessionId = :sessionId', {roomId, sessionId});

        if (currentRoomId === null) {
            qb.andWhere('r.layer = 1');
        } else {
            qb.innerJoin(
                RoomConnectionEntity,
                'rc',
                'rc.toRoomId = r.id AND rc.fromRoomId = :currentRoomId',
                {currentRoomId},
            );
            qb.innerJoin(
                RoomEntity,
                'from_room',
                'from_room.id = :currentRoomId AND from_room.sessionId = :sessionId',
            );
        }

        return qb.getOne();
    }

    findFirstLayerRooms(sessionId: number): Promise<RoomEntity[]> {
        return this.repo.find({where: {sessionId, layer: 1}});
    }

    async findNextRooms(roomId: number): Promise<RoomEntity[]> {
        const connections = await this.connectionRepo.find({
            where: {fromRoomId: roomId},
            relations: {toRoom: true},
        });

        return connections.map((c) => c.toRoom);
    }

    async completeRoom(roomId: number): Promise<void> {
        await this.repo.update({id: roomId, isComplete: false}, {isComplete: true});
    }

    async incrementInteractionCount(roomId: number): Promise<void> {
        await this.repo.increment({id: roomId}, 'interactionCount', 1);
    }
}
