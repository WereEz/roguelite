import {PlayerAction} from '../../../game/domain/enums/PlayerAction';

export const ATTACK_PREFIX = 'ATTACK';
export const CHOOSE_PATH_PREFIX = 'CHOOSE_PATH';
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

export function choosePath(roomId: number): string {
    return `${CHOOSE_PATH_PREFIX}:${roomId}`;
}

export function isChoosePath(data: string): boolean {
    return data.startsWith(`${CHOOSE_PATH_PREFIX}:`);
}

export function parseRoomId(data: string): number {
    return parseInt(data.slice(CHOOSE_PATH_PREFIX.length + 1), 10);
}