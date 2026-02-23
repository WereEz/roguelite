import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation} from 'typeorm';
import {GameSessionEntity} from './GameSessionEntity';
import {EnemyEntity} from './EnemyEntity';
import {RoomType} from '../enums/RoomType';

@Entity('rooms')
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

    @Column({nullable: true})
    enemyId: number | null;

    @ManyToOne(() => EnemyEntity, {nullable: true})
    @JoinColumn({name: 'enemyId'})
    enemy: Relation<EnemyEntity> | null;

    @Column({default: false})
    isComplete: boolean;
}
