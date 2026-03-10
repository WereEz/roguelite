import {PlayerAction} from '../../../../game/domain/enums/PlayerAction';
import {ICombatTurnResult} from './ICombatTurnResult';
import {IRoomInfoResult} from './IRoomInfoResult';
import {ISessionWithCharacter} from './ISessionWithCharacter';

export const GAME_FACADE = Symbol('GAME_FACADE');

export interface IGameFacade {
    initSession(userId: number): Promise<ISessionWithCharacter>;
    getActiveSessionWithCharacter(userId: number): Promise<ISessionWithCharacter | null>;
    getEnterRoomInfo(
        sessionId: number,
        roomIndex: number,
        playerHp: number,
        playerMaxHp: number,
    ): Promise<IRoomInfoResult | null>;
    processCombatTurn(userId: number, action: PlayerAction): Promise<ICombatTurnResult>;
}
