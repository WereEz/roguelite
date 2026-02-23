import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import {UserEntity} from '../../../user/domain/entities/UserEntity';
import {GameSessionStatus} from '../enums/GameSessionStatus';

@Entity('game_sessions')
export class GameSessionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: Relation<UserEntity>;

    @Column({type: 'enum', enum: GameSessionStatus, default: GameSessionStatus.ACTIVE})
    status: GameSessionStatus;

    @Column({default: 0})
    currentRoomIndex: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
