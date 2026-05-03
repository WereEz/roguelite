import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {adminConfiguration} from '../config/AdminConfig';
import {AdminTokenGuard} from './infrastructure/guards/AdminTokenGuard';

@Module({
    imports: [ConfigModule.forFeature(adminConfiguration)],
    providers: [AdminTokenGuard],
    exports: [AdminTokenGuard],
})
export class AdminModule {}
