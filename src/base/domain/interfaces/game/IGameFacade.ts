import {PlayerAction} from '../../../../game/domain/enums/PlayerAction';
import {IChooseRoomResult} from './IChooseRoomResult';
import {ICombatTurnResult} from './ICombatTurnResult';
import {IPathChoice} from './IPathChoice';
import {IRoomInfoResult} from './IRoomInfoResult';
import {ISessionWithCharacter} from './ISessionWithCharacter';

export const GAME_FACADE = Symbol('GAME_FACADE');

export interface IGameFacade {
    initSession(userId: number): Promise<ISessionWithCharacter>;
    getActiveSessionWithCharacter(userId: number): Promise<ISessionWithCharacter | null>;
    getPathChoices(sessionId: number, currentRoomId: number | null): Promise<IPathChoice[]>;
    getEnterRoomInfo(
        sessionId: number,
        roomId: number,
        playerHp: number,
        playerMaxHp: number,
    ): Promise<IRoomInfoResult | null>;
    chooseRoom(userId: number, roomId: number): Promise<IChooseRoomResult>;
    processCombatTurn(userId: number, action: PlayerAction): Promise<ICombatTurnResult>;
}
