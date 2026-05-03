import {statLabel} from '../../../game/domain/enums/Stat';
import {IStatBoost} from '../../../base/domain/interfaces/game/IStatBoost';

export function boostLine(boost: IStatBoost | undefined): string {
    if (!boost) return '';

    const parts = [`${statLabel(boost.stat)} +${boost.statDelta}`];

    if (boost.maxHpDelta) {
        parts.push(`+${boost.maxHpDelta} макс. ОЗ`);
    }

    return `${parts.join(', ')}.`;
}
