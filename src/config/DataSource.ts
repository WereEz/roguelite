import 'dotenv/config';
import {DataSource} from 'typeorm';
import {buildDataSourceOptions, databaseConfiguration} from './DatabaseConfig';

export default new DataSource(buildDataSourceOptions(databaseConfiguration()));
