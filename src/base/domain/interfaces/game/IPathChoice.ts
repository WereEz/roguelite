import {RoomType} from '../../../../game/domain/enums/RoomType';
import {RoomDirection} from '../../../../game/domain/enums/RoomDirection';

export interface IPathChoice {
    roomId: number;
    type: RoomType;
    direction: RoomDirection;
}
