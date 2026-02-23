import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {UserEntity} from '../../domain/entities/UserEntity';
import {IUserRepository} from '../../domain/interfaces/IUserRepository';
import {UserCreateDto} from '../../domain/dtos/UserCreateDto';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>,
    ) {}

    async findByTelegramId(telegramId: number): Promise<UserEntity> {
        const entity = await this.repo.findOne({where: {telegramId}});

        if (!entity) {
            throw new NotFoundException(`User by telegramId: ${telegramId} not found.`);
        }

        return entity;
    }

    async createUser(dto: UserCreateDto): Promise<UserEntity> {
        const entity = this.repo.create({
            telegramId: dto.telegramId,
            username: dto.username,
        });

        return this.repo.save(entity);
    }
}
