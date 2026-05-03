import {GameSessionEntity} from '../entities/GameSessionEntity';
import {RoomEntity} from '../entities/RoomEntity';
import {CharacterEntity} from '../entities/CharacterEntity';
import {IChooseRoomResult} from '../../../base/domain/interfaces/game/IChooseRoomResult';

export type IEnterRoomHandler = (
    session: GameSessionEntity,
    room: RoomEntity,
    character: CharacterEntity,
) => Promise<IChooseRoomResult>;
