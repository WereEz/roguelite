import {PlayerAction} from '../../../game/domain/enums/PlayerAction';

export const ATTACK_PREFIX = 'ATTACK';
export const NEXT_ROOM = 'NEXT_ROOM';
export const NEW_GAME = 'NEW_GAME';

export function attack(action: PlayerAction): string {
    return `${ATTACK_PREFIX}:${action}`;
}

export function isAttack(data: string): boolean {
    return data.startsWith(`${ATTACK_PREFIX}:`);
}

export function parseAction(data: string): string {
    return data.slice(ATTACK_PREFIX.length + 1);
}
