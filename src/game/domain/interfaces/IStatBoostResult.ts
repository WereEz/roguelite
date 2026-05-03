import {ICharacterStats} from './ICharacterStats';

export interface IStatBoostResult {
    stats: ICharacterStats;
    statDelta: number;
    hpDelta: number;
    maxHpDelta: number;
}
