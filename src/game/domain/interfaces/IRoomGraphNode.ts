import {RoomType} from '../enums/RoomType';
import {RoomDirection} from '../enums/RoomDirection';

export interface IRoomGraphNode {
    type: RoomType;
    layer: number;
    direction: RoomDirection;
}
