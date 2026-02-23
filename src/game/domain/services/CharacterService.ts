import {Inject, Injectable} from '@nestjs/common';
import {CharacterEntity} from '../entities/CharacterEntity';
import {CHARACTER_REPOSITORY, ICharacterRepository} from '../interfaces/ICharacterRepository';

@Injectable()
export class CharacterService {
    constructor(
        @Inject(CHARACTER_REPOSITORY)
        private readonly characterRepository: ICharacterRepository,
    ) {}

    createCharacter(sessionId: number): Promise<CharacterEntity> {
        const strength = this.randomInt(5, 10);
        const endurance = this.randomInt(5, 10);
        const agility = this.randomInt(5, 10);
        const maxHp = endurance * 10;

        return this.characterRepository.create(sessionId, {
            strength,
            endurance,
            agility,
            hp: maxHp,
            maxHp,
        });
    }

    findBySessionId(sessionId: number): Promise<CharacterEntity | null> {
        return this.characterRepository.findBySessionId(sessionId);
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
