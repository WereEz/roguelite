import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from 'typeorm';
import {GameSessionEntity} from './GameSessionEntity';
import {RoomEnemyEntity} from './RoomEnemyEntity';
import {RoomType} from '../enums/RoomType';
import {RoomDirection} from '../enums/RoomDirection';

@Entity('rooms')
@Index('IDX_rooms_session_layer', ['sessionId', 'layer'])
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sessionId: number;

    @ManyToOne(() => GameSessionEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'sessionId'})
    session: Relation<GameSessionEntity>;

    @Column()
    layer: number;

    @Column({type: 'enum', enum: RoomType})
    type: RoomType;

    @Column({type: 'enum', enum: RoomDirection})
    direction: RoomDirection;

    @OneToOne(() => RoomEnemyEntity, (re) => re.room, {nullable: true})
    roomEnemy: Relation<RoomEnemyEntity> | null;

    @Column({default: false})
    isComplete: boolean;
}