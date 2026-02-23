import {CombatEventType} from '../enums/CombatEventType';

export class CombatEventDto {
    type: CombatEventType;
    damage?: number;
}
