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
}
