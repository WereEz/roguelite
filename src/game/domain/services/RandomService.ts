import {Injectable} from '@nestjs/common';

@Injectable()
export class RandomService {
    intBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    pick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    roll(chance: number): boolean {
        return Math.random() < chance;
    }

    weighted<K extends string>(weights: Partial<Record<K, number>>): K {
        const entries = Object.entries(weights) as [K, number][];
        const total = entries.reduce((sum, [, w]) => sum + w, 0);

        if (total <= 0) {
            throw new Error('weighted requires at least one positive weight');
        }

        let roll = Math.random() * total;

        for (const [key, weight] of entries) {
            roll -= weight;

            if (roll < 0) return key;
        }

        return entries[entries.length - 1][0];
    }
}
