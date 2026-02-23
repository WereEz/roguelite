import {Injectable, NotFoundException} from '@nestjs/common';
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

    createSession(userId: number): Promise<GameSessionEntity> {
        const entity = this.repo.create({
            userId,
            status: GameSessionStatus.ACTIVE,
            currentRoomIndex: 0,
        });

        return this.repo.save(entity);
    }

    findActiveSession(userId: number): Promise<GameSessionEntity | null> {
        return this.repo.findOne({where: {userId, status: GameSessionStatus.ACTIVE}});
    }

    async finishSession(
        sessionId: number,
        status: GameSessionStatus.WON | GameSessionStatus.LOST,
    ): Promise<GameSessionEntity> {
        const entity = await this.repo.findOne({where: {id: sessionId}});

        if (!entity) {
            throw new NotFoundException(`GameSession ${sessionId} not found.`);
        }

        entity.status = status;

        return this.repo.save(entity);
    }
}
