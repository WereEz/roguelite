import {Inject, Injectable} from '@nestjs/common';
import {GameSessionEntity} from '../entities/GameSessionEntity';
import {GameSessionStatus} from '../enums/GameSessionStatus';
import {
    GAME_SESSION_REPOSITORY,
    IGameSessionRepository,
} from '../interfaces/IGameSessionRepository';

@Injectable()
export class GameSessionService {
    constructor(
        @Inject(GAME_SESSION_REPOSITORY)
        private readonly gameSessionRepository: IGameSessionRepository,
    ) {}

    async createSession(userId: number): Promise<GameSessionEntity> {
        return await this.gameSessionRepository.createSession(userId);
    }

    getActiveSession(userId: number): Promise<GameSessionEntity | null> {
        return this.gameSessionRepository.findActiveSession(userId);
    }

    finishSession(
        sessionId: number,
        result: GameSessionStatus.WON | GameSessionStatus.LOST,
    ): Promise<GameSessionEntity> {
        return this.gameSessionRepository.finishSession(sessionId, result);
    }
}
