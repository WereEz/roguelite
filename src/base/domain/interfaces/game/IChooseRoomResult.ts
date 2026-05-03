import {RoomType} from '../../../../game/domain/enums/RoomType';
import {IBloodAltarState} from './IBloodAltarState';
import {IPathChoice} from './IPathChoice';
import {IRoomInfoResult} from './IRoomInfoResult';

export interface IChooseRoomResult {
    roomType: RoomType;
    roomId: number;
    hp: number;
    maxHp: number;
    enemyInfo?: IRoomInfoResult;
    pathChoices: IPathChoice[];
    bloodAltarState?: IBloodAltarState;
    healedAmount?: number;
}
