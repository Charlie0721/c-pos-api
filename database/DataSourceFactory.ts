// src/database/DataSourceFactory.ts
import { DataSource } from 'typeorm';
import { baseDatabaseConfig } from './database.config';

export default async function createTypeORMConnection(
  database: string,
  schema: string
): Promise<DataSource> {
  const dataSource = new DataSource({
    ...baseDatabaseConfig,
    database,
    schema,
  });

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    await dataSource.query(`SET search_path TO "${schema}", public`);
    console.log(`📦 Connected to DB: ${database} | Schema: ${schema}`);
  }

  return dataSource;
}
