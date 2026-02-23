import {Injectable} from '@nestjs/common';
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

    async findByTelegramId(telegramId: number): Promise<UserEntity | null> {
        return await this.repo.findOne({where: {telegramId}});
    }

    async createUser(dto: UserCreateDto): Promise<UserEntity> {
        const entity = this.repo.create({
            telegramId: dto.telegramId,
            username: dto.username,
        });

        return this.repo.save(entity);
    }
}
