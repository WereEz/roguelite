import 'dotenv/config';
import {DataSource} from 'typeorm';
import {buildDatabaseConfig} from './DatabaseConfig';

export default new DataSource(buildDatabaseConfig());
