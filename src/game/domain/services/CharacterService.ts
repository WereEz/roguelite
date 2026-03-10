import {Inject, Injectable} from '@nestjs/common';
import {CharacterEntity} from '../entities/CharacterEntity';
import {CHARACTER_REPOSITORY, ICharacterRepository} from '../interfaces/ICharacterRepository';
import {RandomService} from './RandomService';

const MAX_BASE_STAT = 10;
const MIN_BASE_STAT = 5;
const ENDURANCE_HP_MULTIPLIER = 10;

@Injectable()
export class CharacterService {
    constructor(
        @Inject(CHARACTER_REPOSITORY)
        private readonly characterRepository: ICharacterRepository,
        private readonly randomService: RandomService,
    ) {}

    createCharacter(sessionId: number): Promise<CharacterEntity> {
        const strength = this.randomService.intBetween(MIN_BASE_STAT, MAX_BASE_STAT);
        const endurance = this.randomService.intBetween(MIN_BASE_STAT, MAX_BASE_STAT);
        const agility = this.randomService.intBetween(MIN_BASE_STAT, MAX_BASE_STAT);
        const maxHp = endurance * ENDURANCE_HP_MULTIPLIER;

        return this.characterRepository.create(sessionId, {
            strength,
            endurance,
            agility,
            hp: maxHp,
            maxHp,
        });
    }

    async updateHp(characterId: number, hp: number): Promise<void> {
        return this.characterRepository.updateHp(characterId, hp);
    }
}
