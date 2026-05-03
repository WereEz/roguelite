import {Stat} from '../../../../game/domain/enums/Stat';

export interface IStatBoost {
    stat: Stat;
    statDelta: number;
    hpDelta: number;
    maxHpDelta: number;
}
