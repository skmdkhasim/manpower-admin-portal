import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './entities.list';

/**
 * Used by the TypeORM CLI only (migration:generate / migration:run),
 * not by the running application (see database.module.ts for that).
 */
const AppDataSource = new DataSource({
  type: 'postgres',
  // Managed hosts (Render, Railway, ...) inject a single DATABASE_URL —
  // prefer it when present, same as database.module.ts at runtime.
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'manpower_mgmt',
      }),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
