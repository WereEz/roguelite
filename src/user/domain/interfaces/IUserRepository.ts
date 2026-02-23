import {UserEntity} from '../entities/UserEntity';
import {UserCreateDto} from '../dtos/UserCreateDto';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
    findByTelegramId(telegramId: number): Promise<UserEntity | null>;
    createUser(data: UserCreateDto): Promise<UserEntity>;
}
