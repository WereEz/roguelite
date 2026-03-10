import {CombatEventDto} from '../../../game/domain/dtos/CombatEventDto';
import {CombatEventType} from '../../../game/domain/enums/CombatEventType';

export const CombatEventLabels: Record<CombatEventType, (event: CombatEventDto) => string> = {
    [CombatEventType.PLAYER_HIT]: (e) => `⚔️ Вы нанесли ${e.damage} урона`,
    [CombatEventType.PLAYER_PRECISE_HIT]: (e) => `🎯 Точный удар: ${e.damage} урона`,
    [CombatEventType.PLAYER_MISS]: () => `💨 Ваша атака прошла мимо`,
    [CombatEventType.PLAYER_TOOK_DAMAGE]: (e) => `💥 Вы получили ${e.damage} урона`,
    [CombatEventType.PLAYER_EVADED]: () => `🌀 Вы уклонились от атаки!`,
    [CombatEventType.PLAYER_EVADE_FAILED]: () => `❌ Уклониться не удалось!`,
    [CombatEventType.PLAYER_COUNTER]: (e) => `↩️ Контратака: ${e.damage} урона`,
};
