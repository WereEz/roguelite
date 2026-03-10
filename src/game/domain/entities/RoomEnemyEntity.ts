import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from 'typeorm';
import {RoomEntity} from './RoomEntity';
import {EnemyEntity} from './EnemyEntity';

@Entity('room_enemies')
export class RoomEnemyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    roomId: number;

    @OneToOne(() => RoomEntity)
    @JoinColumn({name: 'roomId'})
    room: Relation<RoomEntity>;

    @Column()
    enemyId: number;

    @ManyToOne(() => EnemyEntity)
    @JoinColumn({name: 'enemyId'})
    enemy: Relation<EnemyEntity>;

    @Column()
    currentHp: number;

    @Column()
    maxHp: number;
}
