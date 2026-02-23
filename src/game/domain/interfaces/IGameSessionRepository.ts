import {GameSessionEntity} from '../entities/GameSessionEntity';
import {GameSessionStatus} from '../enums/GameSessionStatus';

export const GAME_SESSION_REPOSITORY = 'GAME_SESSION_REPOSITORY';

export interface IGameSessionRepository {
    createSession(userId: number): Promise<GameSessionEntity>;
    findActiveSession(userId: number): Promise<GameSessionEntity | null>;
    finishSession(
        sessionId: number,
        status: GameSessionStatus.WON | GameSessionStatus.LOST,
    ): Promise<GameSessionEntity>;
}
