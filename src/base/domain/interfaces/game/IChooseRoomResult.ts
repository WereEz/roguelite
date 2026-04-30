import {RoomType} from '../../../../game/domain/enums/RoomType';
import {IPathChoice} from './IPathChoice';
import {IRoomInfoResult} from './IRoomInfoResult';

export interface IChooseRoomResult {
    roomType: RoomType;
    layer: number;
    playerHp: number;
    playerMaxHp: number;
    enemyInfo?: IRoomInfoResult;
    pathChoices: IPathChoice[];
}
