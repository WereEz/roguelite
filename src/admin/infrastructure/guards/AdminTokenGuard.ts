import {CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {Request} from 'express';
import {adminConfiguration, AdminConfigType} from '../../../config/AdminConfig';

@Injectable()
export class AdminTokenGuard implements CanActivate {
    constructor(
        @Inject(adminConfiguration.KEY)
        private readonly config: AdminConfigType,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token || token !== this.config.token) {
            throw new UnauthorizedException('Invalid admin token');
        }

        return true;
    }

    private extractToken(request: Request): string | null {
        const header = request.headers.authorization;

        if (!header) {
            return null;
        }

        const [scheme, value] = header.split(' ');

        if (scheme !== 'Bearer' || !value) {
            return null;
        }

        return value;
    }
}
