import {PlayerAction} from '../../../../game/domain/enums/PlayerAction';
import {Stat} from '../../../../game/domain/enums/Stat';
import {IChooseRoomResult} from './IChooseRoomResult';
import {ICombatTurnResult} from './ICombatTurnResult';
import {IInteractionResult} from './IInteractionResult';
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
    useAltar(userId: number, stat: Stat): Promise<IInteractionResult>;
    useBloodAltar(userId: number, stat: Stat): Promise<IInteractionResult>;
    leaveBloodAltar(userId: number): Promise<IInteractionResult>;
}
