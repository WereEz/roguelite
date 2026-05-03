import {PlayerAction} from '../../../game/domain/enums/PlayerAction';
import {Stat} from '../../../game/domain/enums/Stat';

const SEP = ':';

export const ATTACK_PREFIX = 'ATTACK';
export const CHOOSE_PATH_PREFIX = 'CHOOSE_PATH';
export const ALTAR_PREFIX = 'ALTAR';
export const BLOOD_ALTAR_PREFIX = 'BLOOD_ALTAR';
export const LEAVE_BLOOD_ALTAR = 'LEAVE_BLOOD_ALTAR';
export const NEW_GAME = 'NEW_GAME';

function build(prefix: string, value: string | number): string {
    return `${prefix}${SEP}${value}`;
}

function startsWithPrefix(data: string, prefix: string): boolean {
    return data.startsWith(`${prefix}${SEP}`);
}

function rawAfterPrefix(data: string, prefix: string): string {
    return data.slice(prefix.length + SEP.length);
}

export function attack(action: PlayerAction): string {
    return build(ATTACK_PREFIX, action);
}

export function isAttack(data: string): boolean {
    return startsWithPrefix(data, ATTACK_PREFIX);
}

export function parseAction(data: string): string {
    return rawAfterPrefix(data, ATTACK_PREFIX);
}

export function choosePath(roomId: number): string {
    return build(CHOOSE_PATH_PREFIX, roomId);
}

export function isChoosePath(data: string): boolean {
    return startsWithPrefix(data, CHOOSE_PATH_PREFIX);
}

export function parseRoomId(data: string): number {
    return parseInt(rawAfterPrefix(data, CHOOSE_PATH_PREFIX), 10);
}

export function altar(stat: Stat): string {
    return build(ALTAR_PREFIX, stat);
}

export function isAltar(data: string): boolean {
    return startsWithPrefix(data, ALTAR_PREFIX);
}

export function parseAltarStat(data: string): string {
    return rawAfterPrefix(data, ALTAR_PREFIX);
}

export function bloodAltar(stat: Stat): string {
    return build(BLOOD_ALTAR_PREFIX, stat);
}

export function isBloodAltar(data: string): boolean {
    return startsWithPrefix(data, BLOOD_ALTAR_PREFIX);
}

export function parseBloodAltarStat(data: string): string {
    return rawAfterPrefix(data, BLOOD_ALTAR_PREFIX);
}
