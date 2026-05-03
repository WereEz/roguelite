export const STAT_CONFIG = {
    STRENGTH: {label: 'Сила', column: 'strength', hpPerPoint: 0},
    ENDURANCE: {label: 'Выносливость', column: 'endurance', hpPerPoint: 10},
    AGILITY: {label: 'Ловкость', column: 'agility', hpPerPoint: 0},
} as const;

export type Stat = keyof typeof STAT_CONFIG;
export type StatColumn = (typeof STAT_CONFIG)[Stat]['column'];

export const STATS = Object.keys(STAT_CONFIG) as Stat[];

export function statLabel(stat: Stat): string {
    return STAT_CONFIG[stat].label;
}

export function statColumn(stat: Stat): StatColumn {
    return STAT_CONFIG[stat].column;
}

export function statHpPerPoint(stat: Stat): number {
    return STAT_CONFIG[stat].hpPerPoint;
}

export function isValidStat(value: string): value is Stat {
    return Object.hasOwn(STAT_CONFIG, value);
}
