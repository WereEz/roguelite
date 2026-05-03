import {ConfigType, registerAs} from '@nestjs/config';
import {get} from 'env-var';

export const adminConfiguration = registerAs('adminGuardConfiguration', () => ({
    token: get('ADMIN_TOKEN').required().asString(),
}));

export type AdminConfigType = ConfigType<typeof adminConfiguration>;
