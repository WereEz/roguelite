import {Inject, Injectable} from '@nestjs/common';
import {IUserRepository, USER_REPOSITORY} from '../interfaces/IUserRepository';
import {UserCreateDto} from '../dtos/UserCreateDto';
import {UserEntity} from '../entities/UserEntity';

@Injectable()
export class UserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async findByTelegramId(telegramId: number): Promise<UserEntity | null> {
        return this.userRepository.findByTelegramId(telegramId);
    }

    async createUser(dto: UserCreateDto): Promise<UserEntity> {
        return this.userRepository.createUser(dto);
    }

    async findOrCreate(dto: UserCreateDto): Promise<UserEntity> {
        const existing = await this.userRepository.findByTelegramId(dto.telegramId);

        if (existing) {
            return existing;
        }

        return this.userRepository.createUser({
            telegramId: dto.telegramId,
            username: dto.username,
        });
    }
}
