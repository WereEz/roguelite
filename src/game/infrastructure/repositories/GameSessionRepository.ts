import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {GameSessionEntity} from '../../domain/entities/GameSessionEntity';
import {GameSessionStatus} from '../../domain/enums/GameSessionStatus';
import {IGameSessionRepository} from '../../domain/interfaces/IGameSessionRepository';

@Injectable()
export class GameSessionRepository implements IGameSessionRepository {
    constructor(
        @InjectRepository(GameSessionEntity)
        private readonly repo: Repository<GameSessionEntity>,
    ) {}

    createSession(userId: number, totalRooms: number): Promise<GameSessionEntity> {
        const entity = this.repo.create({
            userId,
            status: GameSessionStatus.ACTIVE,
            currentRoomIndex: 0,
            totalRooms,
        });

        return this.repo.save(entity);
    }

    findActiveSessionWithCharacter(userId: number): Promise<GameSessionEntity | null> {
        return this.repo.findOne({
            where: {userId, status: GameSessionStatus.ACTIVE},
            relations: {character: true},
        });
    }

    findActiveSessionWithCharacterLocked(userId: number): Promise<GameSessionEntity | null> {
        return this.repo
            .createQueryBuilder('gs')
            .leftJoinAndSelect('gs.character', 'character')
            .where('gs.userId = :userId', {userId})
            .andWhere('gs.status = :status', {status: GameSessionStatus.ACTIVE})
            .setLock('pessimistic_write', undefined, ['gs'])
            .getOne();
    }

    async finishSession(
        sessionId: number,
        status: GameSessionStatus.WON | GameSessionStatus.LOST,
    ): Promise<void> {
        await this.repo.update(sessionId, {status});
    }

    async advanceRoom(sessionId: number): Promise<void> {
        await this.repo.increment({id: sessionId}, 'currentRoomIndex', 1);
    }
}
