import {Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation} from 'typeorm';
import {RoomEntity} from './RoomEntity';

@Entity('room_connections')
export class RoomConnectionEntity {
    @PrimaryColumn()
    fromRoomId: number;

    @PrimaryColumn()
    toRoomId: number;

    @ManyToOne(() => RoomEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'fromRoomId'})
    fromRoom: Relation<RoomEntity>;

    @ManyToOne(() => RoomEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'toRoomId'})
    toRoom: Relation<RoomEntity>;
}
