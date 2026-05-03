import {TemplateVar} from '../domain/enums/TemplateVar';
import {IStatBoost} from '../../base/domain/interfaces/game/IStatBoost';
import {boostLine} from './formatters/boost';

export type TemplateContext = Partial<Record<TemplateVar, string | number>>;

export function playerVitals(v: {hp: number; maxHp: number}): TemplateContext {
    return {
        [TemplateVar.HP]: v.hp,
        [TemplateVar.MAX_HP]: v.maxHp,
    };
}

export function enemyState(e: {
    enemyName: string;
    enemyHp: number;
    enemyMaxHp: number;
}): TemplateContext {
    return {
        [TemplateVar.ENEMY_NAME]: e.enemyName,
        [TemplateVar.ENEMY_HP]: e.enemyHp,
        [TemplateVar.ENEMY_MAX_HP]: e.enemyMaxHp,
    };
}

export function characterStats(c: {
    strength: number;
    endurance: number;
    agility: number;
}): TemplateContext {
    return {
        [TemplateVar.STRENGTH]: c.strength,
        [TemplateVar.ENDURANCE]: c.endurance,
        [TemplateVar.AGILITY]: c.agility,
    };
}

export function boostVars(boost: IStatBoost | undefined): TemplateContext {
    return {[TemplateVar.BOOST_LINE]: boostLine(boost)};
}
