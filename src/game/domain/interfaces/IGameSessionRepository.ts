import {GameSessionEntity} from '../entities/GameSessionEntity';
import {GameSessionStatus} from '../enums/GameSessionStatus';

export const GAME_SESSION_REPOSITORY = 'GAME_SESSION_REPOSITORY';

export interface IGameSessionRepository {
    createSession(userId: number): Promise<GameSessionEntity>;
    findActiveSessionWithCharacter(userId: number): Promise<GameSessionEntity | null>;
    findActiveSessionWithCharacterLocked(userId: number): Promise<GameSessionEntity | null>;
    finishSession(
        sessionId: number,
        status: GameSessionStatus.WON | GameSessionStatus.LOST,
    ): Promise<void>;
    setCurrentRoom(sessionId: number, roomId: number): Promise<void>;
}