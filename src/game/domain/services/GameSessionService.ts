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

    createSession(userId: number, totalRooms: number): Promise<GameSessionEntity> {
        return this.gameSessionRepository.createSession(userId, totalRooms);
    }

    findActiveSessionWithCharacter(userId: number): Promise<GameSessionEntity | null> {
        return this.gameSessionRepository.findActiveSessionWithCharacter(userId);
    }

    findActiveSessionWithCharacterLocked(userId: number): Promise<GameSessionEntity | null> {
        return this.gameSessionRepository.findActiveSessionWithCharacterLocked(userId);
    }

    finishSession(
        sessionId: number,
        result: GameSessionStatus.WON | GameSessionStatus.LOST,
    ): Promise<void> {
        return this.gameSessionRepository.finishSession(sessionId, result);
    }

    advanceRoom(sessionId: number): Promise<void> {
        return this.gameSessionRepository.advanceRoom(sessionId);
    }
}
