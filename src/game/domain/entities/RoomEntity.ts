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

@Entity('rooms')
@Index('IDX_rooms_session_index', ['sessionId', 'index'])
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sessionId: number;

    @ManyToOne(() => GameSessionEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'sessionId'})
    session: Relation<GameSessionEntity>;

    @Column()
    index: number;

    @Column({type: 'enum', enum: RoomType})
    type: RoomType;

    @OneToOne(() => RoomEnemyEntity, (re) => re.room, {nullable: true})
    roomEnemy: Relation<RoomEnemyEntity> | null;

    @Column({default: false})
    isComplete: boolean;
}
