import {
    Column,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from 'typeorm';
import {GameSessionEntity} from './GameSessionEntity';

@Entity('characters')
export class CharacterEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    sessionId: number;

    @OneToOne(() => GameSessionEntity, (s) => s.character)
    @JoinColumn({name: 'sessionId'})
    session: Relation<GameSessionEntity>;

    @Column()
    strength: number;

    @Column()
    endurance: number;

    @Column()
    agility: number;

    @Column()
    hp: number;

    @Column()
    maxHp: number;
}
