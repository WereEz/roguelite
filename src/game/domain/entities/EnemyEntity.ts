import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('enemies')
export class EnemyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    strength: number;

    @Column()
    endurance: number;

    @Column()
    agility: number;

    @Column()
    baseHp: number;
}
