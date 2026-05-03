import {Stat} from '../enums/Stat';

export interface ICharacterStatUpdate {
    stat: Stat;
    delta: number;
    hpDelta?: number;
    maxHpDelta?: number;
}
