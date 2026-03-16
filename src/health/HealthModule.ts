import {Module} from '@nestjs/common';
import {HealthController} from './infrastructure/controllers/HealthController';

@Module({
    controllers: [HealthController],
})
export class HealthModule {}
