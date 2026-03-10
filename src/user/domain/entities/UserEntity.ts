import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'bigint',
        unique: true,
        transformer: {to: (v: number) => v, from: (v: string) => Number(v)},
    })
    telegramId: number;

    @Column({nullable: true})
    username: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
