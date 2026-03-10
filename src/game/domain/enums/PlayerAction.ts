export enum PlayerAction {
    STRIKE = 'STRIKE',
    PRECISE_STRIKE = 'PRECISE_STRIKE',
    EVADE = 'EVADE',
}

const LABELS: Record<PlayerAction, string> = {
    [PlayerAction.STRIKE]: '⚔️ Удар',
    [PlayerAction.PRECISE_STRIKE]: '🎯 Точный удар',
    [PlayerAction.EVADE]: '🌀 Уклонение',
};

const VALUES = new Set<string>(Object.values(PlayerAction));

export function playerActionLabel(action: PlayerAction): string {
    return LABELS[action];
}

export function isValidPlayerAction(value: string): value is PlayerAction {
    return VALUES.has(value);
}
