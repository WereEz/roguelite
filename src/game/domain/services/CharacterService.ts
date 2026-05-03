import {Inject, Injectable} from '@nestjs/common';
import {CharacterEntity} from '../entities/CharacterEntity';
import {CHARACTER_REPOSITORY, ICharacterRepository} from '../interfaces/ICharacterRepository';
import {ICharacterStats} from '../interfaces/ICharacterStats';
import {ICombatantStats} from '../interfaces/ICombatantStats';
import {IStatBoostResult} from '../interfaces/IStatBoostResult';
import {RandomService} from './RandomService';
import {Stat, STATS, statColumn, statHpPerPoint} from '../enums/Stat';

const MAX_BASE_STAT = 10;
const MIN_BASE_STAT = 5;

@Injectable()
export class CharacterService {
    constructor(
        @Inject(CHARACTER_REPOSITORY)
        private readonly characterRepository: ICharacterRepository,
        private readonly randomService: RandomService,
    ) {}

    createCharacter(sessionId: number): Promise<CharacterEntity> {
        const stats = {
            strength: this.randomService.intBetween(MIN_BASE_STAT, MAX_BASE_STAT),
            endurance: this.randomService.intBetween(MIN_BASE_STAT, MAX_BASE_STAT),
            agility: this.randomService.intBetween(MIN_BASE_STAT, MAX_BASE_STAT),
        };

        const maxHp = STATS.reduce(
            (sum, stat) => sum + stats[statColumn(stat)] * statHpPerPoint(stat),
            0,
        );

        return this.characterRepository.create(sessionId, {...stats, hp: maxHp, maxHp});
    }

    async updateHp(characterId: number, hp: number): Promise<void> {
        return this.characterRepository.updateHp(characterId, hp);
    }

    toCombatantStats(character: CharacterEntity): ICombatantStats {
        return {
            hp: character.hp,
            strength: character.strength,
            endurance: character.endurance,
            agility: character.agility,
        };
    }

    async boostStat(
        current: ICharacterStats,
        characterId: number,
        stat: Stat,
        delta: number,
    ): Promise<IStatBoostResult> {
        const hpDelta = statHpPerPoint(stat) * delta;
        const column = statColumn(stat);

        await this.characterRepository.applyStatChange(characterId, {
            stat,
            delta,
            hpDelta,
            maxHpDelta: hpDelta,
        });

        return {
            stats: {
                ...current,
                [column]: current[column] + delta,
                hp: current.hp + hpDelta,
                maxHp: current.maxHp + hpDelta,
            },
            statDelta: delta,
            hpDelta,
            maxHpDelta: hpDelta,
        };
    }
}
