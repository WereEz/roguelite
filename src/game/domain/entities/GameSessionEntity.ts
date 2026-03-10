import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import {UserEntity} from '../../../user/domain/entities/UserEntity';
import {GameSessionStatus} from '../enums/GameSessionStatus';
import {CharacterEntity} from './CharacterEntity';

@Entity('game_sessions')
@Index('IDX_game_sessions_user_status', ['userId', 'status'])
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

    @Column({default: 0})
    totalRooms: number;

    @OneToOne(() => CharacterEntity, (c) => c.session)
    character: Relation<CharacterEntity>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
