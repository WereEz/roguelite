import {CombatEventDto} from '../../../game/domain/dtos/CombatEventDto';
import {CombatEventLabels} from '../../domain/constants/CombatEventLabels';

export function formatCombatEvents(events: CombatEventDto[]): string {
    return events.map((e) => CombatEventLabels[e.type](e)).join('\n');
}
